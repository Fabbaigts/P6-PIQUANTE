const express = require("express");
const app = express();
//import de fonctionnalités de mongoose (pour la gestion de la base de données Mongo)
const mongoose = require("mongoose");
//import des fonctionnalités cors
const cors = require("cors");
// import des fonctionnalités de path
const path = require("path");

//import des routes auth et sauces
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauces");
//importation des fonctionnalités de dotenv
require ("dotenv").config();


//Ajout de la passerelle de connexion mangoose pour le controle de la BD Mongo.
mongoose
  .connect(process.env.URL_MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));
console.log(process.env.URL_MONGODB);
//set header pour les cors
app.use(cors());

//fonction express  permettant le parsage du body
app.use(express.json());

// fonction d'express permettant l'acces au repertoire d'images statiques
app.use("/images", express.static(path.join(__dirname, "images")));

//fonction d'express pour la gestion des routes
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);



module.exports = app;
