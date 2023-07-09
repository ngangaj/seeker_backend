const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const app = express();

const users = require("./routes/users");
const login = require("./routes/logger");
const category = require("./routes/category");
const customerService = require("./routes/customerService");

app.use(express.static("public"));
app.use(express.json());

app.use(cors());

app.use("/api/users", users);
app.use("/api/login", login);
app.use("/api/categories", category);
app.use("/api/customerService", customerService);

app.listen(5000, () => console.log(`Server running on port 5000 ...`));

mongoose
  .connect("mongodb://localhost/seeker", {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to mongodb ..."))
  .catch((err) => console.log("Error connecting to db ", err));
