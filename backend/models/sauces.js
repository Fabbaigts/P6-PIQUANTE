// intégration des fonctionnalités de mongoose dans la variable "mongoose"
const mongoose = require("mongoose");
// Déclaration du modèle mongoose de sauce dans la variable "sauceSchema"
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: [{ type: String, default: [] }],
  usersDisliked: [{ type: String, default: [] }],
});
// exportation du modèle mongoose "sauceShema" pour une portée globale dans les fichiers  dossier backend
module.exports = mongoose.model("Sauce", sauceSchema);
