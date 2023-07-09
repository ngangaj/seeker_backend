const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");

const messageSchema = new mongoose.Schema({
  body: {
    type: String,
    maxlength: 255,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

const Message = mongoose.model("message", messageSchema);

const validateMessage = (message) => {
  const schema = {
    text: Joi.string().trim().max(255).required(),
  };
  return Joi.validate(message, schema); 
};

router.post("/", async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const message = new Message({
    body: req.body.text,
  });

  await message.save();

  res.status(200).send();
});

router.get("/", auth, async (req, res) => {
  const messages = await Message.find();

  res.send(messages);
});

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id, { new: true });

  if (!deleted) return res.status(404).send("message not found");

  return res.status(200).send();
});

module.exports = router;
