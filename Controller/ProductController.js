import Product from "../Model/Product.js";
import User from "../Model/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "apple";

export const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      stock,
      category,
      size,
      colors,
      images,
      tags,
    } = req.body;

    // ✅ Basic validation
    if (!title || !price || !category || !size || !images || images.length === 0) {
      return res.status(400).json({
        message: "Title, price, category, size, and at least one image are required",
      });
    }

    const newProduct = new Product({
      title,
      description,
      price,
      stock: stock || 0,
      category,
      size,
      colors: colors || [],
      images,
      tags: tags || [],
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};
