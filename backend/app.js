const express = require("express");
const app = express();
//import de fonctionnalités de mongoose (pour la gestion de la base de données Mongo)
const mongoose = require("mongoose");
//import des fonctionnalités cors
const cors = require("cors");
// import des fonctionnalités de path
const path = require("path");
//import du modèle de sauce
const Sauce = require("./models/sauces");
//import des routes auth et sauces
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauces");

//Ajout de la passerelle de connexion mangoose pour le controle de la BD Mongo.
mongoose
  .connect("mongodb+srv://fabiencdp:Fab40@piquante.kgej83c.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//set header pour les cors
app.use(cors());

//fonction express  permettant le parsage du body
app.use(express.json());

// fonction d'express permettant l'acces au repertoire image statique
app.use("/images", express.static(path.join(__dirname, "images")));

//fonction d'express pour la gestion des routes
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

module.exports = app;
