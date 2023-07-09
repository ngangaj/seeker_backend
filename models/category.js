const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    minlength: 3,
    maxlength: 20,
    required: true,
    // enum: {["cab", "14 pass", "bus", "pick up", "lorry", "truck"]},
  },
  tagline: {
    type: String,
    required: true,
    maxlength: 30,
  },
  image: String,
});

const Category = mongoose.model("category", categorySchema);

const validateCategory = (request) => {
  const schema = {
    category: Joi.string().trim().min(3).max(20).required(),

    tagline: Joi.string().required().max(30),
  };
  return Joi.validate(request, schema);
};

exports.Category = Category;
exports.validate = validateCategory;
