const Product = require("../models/Product");

class ProductController {
  // Home page with optional search
  static async home(req, res) {
    const searchQuery = req.query.search || "";
    const selectedCategory = req.query.category || "";
    const query = {
      isDeleted: false,
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ],
    };

    if (selectedCategory) {
      query.category = selectedCategory;
    }
    const products = await Product.find(query);

    // Get unique list of all categories from products
    const allCategories = await Product.distinct("category", {
      isDeleted: false,
    });

    res.render("customer/home", {
      products,
      searchQuery,
      selectedCategory,
      categories: allCategories,
    });

    // const products = await Product.find(query).populate('category');
    //res.render('customer/home', { products, searchQuery });
  }

  // Product Detail by slug or ID
  static async productDetail(req, res) {
    const slugOrId = req.params.slugOrId;
    let product = null;

    try {
      // First try finding by slug
      product = await Product.findOne({ slug: slugOrId });

      // If not found and it's a valid ObjectId, try by _id
      if (!product && mongoose.Types.ObjectId.isValid(slugOrId)) {
        product = await Product.findById(slugOrId);
      }

      if (!product || product.isDeleted) {
        return res.status(404).send("Product not found");
      }

      res.render("customer/productDetail", { product });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = ProductController;
