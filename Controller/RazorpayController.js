import Order from "../Model/RazorpayOrder.js";
import Cart from "../Model/Cart.js";
import Address from "../Model/Address.js";
import { razorpayInstance } from "../Utils/razorpay.js";
import User from "../Model/User.js";
import crypto from "crypto";

export const checkoutOrder = async (req, res) => {
  try {
    console.log("🔹 req.user:", req.user);

    const { addressId, method } = req.body;

    if (!addressId || !method) {
      return res
        .status(400)
        .json({ message: "Address and method are required" });
    }

    // Validate address
    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
    });
    console.log("🔹 Address found:", address);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Fetch cart and populate products
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    console.log("🔹 Cart found:", cart);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Map cart items
    const cartItems = cart.items.map((item) => ({
      productId: item.product._id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    console.log("🔹 Total amount:", totalAmount);

    // Prepare order data
    const orderData = {
      user: req.user.id,
      address: address._id,
      cartItems: cartItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      totalAmount,
      method,
      status: method === "cod" ? "Pending" : "Initiated",
    };

    // Create Razorpay order if needed
    if (method === "razorpay") {
      if (!razorpayInstance) {
        return res
          .status(500)
          .json({ message: "Razorpay instance not initialized" });
      }

      const razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(totalAmount * 100), // in paise, integer
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`,
      });
      console.log("🔹 Razorpay order created:", razorpayOrder);

      orderData.razorpayOrderId = razorpayOrder.id;
    }

    // Save order in DB
    const order = await Order.create(orderData);
    console.log("🔹 Order created:", order._id);

    res.status(200).json({
      message: "Order created successfully",
      orderId: order._id,
      method,
      razorpayOrderId: order.razorpayOrderId || null,
      items: cartItems,
      totalAmount,
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    //console.log("🔍 Incoming payload:", {razorpay_order_id,razorpay_payment_id,razorpay_signature,orderId });

    // Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res
        .status(400)
        .json({ message: "Missing required Razorpay fields" });
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    //console.log("✅ Generated Signature:", generatedSignature);
    //console.log("✅ Received Signature:", razorpay_signature);

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "Paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Payment verified and order confirmed", order });
  } catch (error) {
    console.error("Error during Razorpay verification:", error);
    res
      .status(500)
      .json({ message: "Payment verification failed", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("cartItems.productId", "title price image")
      .populate("address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email phone")
      .populate("cartItems.productId", "title price image")
      .populate("address", "fullName address city state pincode phone")
      .sort({ createdAt: -1 });

    const ordersWithUserAddresses = await Promise.all(
      orders.map(async (order) => {
        let userAddresses = [];
        if (order.user) {
          userAddresses = await Address.find({ user: order.user._id }).select(
            "fullName phone address city state pincode isDefault"
          );
        }
        return {
          ...order.toObject(),
          user: order.user
            ? { ...order.user.toObject(), addresses: userAddresses }
            : null,
        };
      })
    );

    res.status(200).json({ success: true, orders: ordersWithUserAddresses });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email phone createdAt");

    // Fetch addresses for each user
    const userDataWithAddress = await Promise.all(
      users.map(async (user) => {
        const addresses = await Address.find({ user: user._id });
        return {
          ...user.toObject(),
          addresses,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users: userDataWithAddress,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const returnProduct = async (req, res) => {
  try {
    const { orderId, productId, reason } = req.body;

    if (!orderId || !productId || !reason) {
      return res
        .status(400)
        .json({ message: "Order ID, Product ID, and reason are required" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order is within return window (7 days)
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffInDays = (today - orderDate) / (1000 * 60 * 60 * 24);

    if (diffInDays > 7) {
      return res.status(400).json({
        message: "Return period expired. You can only return within 7 days.",
      });
    }

    const item = order.cartItems.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    if (item.returnRequested) {
      return res
        .status(400)
        .json({ message: "Return already requested for this product" });
    }

    item.returnRequested = true;
    item.returnReason = reason;

    await order.save();

    // Return the updated order
    res.status(200).json({
      message: "Return request submitted successfully",
      order, // <--- send back the updated order
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Return request failed", error: error.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;

    if (!orderId || !paymentId) {
      return res
        .status(400)
        .json({ message: "Order ID and payment ID are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Refunded") {
      return res.status(400).json({ message: "Order already refunded" });
    }

    if (order.status !== "Paid") {
      return res
        .status(400)
        .json({ message: "Order not paid yet, cannot refund" });
    }

    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined,
    });

    order.status = "Refunded";
    order.refundDetails = {
      refundId: refund.id,
      refundedAt: new Date(),
      amount: refund.amount / 100,
    };
    await order.save();

    res.status(200).json({ message: "Refund successful", refund });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ message: "Refund failed", error: error.message });
  }
};

