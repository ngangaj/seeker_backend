const fs = require("fs");

module.exports = async function unlink(path) {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};
