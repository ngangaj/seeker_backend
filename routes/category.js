const express = require("express");
const { mapCategory } = require("../mappers/imgMapper");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/uploads");
const router = express.Router();
const { Category, validate } = require("../models/category");
const unlink = require("../utilities/unlink");
const imageResize = require("../middlewares/imageResize");
const validateObjectId = require("../middlewares/validateObjectId");

router.get("/", async (req, res) => {
  const categories = await Category.find().sort("-name");
  const resources = categories.map(mapCategory);

  res.send(resources);
});

router.get("/:id", auth, async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id });
  if (!category) return res.status(400).send("Invalid category specified");

  res.send(mapCategory(category));
});

router.post(
  "/",
  [auth, upload.single("image"), imageResize],
  async (req, res) => {
    console.log("------------------------------------------------------");
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (!req.file)
      return res.status(400).send("Please uplod an image identity file.");
    let category = await Category.findOne({ category: req.body.category });
    if (category) return res.status(400).send("The Category already exists");

    category = new Category({
      category: req.body.category,
      tagline: req.body.tagline,
    });

    category.image = req.file.filename;
    await category.save();

    res.status(201).send(category);
  }
);
router.put(
  "/",
  [auth, upload.single("image"), imageResize],
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = await Category.findOne({ category: req.body.category });
    if (category) return res.status(400).send("The Category already exists");

    if (req.body.category) category.category = req.body.category;
    if (req.body.tag) category.tag = req.body.tagline;
    if (req.file && req.file.path) {
      unlink(category.image);
      category.image = req.file.path;
    }
    await category.save();

    res.status(201).send(category);
  }
);
router.delete("/:id", async (req, res) => {
  const category = await Category.findByIdAndRemove(
    { _id: req.params.id },
    { new: true }
  );
  console.log(category);
  if (!category) return res.status(404).send("Not found");

  unlink(category.image);
  res.status(200).send();
});

router.patch(
  "/:id",
  [auth, validateObjectId, upload.single("image"), imageResize],
  async (req, res) => {
    const body = req.body;

    if (req.file && req.file.path) {
      const updated = await Category.findByIdAndUpdate(
        req.params.id,
        { image: req.file.filename },
        {
          runValidators: true,
          new: true,
        }
      );
      if (!updated) return res.status(404).send("Category not found");
    }
    const updated = await Category.findByIdAndUpdate(req.params.id, body, {
      runValidators: true,
      new: true,
    });
    if (!updated) return res.status(404).send("Category not found");

    res.status(200).send();
  }
);

module.exports = router;
