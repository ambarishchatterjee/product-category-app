const Product = require('../models/Product');

const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let count = 1;

  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
    .replace(/\-\-+/g, '-');   // Replace multiple - with single -
};

module.exports = {
  generateUniqueSlug,
  slugify
};
