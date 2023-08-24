const User = require("./schema/user");

const getUserById = async (userId) => {
  return User.findOne({ _id: userId });
};

const getUserByEmail = async (email) => {
  return User.findOne(email);
};

const updateUser = async (userId, body) => {
  return User.findByIdAndUpdate({ _id: userId }, body, { new: true });
};

module.exports = {
  getUserById,
  getUserByEmail,
  updateUser,
};
