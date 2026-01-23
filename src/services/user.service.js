const userModel = require("../models/user.model");

async function updateMe(userId, payload) {
  await userModel.updateById(userId, payload);
  const user = await userModel.findById(userId);
  return { user };
}

module.exports = { updateMe };
