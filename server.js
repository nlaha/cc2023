const express = require("express");
const path = require("path");

const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

require("dotenv").config();

const authRouter = require("./auth");

const app = express();
const port = process.env.PORT || "3000";

var SQLiteStore = require("connect-sqlite3")(expressSession);

// set up our ORM
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const session = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: "sessions.db", dir: "./db" }),
};

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}

app.use(express.static(path.join(__dirname, "client/build")));

app.use(express.json());

app.use(expressSession(session));

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.PUBLIC_URL + process.env.AUTH0_CALLBACK_URL,
    authRequired: false,
    auth0Logout: true,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(async (user, done) => {
  const lms_user = await prisma.user.upsert({
    where: { oauth_id: user.id || 0 },
    update: {},
    create: {
      oauth_id: user.id,
      email: user.emails[0].value,
      name: user.displayName,
      is_school_admin:
        false || user.emails[0].value === process.env.ADMIN_EMAIL,
    },
  });
  user.lms = lms_user;
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  const lms_user = await prisma.user.findUnique({
    where: {
      oauth_id: user.id,
    },
  });
  user.lms = lms_user;
  console.log(user.lms);
  done(null, user);
});

app.use("/", authRouter);

// These routes require the user to log in
const secured = (req, res, next) => {
  if (req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

const school_admin_only = (req, res, next) => {
  if (req.user && req.user.lms.is_school_admin) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

app.get("/user", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.json(userProfile);
});

app.get("/api/classes/getall", secured, async (req, res, next) => {
  const classes = await prisma.class.findMany();
  res.json(classes);
});

app.get("/api/classes/get", secured, async (req, res, next) => {
  const classes = await prisma.class.findMany({
    where: {
      number: req.query.number,
    },
  });
  res.json(classes);
});

app.post("/api/classes/add", school_admin_only, async (req, res, next) => {
  console.log(req.body);
  const new_class = await prisma.class.upsert({
    where: { number: req.body.number.toString() }, //finds object in database that's equal to class number already passed
    update: {},
    create: {
      number: req.body.number.toString(),
      name: req.body.name.toString(),
      enrolled: Number(req.body.enrolled || 0),
      capacity: Number(req.body.capacity),
    },
  });
  res.status(200);
});

// gets the classes a user is enrolled in
app.get("/api/enrolled_classes", async (req, res) => {
  var user_id = parseInt(req.query.id);
  const user_classes = await prisma.class.findMany({
    where: { students: { some: {id : user_id}}}
  });
  res.json(user_classes);

});

// get classes w/ regex and search class number
// NOTE: might be better to make this a POST 
app.get("/api/classes/search", async(req, res) => {
  var query_string = req.query.query_string;
  const matching_classes = await prisma.class.findMany({
    where: {name: {contains: query_string}}
  });
  res.json(matching_classes);
})

// 




app.set("trust proxy", 1);

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`React app running on ${process.env.PUBLIC_URL}`);
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
