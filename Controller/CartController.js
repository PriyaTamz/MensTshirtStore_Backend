import Cart from "../Model/Cart.js";

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart: " + error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product and quantity required" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product with same size already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size
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

export const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Merge logic
    items.forEach((newItem) => {
      const existing = cart.items.find(
        (item) =>
          item.product.toString() === newItem.productId &&
          item.size === newItem.size
      );

      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        cart.items.push({
          product: newItem.productId,
          size: newItem.size,
          quantity: newItem.quantity,
        });
      }
    });

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Cart synced successfully", cart });
  } catch (err) {
    res.status(500).json({ message: "Cart sync failed", error: err.message });
  }
};
