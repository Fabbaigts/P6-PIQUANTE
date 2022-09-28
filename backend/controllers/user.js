const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
require("dotenv").config();

// chiffrage email

exports.signup = (req, res, next) => {
  console.log(req.body.password);

  const cryptoEmail = crypto
    .HmacSHA256(req.body.email, "process.env.EMAIL_ENV")
    .toString();
  console.log(cryptoEmail);
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      console.log(hash);
      console.log(cryptoEmail);
      const user = new User({
        email: cryptoEmail,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  const cryptoEmail = crypto
    .HmacSHA256(req.body.email, "process.env.EMAIL_ENV")
    .toString();
  console.log(cryptoEmail);

  User.findOne({ email: cryptoEmail })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }

          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_ENV, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
