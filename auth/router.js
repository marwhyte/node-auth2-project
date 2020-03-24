const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("../config/secrets");
const Users = require("../users/users-model");

router.post("/register", (req, res) => {
  const ROUNDS = process.env.HASHING_ROUNDS || 8;
  const userInfo = req.body;
  //hashed 2^8
  const hash = bcrypt.hashSync(userInfo.password, 8);

  userInfo.password = hash;

  Users.add(userInfo)
    .then(user => {
      res.json(user);
    })
    .catch(err => res.send(err));
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  Users.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        //remember this client
        req.session.user = {
          id: user.id,
          username: user.username
        };

        res.status(200).json({ hello: user.username, token });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch(error => {
      res.status(500).json({ errorMessage: "couldnt find user" });
    });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.status(500).json({ message: "checkout but cant leave" });
      } else {
        res.status(200).json({ message: "logged out success" });
      }
    });
  } else {
    res.status(200).json({ message: "already logged out, i dont know u" });
  }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    department: user.department || "none"
  };

  const secret = jwtSecret;

  const options = {
    expiresIn: "1h"
  };

  return jwt.sign(payload, secret, options);
}
module.exports = router;
