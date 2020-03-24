const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");

const authRouter = require("../auth/router");
const usersRouter = require("../users/users-router.js");
const restricted = require("../auth/restricted-middleware");

const server = express();

const sessionConfig = {
  name: "monster",
  secret: "keep it secret, keep it safe!",
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, //true in production, send only over https
    httpOnly: true //no access from JS, safe from extensions
  },
  resave: false,
  saveUninitialized: true // GDPR require to check with client
};
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/users", restricted, checkDepartment("none"), usersRouter);
server.use("/api/auth", authRouter);
server.get("/", (req, res) => {
  res.json({ api: "up" });
});
function checkDepartment(department) {
  return (req, res, next) => {
    if (
      req.decodedToken &&
      req.decodedToken.department &&
      req.decodedToken.department.toLowerCase() === department
    ) {
      next();
    } else {
      res.status(403).json({ message: "i dont know you" });
    }
  };
}
module.exports = server;
