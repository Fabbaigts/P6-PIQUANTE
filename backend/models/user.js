// intégration des fonctionnalités de mongoose dans la variable "mongoose"
const mongoose = require("mongoose");
// intégration des fonctionnalités de mongoose-unique-validator dans la variable "uniqueValidator"
const uniqueValidator = require("mongoose-unique-validator");

// Déclaration du modèle mongoose de user dans la variable "userSchema"
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);
// exportation du modèle mongoose "userShema" pour une portée globale dans les fichiers  dossier backend
module.exports = mongoose.model("User", userSchema);
