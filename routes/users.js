const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const _ = require("lodash");
const auth = require("../middlewares/auth");

const upload = require("../middlewares/uploads");
const { User, validate } = require("../models/users");
const validateObjectId = require("../middlewares/validateObjectId");
const unlink = require("../utilities/unlink");
const { mapUser } = require("../mappers/imgMapper");
const imageResize = require("../middlewares/imageResize");

router.get("/", [auth], async (req, res) => {
  const users = await User.find().populate("jobCategory", "category");
  const resources = await users.map(mapUser);

  res.send(resources);
  // res.send(users);
});
router.get("/members/:id", [auth], async (req, res) => {
  const users = await User.find({
    jobCategory: req.params.id,
    approved: true,
  }).populate("jobCategory", "category");
  const resources = await users.map(mapUser);

  res.send(resources);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  if (req.params.id == "000000000000000000000000") {
    const users = await User.find({ approved: false }).populate(
      "jobCategory",
      "category"
    );
    if (!users) return res.status(404).send("User not found");

    const resources = users.map((user) => mapUser(user));
    res.send(resources);
    return;
  }

  const user = await User.findById(req.params.id).populate(
    "jobCategory",
    "category"
  );
  if (!user) return res.status(404).send("User not found");
  res.send(mapUser(user));
});

// router.post("/", async (req, res) => {
router.post("/", [upload.single("image"), imageResize], async (req, res) => {
  const path = req.body;

  const { error } = validate(path);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: path.email });
  if (user) {
    return res.status(400).send("User already registered.");
  }

  user = new User(
    _.pick(path, [
      "userName",
      "email",
      "password",
      "phone",
      "jobCategory",
      "workPlace",
      "location",
    ])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.image = req.file?.filename;

  const token = user.generateAuthToken();

  await user.save();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    // .send(_.pick(user, ["_id", "name", "email"]));
    .send(token);
});

// router.put("/", auth, async (req, res) => {
router.put("/", [auth, upload.single("image")], async (req, res) => {
  // const { error } = validate(path);
  // if (error) return res.status(400).send(error.details[0].message);
  const path = req.body;

  let user = await User.findOne({ _id: req.user.userId });
  if (!user) return res.status(404).send("User not found");

  if (path.name) user.name = path.name;
  if (path.email) {
    if (user.email !== path.email) {
      const duplicateUser = await User.findOne({ email: path.email });
      // console.log("dupl", duplicateUser);
      if (duplicateUser) return res.status(400).send("Invalid email specified");
      user.email = path.email;
    }
  }
  // IF(FILE.....)
  // user = new User(_.pick(path, ["name", "email", "password"]));
  if (path.password) {
    user.password = path.password;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  if (req.file && req.file.path) {
    unlink(user.image);
    user.image = req.file.path;
  }

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    // .send(_.pick(user, ["_id", "name", "email"]));
    .send(user);
});

router.patch(
  "/:id",
  [auth, validateObjectId, upload.single("image"), imageResize],
  async (req, res) => {
    const body = req.body;

    if (req.file && req.file.path) {
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { image: req.file.filename },
        {
          runValidators: true,
          new: true,
        }
      );
      if (!updated) return res.status(400).send("User not found");
    }
    const updated = await User.findByIdAndUpdate(req.params.id, body, {
      runValidators: true,
      new: true,
    });
    if (!updated) return res.status(400).send("User not found");

    res.status(200).send();
  }
);

module.exports = router;
