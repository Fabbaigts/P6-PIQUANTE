const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");

mongoose
  .connect(
    "mongodb+srv://fabien:P6-piquante@piquante.lumujnc.mongodb.net/test",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//set header pour les cors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

console.log("TEST3");

app.use("/api/auth", userRoutes);

module.exports = app;
