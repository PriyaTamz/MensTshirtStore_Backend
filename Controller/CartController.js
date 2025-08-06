import Cart from "../Model/Cart.js";

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart: " + error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    console.log("userId from req.user:", req.user);
    const userId = req.user.id;
    const { productId, size, color, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product and quantity required" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      const newCart = new Cart({
        user: userId,
        items: [{ product: productId, size, color, quantity }]
      });
      await newCart.save();
      return res.status(200).json({ message: "Cart created", cart: newCart });
    }

    // Check if item already exists
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, color, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Added to cart", cart });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate cart for user" });
    }

    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size && i.color === color
    );

    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    cart.updatedAt = Date.now();

    await cart.save();
    res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating item: " + error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productId, size } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing item: " + error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = []; // Clear all items from the cart
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart: " + error.message });
  }
};