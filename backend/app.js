const express = require("express");
const app = express();

app.use((req, res) => {
  res.json({ message: "La requête  a bien été  bien reçue!" });
});

module.exports = app;
