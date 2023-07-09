const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const { Category } = require("./category");
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    maxlength: 50,
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    maxlength: 255,
  },
  phone: {
    type: Number,
    required: true,
    maxlength: 15,
  },

  jobCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Category,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  workPlace: {
    type: String,
    maxlength: 50,
    minlength: 3,
    required: true,
  },
  location: {
    type: String,
    maxlength: 50,
    minlength: 3,
    required: true,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      userId: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(customer) {
  const schema = {
    userName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required().min(5).max(12).required(),
    jobCategory: Joi.objectId().required(),
    password: Joi.string().min(5).max(20).required(),
    workPlace: Joi.string().min(5).max(50).required(),
    location: Joi.string().min(5).max(50).required(),
  };

  return Joi.validate(customer, schema);
}

exports.User = User;
exports.validate = validateUser;
