const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauces");
const cors = require('cors');
//import du modèle de sauce
const Sauce = require('./models/sauces');

//fonction express  permettant le parsage du body
app.use(express.json());


//Ajout de la passerelle de connexion mangoose pour le controle de la BD Mongo.
mongoose
  .connect(
    "mongodb+srv://fabiencdp:Fab40@piquante.kgej83c.mongodb.net/test",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));


//set header pour les cors
app.use (cors());

//


app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
//app.use("/images", express.static(path.join(__dirname, "images")));


module.exports = app;
