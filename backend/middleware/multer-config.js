// intégration des fonctionnalités de multer dans la variable "multer"
const multer = require("multer");
// déclaration du type d'extension d'image a rajouter a l'uri de l'image.
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};
// méthode de génération de l'Url de l'image avant l'enreistement en BD
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
