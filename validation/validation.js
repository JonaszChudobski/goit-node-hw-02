const Joi = require("joi");

const schemaContact = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  phone: Joi.string().min(6).max(12).required(),
});

const schemaFavorite = Joi.object({
  favorite: Joi.bool(),
});

const schemaUser = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  schemaContact,
  schemaFavorite,
  schemaUser,
};
