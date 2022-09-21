const sauce = require("../models/sauces");
const fs = require("fs");

//middleware pour la création d'une sauce
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
//Middleware pour la récupération de toutes les sauces de la base MongoDb
exports.getAllSauce = (req, res, next) => {
  sauce
    .find()
    .then((lesSauces) => res.status(200).json(lesSauces))
    .catch((error) => res.status(400).json({ error }));
  console.log("Affichage des sauces réussi !");
};

//Middleware pour la récupération d'une sauce en particulier de la base MongoDb
exports.getOneSauce = (req, res, next) => {
  console.log(req.params.id);
  sauce
    .findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
  console.log("Sauce trouvée !");
  console.log(req.body.bearer);
};

//Middleware pour la modification d'une sauces de la base MongoDb
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
        res
          .status(401)
          .json({ message: "NON AUTORISE! Sur route PUT modifySauce" });
      } else {
        const filename = theSauce.imageUrl.split("/images/")[1];
        console.log(filename);
        fs.unlink(`images/${filename}`, () => {
          sauce
            .updateOne(
              { _id: req.params.id },
              { ...objetSauce, _id: req.params.id }
            )
            .then(() => res.status(200).json({ message: "Objet modifié!" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
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

//*************** Middleware pour la suppression d'une sauce de la base MongoDb et suppression image du serveur *****************
exports.deleteSauce = (req, res, next) => {
  console.log(req.auth.userId);

  sauce
    .findOne({ _id: req.params.id })

    .then((sauces) => {
      console.log(sauces);
      if (sauces.userId != req.auth.userId) {
        res.status(401).json({ message: "Personne non autorisée" });
      } else {
        const filename = sauces.imageUrl.split("/images/")[1];
        console.log(filename);
        fs.unlink(`images/${filename}`, () => {
          sauce
            .deleteOne({ _id: req.params.id })
            .then((sauce) => res.status(200).json())
            .catch((error) => res.status(404).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// ***************** Middleware pour la notation (like et dislike) des sauces **********************
exports.like = (req, res, next) => {
  //Cas de l'user qui clique sur like :

  if (req.body.like === 1) {
    console.log(req.body);
    sauce
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: req.body.like++ },
          $push: { usersLiked: req.body.userId },
        }
      )
      .then(() => res.status(200).json())
      .catch((error) => res.status(400).json({ error }));
  }
  // Cas du User qui n'aime pas la sauce
  if (req.body.like === -1) {
    console.log(req.body);
    sauce
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: req.body.like++ * -1 },
          $push: { usersDisliked: req.body.userId },
        }
      )
      .then(() => res.status(200).json())
      .catch((error) => res.status(400).json({ error }));
  }
  // **************  Rectification des likes et dislikes ************
  if (req.body.like === 0) {
    sauce
      .findOne({ _id: req.params.id })
      .then((sauce) => {
        // Condition pour savoir si le tableau inclue déjà l'UserId
        if (sauce.usersLiked.includes(req.body.userId)) {
          //Alors on actulise l'entrée like et usersLiked
          sauce
            .updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: req.body.like - 1 }, //décrémentation de -1
                $pull: { usersLiked: req.body.userId }, //Retrait du UserLiked ($pull)
              }
            )
            .then(() => {
              res.status(200).json();
            })
            .catch((error) => res.status(400).json({ error }));
          console.log("req.body.userId : " + req.body.userId);
          console.log("tableau likes : " + sauce.usersLiked);
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
