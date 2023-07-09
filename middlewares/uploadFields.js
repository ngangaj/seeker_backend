const multer = require("multer");
const upload = require("./uploads");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "background") {
    // if uploading background
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false); // else fails
    }
  }

  if (file.fieldname === "image") {
    // if uploading image

    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      // check file type to be png, jpeg, or jpg
      cb(null, true);
    } else {
      cb(null, false); // else fails
    }
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // setting destination of uploading files
    if (file.fieldname === "background") {
      // if uploading resume
      cb(null, "./uploads");
    } else {
      // else uploading image
      cb(null, "./uploads"); //or wherever you want
    }
  },
  filename: (req, file, cb) => {
    // naming file
    cb(null, file.originalname);
  },
});

const uploadFields = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

module.exports = uploadFields;
