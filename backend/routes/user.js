// intégration des fonctionnalités du framework express dans la variable "express"
const express = require("express");
// intégration des fonctionnalités "routeur" d'express dans la variable "router"
const router = express.Router();
// intégration des fonctionnalités des middlewares concernant  les utilisateurs dans la variable "userCtrl"
const userCtrl = require("../controllers/user");

// Déclaration des chemins à suivre selon le type de requêtes concernant les utilisateurs
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
