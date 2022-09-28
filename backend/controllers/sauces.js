const sauce = require("../models/sauces");
const fs = require("fs"); // pour l'accès au système de fichiers

// *****************************************************************************************
// **********************  middleware (logique métier) pour la création d'une sauce *************************
// *****************************************************************************************

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

// *****************************************************************************************
// ******  Middleware pour la récupération de toutes les sauces de la base MongoDb *********
// *****************************************************************************************

exports.getAllSauce = (req, res, next) => {
  sauce
    .find()
    .then((lesSauces) => res.status(200).json(lesSauces))
    .catch((error) => res.status(400).json({ error }));
  console.log("Affichage des sauces réussi !");
};
// *****************************************************************************************
// **** Middleware pour la récupération d'une sauce en particulier de la base MongoDb ******
// *****************************************************************************************
exports.getOneSauce = (req, res, next) => {
  console.log(req.params.id);
  sauce
    .findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
  console.log("Sauce trouvée !");
  console.log(req.rawHeaders[09]);
};

// *****************************************************************************************
// ********** Middleware pour la modification d'une sauces de la base MongoDb **************
// *****************************************************************************************

exports.modifySauce = (req, res, next) => {
  //------- est ce qu'un fichier (file) se trouve dans la requête? -------
  const thingObject = req.file
    ? //si oui alors on parse l'objet pour recuperer l'url de l'image
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : //Si non on récupère simplement le corps de la requête et on retire l'userId par S
      { ...req.body };
  delete thingObject._userId;

  // thingObject prend alors une valeur ou l'autre selon que la requête contienne ou pas un file.

  sauce
    .findOne({ _id: req.params.id })
    .then((sauceTrouvee) => {
      if (sauceTrouvee.userId != req.auth.userId) {
        res.status(401).json({ message: "NON AUTORISE!" });
      } else {
        if (req.file) {
          const filename = sauceTrouvee.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            sauce
              .updateOne(
                { _id: req.params.id },
                { ...thingObject, _id: req.params.id }
              )
              .then(
                () => res.status(200).json({ message: "Objet modifié!" }),
                console.log("Sauce modifiée avec l'image")
              )
              .catch((error) => res.status(401).json({ error }));
          });
        } else {
          sauce
            .updateOne(
              { _id: req.params.id },
              { ...thingObject, _id: req.params.id }
            )
            .then(
              () => res.status(200).json({ message: "Objet modifié!" }),
              console.log("Sauce modifiée sans image")
            )
            .catch((error) => res.status(401).json({ error }));
        }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// ******************************************************************************************************
// *** Middleware pour la suppression d'une sauce de la base MongoDb et suppression image du serveur ****
// ******************************************************************************************************
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

// *************************************************************************************************
// ***************** Middleware pour la notation (like et dislike) des sauces **********************
// *************************************************************************************************

exports.like = (req, res, next) => {
  //*******************  Cas de l'user qui clique sur like :  ***************************

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
  //*****************  Cas du User qui n'aime pas la sauce  ***********************
  else if (req.body.like === -1) {
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
  // ****************   Rectification des likes et dislikes  *******************
  else if (req.body.like === 0) {
    sauce
      .findOne({ _id: req.params.id })
      .then((sauce) => {
        // Condition pour savoir si le tableau inclus déjà l'UserId du body de la request
        if (sauce.usersLiked.includes(req.body.userId)) {
          //Alors on actualise l'entrée like et usersLiked
          sauce
            .updateOne(
              {
                $inc: { likes: -1 }, //décrémentation de -1 de MONGODB
                $pull: { usersLiked: req.body.userId }, //Retrait du UserLiked ($pull)de MONGODB
              },
              console.log(
                "Nous sommes bien passés par la fonction de suppression '$pull' du Like"
              )
            )
            .then(() => {
              res.status(200).json({ message: "Like retiré" });
            })
            .catch((error) => res.status(400).json({ error }));
          console.log("req.body.userId : " + req.body.userId);
          console.log("tableau likes : " + sauce.usersLiked);
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          //Alors on actulise l'entrée like et usersLiked
          sauce
            .updateOne(
              {
                $inc: { dislikes: -1 }, //décrémentation de -1 du Dislike de MONGODB
                $pull: { usersDisliked: req.body.userId }, //Retrait du UserDisliked ($pull) de MONGODB
              },
              console.log(
                "Nous sommes bien passés par la fonction de suppression '$pull' du dislike"
              )
            )
            .then((sauce) => {
              res.status(200).json({ message: "dislike retiré" });
            })
            .catch((error) => res.status(400).json({ error }));
          console.log("req.body.userId : " + req.body.userId);
          console.log("tableau likes : " + sauce.usersLiked);
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
