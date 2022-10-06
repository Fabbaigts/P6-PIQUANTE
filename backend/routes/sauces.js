// intégration des fonctionnalités du framework express dans la variable "express"
const express = require("express");
// intégration des fonctionnalités "routeur" d'express dans la variable "router"
const router = express.Router();
// intégration des fonctionnalités du middleware d'authentification dans la variable "auth"
const auth = require("../middleware/auth");
// intégration des fonctionnalités des middlewares concernant les sauces dans la variable "saucesCtrl"
const saucesCtrl = require("../controllers/sauces");
// intégration des fonctionnalités de multer pour la gestion des images dans la variable "multer"
const multer = require("../middleware/multer-config");

// Déclaration des chemins à suivre selon le type de requêtes concernant les sauces
router.get("/", auth, saucesCtrl.getAllSauce);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.like);

//exportation des routes 
module.exports = router;
