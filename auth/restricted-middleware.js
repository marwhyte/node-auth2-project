const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/secrets");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  console.log(req.session);

  if (authorization) {
    jwt.verify(authorization, jwtSecret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ you: "shall not pass" });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(400).json({ message: "no credentials found" });
  }
};

//remember client already logged in
