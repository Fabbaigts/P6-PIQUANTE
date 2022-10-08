const sauce = require("../models/sauces"); // intégration du model "sauces" dans la variable "sauce"
const fs = require("fs"); // pour l'accès au système de fichiers

// *****************************************************************************************
// *********  middleware (logique métier) pour la création d'une sauce *********************
// *****************************************************************************************

exports.createSauce = (req, res, next) => {
  const objetSauce = JSON.parse(req.body.sauce);
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
    .save() //enregistre le modèle sauces dans la base de données via mongoose  sauceSchema
    .then(() => {
      res.status(201).json({
        message: "Sauce enregistrée", //message renvoyé par le serveur via le JSON en cas de réussite
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error, //message renvoyé par le serveur via le JSON en cas d'échec
      });
    });
};

// *****************************************************************************************
// ******  Middleware pour la récupération de toutes les sauces de la base MongoDb *********
// *****************************************************************************************

exports.getAllSauce = (req, res, next) => {
  sauce
    .find() //.find permet de rechercher tout ce qui correspond
    .then((lesSauces) => res.status(200).json(lesSauces)) // le fichier JSON renvoyé au navigateur contient toutes les sauces
    .catch((error) => res.status(400).json({ error }));
};
// *****************************************************************************************
// **** Middleware pour la récupération d'une sauce en particulier de la base MongoDb ******
// *****************************************************************************************
exports.getOneSauce = (req, res, next) => {
  sauce
    .findOne({ _id: req.params.id }) //la fonction .findOne permet la recherche d'un objet par son Id dans la BD Mongo.
    .then((sauce) => res.status(200).json(sauce)) // le fichier JSON renvoyé au navigateur contient la sauce demandée.
    .catch((error) => res.status(404).json({ error }));
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
    : //Si non on récupère simplement le corps de la requête et on retire l'userId
      { ...req.body };
  console.log(thingObject);
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
                //la fonction .updateOne permet de modifier une ou plusieurs données dans la BD ici c'est l'objet entier.
                { _id: req.params.id },
                { ...thingObject, _id: req.params.id }
              )
              .then(() => res.status(200).json({ message: "Objet modifié!" }))
              .catch((error) => res.status(401).json({ error }));
          });
        } else {
          sauce
            .updateOne(
              { _id: req.params.id },
              { ...thingObject, _id: req.params.id }
            )
            .then(() => res.status(200).json({ message: "Objet modifié!" }))
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
  sauce
    .findOne({ _id: req.params.id })

    .then((sauces) => {
      if (sauces.userId != req.auth.userId) {
        res.status(401).json({ message: "Personne non autorisée" });
      } else {
        const filename = sauces.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          sauce
            .deleteOne({ _id: req.params.id }) //la fonction .deleteOne permet de sypprimer un élément par son Id.
            .then((sauce) =>
              res
                .status(200)
                .json({ message: "Sauce effacée de la base de données" })
            )
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
    sauce
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: req.body.like++ }, //$inc permet d'incrémenter une valeur numérique déjà déclarée dans la BD
          $push: { usersLiked: req.body.userId }, //$push permet d'insérer une donnée dans un tableau de données.
        }
      )
      .then(() => res.status(200).json({ message: "Like ajouté" }))
      .catch((error) => res.status(400).json({ error }));
  }

  //*****************  Cas du User qui n'aime pas la sauce  ***********************
  else if (req.body.like === -1) {
    sauce
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: req.body.like++ * -1 }, //car la valeur envoyée est -1 donc pour incrémenter une valeur positive, il faut la * -1
          $push: { usersDisliked: req.body.userId },
        }
      )
      .then(() => res.status(200).json({ message: "DisLike ajouté" }))
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
            .updateOne({
              $inc: { likes: -1 }, //décrémentation de -1 de MONGODB
              $pull: { usersLiked: req.body.userId }, //Retrait du UserLiked ($pull)de MONGODB
            })
            .then(() => {
              res.status(200).json({ message: "Vote like/dislike retiré" });
            })
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          //Alors on actulise l'entrée like et usersLiked
          sauce
            .updateOne({
              $inc: { dislikes: -1 }, //décrémentation de -1 du Dislike de MONGODB
              $pull: { usersDisliked: req.body.userId }, //Retrait du UserDisliked ($pull) de MONGODB
            })
            .then((sauce) => {
              res.status(200).json({ message: "dislike retiré" });
            })
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
  console.log(req.body);
};
