const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required().label('Category Name'),
});

module.exports = categorySchema;
