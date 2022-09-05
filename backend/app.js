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

console.log("TEST3");

app.use("/api/auth", userRoutes);

module.exports = app;
