// intégration des fonctionnalités de Jsonwebtoken dans la variable "jwt"
const jwt = require("jsonwebtoken");
// appel du package dotenv
require("dotenv").config();
// Test de connexion ( try / catch) comparant le token décodé avec l'auteur de la requête.
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_ENV);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
