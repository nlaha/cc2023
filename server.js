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
      profile_pic: user.photos ? user.photos[0] : null,
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
//Get user
app.get("/user", secured, async (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;

  res.json(userProfile);
});

app.get("/api/stats", secured, async (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
  // get total enrolled classes
  const enrolledClasses = await prisma.usersInClasses.count({
    where: { userId: userProfile.lms.id },
  });

  res.json({
    enrolledClasses: enrolledClasses,
  });
});

app.post("/api/assignments/get", secured, async (req, res, next) => {
  // get assignments for class
  let assignments = await prisma.assignment.findMany({
    where: { classId: Number(req.body.classId) },
  });

  assignments = assignments.map((assignment) => {
    return {
      ...assignment,
      due: assignment.dueDate.toISOString().split("T")[0],
      points: assignment.pointsWorth,
      points_total: assignment.pointsWorth,
      submitted: false,
    };
  });
  res.json(assignments);
});

//Post/Add Assignment
app.post("/api/assignments/add", secured, async (req, res, next) => {
  var enrolling_user = await prisma.user.findFirst({
    where: { oauth_id: req.user.id },
  });

  // make sure user is instructor in class
  const userInClass = await prisma.usersInClasses.count({
    where: {
      userId: enrolling_user.id,
      classId: Number(req.body.classId),
      isInstructor: true,
    },
  });

  if (userInClass === 0) {
    return res.status(401).json({
      error: "User is not an instructor in this class",
    });
  }

  const new_assignment = await prisma.assignment.create({
    data: {
      name: req.body.name,
      pointsWorth: req.body.points,
      description: req.body.description,
      dueDate: req.body.due,
      class: {
        connect: {
          id: Number(req.body.classId),
        },
      },
    },
  });

  res.json(new_assignment);
});
// If either of the end points between lines 128 - 135 do not work, just comment all of it out
// Updates an Assignment's Description| I don't know if this works to be entirely honest
app.post(
  "/api/assignment/change_Description",
  school_admin_only,
  async (req, res) => {
    //console.log(req.bod);
    console.log(req.bod);
    const new_description = await prisma.assignment.update({
      where: { id: req.body.id },
      update: { description: req.body.description },
    });
  }
);

//Get all classes
app.post("/api/classes/getall", secured, async (req, res, next) => {
  const total = await prisma.class.count();
  let classes = await prisma.class.findMany({
    skip: req.body.skip || 0,
    take: req.body.take || 10,
  });
  res.json({
    results: classes,
    num_pages: Math.ceil(total / (req.body.take || 10)),
  });
});
//Get a signular class
app.post("/api/classes/get", secured, async (req, res, next) => {
  const classes = await prisma.class.findUnique({
    where: {
      id: Number(req.body.id),
    },
  });
  res.json(classes);
});

// Get students in a class
app.post("/api/classes/students", secured, async (req, res, next) => {
  const students = await prisma.class
    .findUnique({
      where: {
        id: Number(req.body.id),
      },
    })
    .students();

  // get user info for each student
  const student_info = await Promise.all(
    students.map(async (student) => {
      return await prisma.user.findUnique({
        where: {
          id: student.userId,
        },
      });
    })
  );

  res.json(student_info);
});

//Post/Add a class
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

  res.json(new_class);
});

// assumes user exists (this also probably doesnt work - needs to be tested)
app.post("/api/classes/enroll", async (req, res) => {
  var enrolling_user = await prisma.user.findFirst({
    where: { oauth_id: req.user.id },
  });

  let already_enrolled = await prisma.usersInClasses.count({
    where: {
      userId: enrolling_user.id,
      classId: Number(req.body.id),
    },
  });

  if (!already_enrolled) {
    // enroll the user in the class
    var enrolled_class = await prisma.class.update({
      where: { number: req.body.number },
      data: {
        students: {
          create: {
            user: {
              connect: {
                id: enrolling_user.id,
              },
            },
          },
        },
      },
    });

    console.log("Enrolled user in class: " + req.body.number);
    return res.json(enrolled_class);
  } else {
    console.log("User already enrolled in class: " + req.body.number);
    return res.status(400).json({ error: "User already enrolled in class" });
  }
});

