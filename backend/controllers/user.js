// intégration du modèle "user" dans la variable "User"
const User = require("../models/user");
// intégration des fonctionnalités de bcrypt dans la variable "bcrypt"
const bcrypt = require("bcrypt");
// intégration des fonctionnalités de Jsonwebtoken dans la variable "jwt"
const jwt = require("jsonwebtoken");
// intégration des fonctionnalités de chiffrage email dans la varible crypto
const crypto = require("crypto-js");
// appel du package dotenv
require("dotenv").config();
// déclaration d'une variable "salt" générant des sels différents pour la sécurité.
let salt = bcrypt.genSaltSync(10);

// *****************************************************************************************
// ********* (logique métier) pour l'enregistement d'un utilisateur SIGNUP *****************
// *****************************************************************************************
exports.signup = (req, res, next) => {
  /*cryptage de l'email via un algorithme de cryptage sha256 et faisant à une clé contenue 
  dans la variable d'environnement EMAIL_ENV (dans le fichier .env)*/
  const cryptoEmail = crypto
    .HmacSHA256(req.body.email, process.env.EMAIL_ENV)
    .toString();
  /*cryptage du Mot de passe via la fonction de hachage de bcrypte*/
  bcrypt
    .hash(req.body.password, salt)
    .then((hash) => {
      const user = new User(
        /* User.schema de mongoose*/ {
          email: cryptoEmail,
          password: hash,
        }
      );
      user
        .save() // enregistement des données email + mot de passe dans la BD
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// *****************************************************************************************
// ************** (logique métier) pour la connexion d'un utilisateur LOGIN ****************
// *****************************************************************************************
exports.login = (req, res, next) => {
  /*Decryptage de l'email via un algorithme de cryptage sha256 et faisant à une clé contenue 
  dans la variable d'environnement EMAIL_ENV (dans le fichier .env)*/
  const cryptoEmail = crypto
    .HmacSHA256(req.body.email, process.env.EMAIL_ENV)
    .toString();

  User.findOne({ email: cryptoEmail })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      /* décryptage du Mot de passe via la fonction de hachage de bcrypte.compare */
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          /* Génération d'un fichier Json envoyé au navigateur de la requête contenant l'userId + le token généré */
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_ENV, {
              expiresIn: "24h", // temps de validité du token enregistré dans le navigateur
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
