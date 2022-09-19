const sauce = require("../models/sauces");
const fs = require("fs");



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
  console.log("Affichage des sauces réussi !");
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
  const objetSauce = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete objetSauce._userId;
  sauce
    .findOne({ _id: req.params.id })
    .then((theSauce) => {
      console.log(objetSauce);
      console.log(req.auth.userId);
      if (objetSauce.userId != req.auth.userId) {
        res.status(401).json({ message: "NON AUTORISE!" });
      } else {const filename = theSauce.imageUrl.split("/images/")[1];
      console.log(filename);
        fs.unlink(`images/${filename}`, () => {
        sauce
          .updateOne(
            { _id: req.params.id },
            { ...objetSauce, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
        })}
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/*exports.deleteSauce = (req, res, next) => {
  console.log(req.params.id);
  sauce
    .deleteOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json({ message: "Objet supprimé !" }))
    .catch((error) => res.status(404).json({ error }));
  console.log("Objet supprimé !");
}
*/
exports.deleteSauce = (req, res, next) => {
  console.log(req.auth.userId);

  sauce
    .findOne({ _id: req.params.id })

    .then((sauces) => {
      console.log(sauces);
      if (sauces.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauces.imageUrl.split("/images/")[1];
        console.log(filename);
        fs.unlink(`images/${filename}`, () => {
          sauce
            .deleteOne({ _id: req.params.id })
            .then((sauce) =>
              res.status(200).json({ message: "Objet supprimé !" })
            )
            .catch((error) => res.status(404).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};