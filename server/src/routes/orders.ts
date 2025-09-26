import express from "express";
import Order from "../models/Order";
import { IOrderItem } from "../models/Order";
import { authenticate, authenticateAdmin } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

// Create new order
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const Product = mongoose.model("Product");

    // Validate products and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.name || item.product} not found` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Only ${product.stock} available`,
        });
      }
    }

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, totalSell: +item.quantity },
      });
    }

    const order = new Order({
      orderItems: orderItems.map((item: IOrderItem) => ({
        ...item,
        product: item.product // Ensure product is ObjectId
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    
    // Clear user's cart after successful order
    try {
      const User = mongoose.model("User");
      await User.findByIdAndUpdate(req.user._id, {
        $set: { 
          "cart.items": [],
          "cart.totalItems": 0,
          "cart.updatedAt": new Date()
        }
      });
    } catch (cartError) {
      console.error("Error clearing cart:", cartError);
      // Don't fail the order if cart clearing fails
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // Check if user owns the order or is admin
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        return res.status(401).json({ message: "Not authorized" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order to paid
router.put("/:id/pay", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Pay order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order to shipped
router.put("/:id/ship", authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (!order.isPaid) {
        return res.status(400).json({ message: "Order must be paid before shipping" });
      }

      order.isShipped = true;
      order.shippedAt = new Date();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Ship order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order to delivered
router.put("/:id/deliver", authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Deliver order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get logged in user orders
router.get("/my/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (admin only)
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;