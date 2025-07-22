const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const productSchema = require("../validations/productValidation");
const categorySchema = require("../validations/categoryValidation");
const { generateUniqueSlug, slugify } = require("../helpers/generateSlug");
const Category = require("../models/Category");
const notifier = require("node-notifier");

class AdminController {
  // Dashboard
  static async getDashboard(req, res) {
    try {
      const count = await Product.countDocuments({ isDeleted: false });
      const countCat = await Category.countDocuments({ isDeleted: false });
      res.render("admin/dashboard", {
        count,
        countCat,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Unable to load dashboard");
      res.redirect("/admin/products");
    }
  }

  // List all non-deleted products
  static async listProducts(req, res) {
    try {
      const products = await Product.find({ isDeleted: false });
      res.render("admin/products", {
        products,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Unable to load products");
      res.redirect("/");
    }
  }

  // List all non-deleted categories
  static async listCategories(req, res) {
    try {
      const categories = await Category.find({ isDeleted: false });
      res.render("admin/categories", {
        categories,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Unable to load categories");
      res.redirect("/");
    }
  }

  // Show add product form
  static async getAddProduct(req, res) {
    const categories = await Category.find({ isDeleted: false })
      .select("name -_id") // Only select the `name` field, exclude `_id`
      .lean();
    res.render("admin/productForm", {
      product: {},
      categories: categories.map((cat) => cat.name),
      formAction: "/admin/products/add",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  }

  // Show add category form
  static async getAddCategory(req, res) {
    res.render("admin/categoryForm", {
      category: {},
      formAction: "/admin/categories/add",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  }

  // Add product
  static async postAddProduct(req, res) {
    try {
      const { error } = productSchema.validate(req.body);
      if (error) {
        notifier.notify({
          title: "Error!",
          message: error.details[0].message,
          sound: true,
          wait: true,
        }),
          req.flash("error", error.details[0].message);
        return res.redirect("/admin/products/add");
      }

      const { name, category, description } = req.body;
      const baseSlug = slugify(name);
      const slug = await generateUniqueSlug(baseSlug);
      const image = req.file ? `/uploads/${req.file.filename}` : "";

      await Product.create({ name, slug, category, description, image });
      req.flash("success", "Product added successfully");
      //      req.flash("message", "Product added successfully")
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding product");
      res.redirect("/admin/products/add");
    }
  }

  // Add category
  static async postAddCategory(req, res) {
    try {
      const { error } = categorySchema.validate(req.body);
      if (error) {
        req.flash("error", error.details[0].message);
        return res.redirect("/admin/categories/add");
      }

      const { name } = req.body;
      const baseSlug = slugify(name);
      const slug = await generateUniqueSlug(baseSlug);

      await Category.create({ name, slug });
      req.flash("success", "Category added successfully");
      res.redirect("/admin/categories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error adding category");
      res.redirect("/admin/categories/add");
    }
  }

  // Show edit product form
  static async getEditProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      const categories = ["Shoes", "Clothes", "Sunglasses"];
      res.render("admin/productForm", {
        product,
        categories,
        formAction: `/admin/products/edit/${req.params.id}`,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Unable to load edit form");
      res.redirect("/admin/products");
    }
  }

  // Show edit category form
  static async getEditCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      res.render("admin/categoryForm", {
        category,
        formAction: `/admin/categories/edit/${req.params.id}`,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Unable to load edit form");
      res.redirect("/admin/categories");
    }
  }

  // Update product
  static async postEditProduct(req, res) {
    try {
      const { error } = productSchema.validate(req.body);
      if (error) {
        req.flash("error", error.details[0].message);
        return res.redirect(`/admin/products/edit/${req.params.id}`);
      }

      const { name, category, description } = req.body;
      const baseSlug = slugify(name);
      const product = await Product.findById(req.params.id);

      // Regenerate slug if name changed
      if (product.name !== name) {
        const newSlug = await generateUniqueSlug(baseSlug);
        product.slug = newSlug;
      }

      // Delete old image if new one uploaded
      if (req.file) {
        if (product.image) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            product.image
          );
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        product.image = `/uploads/${req.file.filename}`;
      }

      product.name = name;
      product.category = category;
      product.description = description;

      await product.save();
      req.flash("success", "Product updated successfully");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating product");
      res.redirect(`/admin/products/edit/${req.params.id}`);
    }
  }

  // Update category
  static async postEditCategory(req, res) {
    try {
      const { error } = categorySchema.validate(req.body);
      if (error) {
        req.flash("error", error.details[0].message);
        return res.redirect(`/admin/categories/edit/${req.params.id}`);
      }

      const { name } = req.body;
      const baseSlug = slugify(name);
      const category = await Category.findById(req.params.id);

      // Regenerate slug if name changed
      if (category.name !== name) {
        const newSlug = await generateUniqueSlug(baseSlug);
        category.slug = newSlug;
      }

      category.name = name;

      await category.save();
      req.flash("success", "Category updated successfully");
      res.redirect("/admin/categories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error updating category");
      res.redirect(`/admin/categories/edit/${req.params.id}`);
    }
  }

  // Soft delete product (keep image)
  static async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      product.isDeleted = true;
      await product.save();

      req.flash("success", "Product deleted successfully");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting product");
      res.redirect("/admin/products");
    }
  }

  // Soft delete category (keep image)
  static async deleteCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      category.isDeleted = true;
      await category.save();

      req.flash("success", "Category deleted successfully");
      res.redirect("/admin/categories");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting category");
      res.redirect("/admin/categories");
    }
  }

  // View deleted products
  static async getDeletedProducts(req, res) {
    try {
      const deletedProducts = await Product.find({ isDeleted: true });
      res.render("admin/deletedProducts", {
        products: deletedProducts,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Unable to load deleted products");
      res.redirect("/admin/products");
    }
  }

  // Restore soft-deleted product
  static async restoreProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products/deleted");
      }

      product.isDeleted = false;
      await product.save();

      req.flash("success", "Product restored successfully");
      res.redirect("/admin/products/deleted");
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to restore product");
      res.redirect("/admin/products/deleted");
    }
  }

  // Hard delete product (and delete image file)
  static async permanentlyDeleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products/deleted");
      }

      if (product.image) {
        const imagePath = path.join(__dirname, "..", "public", product.image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      await Product.deleteOne({ _id: product._id });
      req.flash("success", "Product permanently deleted");
      res.redirect("/admin/products/deleted");
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to delete product");
      res.redirect("/admin/products/deleted");
    }
  }
}

module.exports = AdminController;