app.post("/api/classes/is_instructor", secured, async (req, res, next) => {
  var enrolling_user = await prisma.user.findFirst({
    where: { oauth_id: req.user.id },
  });
  const classes = await prisma.usersInClasses.count({
    where: {
      userId: enrolling_user.id,
      classId: Number(req.body.id),
      isInstructor: true,
    },
  });

  if (classes > 0) {
    res.json({ is_instructor: true });
  } else {
    res.json({ is_instructor: false });
  }
});

app.post(
  "/api/classes/add_instructor",
  school_admin_only,
  async (req, res, next) => {
    var enrolling_user = await prisma.user.findFirst({
      where: { email: req.user.email },
    });
    const classes = await prisma.usersInClasses.update({
      where: {
        userId_classId: {
          userId: enrolling_user.id,
          classId: Number(req.body.id),
        },
      },
      data: {
        isInstructor: true,
      },
    });

    res.status(200);
  }
);

// drops a user from a course
app.post("/api/classes/drop", async (req, res) => {
  // get user
  const user = await prisma.user.findUnique({
    where: { oauth_id: req.user.id },
  });

  await prisma.usersInClasses.delete({
    where: {
      userId_classId: {
        userId: user.id,
        classId: req.body.id,
      },
    },
  });

  console.log("Dropped user from class: " + req.body.id);
  return res.status(200);
});

// gets the classes a user is enrolled in
app.get("/api/enrolled_classes", async (req, res) => {
  const user_classes = await prisma.class.findMany({
    where: {
      students: {
        some: {
          user: {
            oauth_id: req.user.id,
          },
        },
      },
    },
  });
  res.json(user_classes);
});

// get classes w/ regex and search class number
app.post("/api/classes/search", async (req, res) => {
  var query_string = req.body.query_string.trim();
  console.log("Searching for classes with query: " + query_string);
  const query = {
    OR: [
      {
        name: {
          contains: query_string,
        },
      },
      {
        number: {
          contains: query_string,
        },
      },
    ],
  };

  const total_matching_classes = await prisma.class.count({
    where: query,
  });
  let matching_classes = await prisma.class.findMany({
    skip: req.body.skip || 0,
    take: req.body.take || 10,
    where: query,
  });
  console.log("Found " + matching_classes.length + " classes");
  res.json({
    results: matching_classes,
    num_pages: Math.ceil(total_matching_classes / (req.body.take || 10)),
  });
});

// // currently doesn't check for duplicates - I'll fix later
// app.post("/api/assignments/add", async (req, res) => {
//   const getCourse = await prisma.class.findFirst({
//     where: {
//       AND: [
//         { name: { contains: req.body.course_name } },
//         { number: { contains: req.body.course_number } },
//       ],
//     },
//   });
//   if (getCourse == undefined) {
//     throw new Error("Could not find a matching course");
//   }
//   const createAssignment = await prisma.assignment.create({
//     name: req.body.name,
//     description: req.body.description,
//     pointsWorth: req.body.points_worth,
//     data: {
//       class: {
//         create: {
//           class: {
//             connect: {
//               id: getCourse.id,
//             },
//           },
//         },
//       },
//     },
//   });

//   res.json(createAssignment);
// });

// gets a users grade for a given assignment
app.post("/api/grades/get_assignment_grade", async (req, res) => {
  throw new Error("Not Implemented"); // can't implement this until assignments can be added
  /*
  var assignment_description = req.body.description || "";
  var assignment_name = req.body.name || "";
  var user = req.user.id;
  // lots of improvements to be made here
  const associated_assignment = await prisma.assignment.findFirst({
    where: {
      name: { contains: assignment_name},
      OR: {
        assignment_description: {contains: assignment_description}
      }
    },
  });
  console.log("Found Assignment: " + associated_assignment.id);
  
  const associated_user = await prisma.user.findFirst({
    where: {
      oauth_id: user
    }
  });
  console.log("Found a User with id " + associated_user.id)
  res.json(associated_assignment);
  */
});

app.set("trust proxy", 1);

// handles react routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`React app running on ${process.env.PUBLIC_URL}`);
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
