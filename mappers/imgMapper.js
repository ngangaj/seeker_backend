const config = require("config");

const mapper = (imageName) => {
  const baseUrl = config.get("assetsBaseUrl");
  return `${baseUrl}${imageName}_full.jpg`;
};

const mapUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  email: user.email,
  location: user.location,
  phone: user.phone,
  jobCategory: user.jobCategory?._id,
  categoryName: user.jobCategory?.category,
  isAdmin: user.isAdmin,
  approved: user.approved,
  rating: user.rating,
  workPlace: user.workPlace,
  image: user.image ? mapper(user.image) : undefined,
});

const mapCategory = (category) => ({
  _id: category._id,
  category: category.category,
  tagline: category.tagline,
  image: mapper(category.image),
});

// exports.mapper = mapper;
exports.mapUser = mapUser;
exports.mapCategory = mapCategory;
