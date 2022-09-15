// in controllers/stuff.js

const sauce = require("../models/sauces");

exports.createSauce = (req, res, next) => {
  const objetSauce = JSON.parse(req.body.sauce);
  console.log(objetSauce);
  delete objetSauce._id;
  delete objetSauce._userId;
  const sauces = new sauce({
    ...objetSauce,
    _userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauces
    .save()
    .then(() => {
      res.status(201).json({
        message: "Sauce enregistrée",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getAllSauce = (req, res, next) => {
  sauce
    .find()
    .then((lesSauces) => res.status(200).json(lesSauces))
    .catch((error) => res.status(400).json({ error }));
  console.log("Affichage des sauces réussi:");
};

exports.getOneSauce = (req, res, next) => {
  console.log(req.params.id);
  sauce
    .findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
  console.log("Sauce trouvée !");
};
exports.modifySauce = (req, res, next) => {
  console.log(req.params.id);
  sauce
    .updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
  console.log("Objet modifié !");
};

exports.deleteSauce = (req, res, next) => {
  console.log(req.params.id);
  sauce
    .deleteOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json({ message: "Objet supprimé !" }))
    .catch((error) => res.status(404).json({ error }));
  console.log("Objet supprimé !");
};
