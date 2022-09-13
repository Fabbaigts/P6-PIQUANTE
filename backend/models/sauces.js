const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 1 },
  dislikes: { type: Number, default: 0 },
  usersLiked: { type: [String], default: ["6320949d313615dbec66421d"] },
  usersDisliked: { type: [String], default: ["6320949d313615dbec66421d"] },
});
module.exports = mongoose.model("Sauce", sauceSchema);
