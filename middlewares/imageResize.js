const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const outputFolder = "public/assets";

module.exports = async (req, res, next) => {
  let image = "";

  const resizePromises = async (file) => {
    await sharp(file.path)
      .resize(2000)
      .jpeg({ quality: 80 })
      .toFile(path.resolve(outputFolder, file.filename + "_full.jpg"));

    // await sharp(file.path)
    //   .resize(100)
    //   .jpeg({ quality: 30 })
    //   .toFile(path.resolve(outputFolder, file.filename + "_thumb.jpg"));

    fs.unlinkSync(file.path);

    image = file.filename;
  };

  if (req.file) {
    await resizePromises(req.file);

    req.image = image;
  }
  next();
};
