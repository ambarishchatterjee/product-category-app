const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required().label('Product Name'),
  category: Joi.string().required().label('Category')
,
  description: Joi.string().required().label('Description')
});

module.exports = productSchema;
