const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  await next();
  console.log("cleaning cache");

  clearHash(req.user.id);
};
