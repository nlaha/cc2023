// database
var crypto = require("crypto");
var sqlite3 = require("sqlite3");
var mkdirp = require("mkdirp");

mkdirp.sync("./db");

var db = new sqlite3.Database("./db/db.db");

db.serialize(function () {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT,
    "password" TEXT,
    "salt" TEXT
  )`
  );
});

module.exports = db;
