import { Request, Response } from "express";
import { IUser } from "../models/User";
import User from "../models/User";
import Product, { IProduct } from "../models/Product";

interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get user's cart
// @route   GET /api/users/cart
// @access  Private
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate(
      "cart.items.product",
      "name price image category stock"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate total amount (since virtual might not work in all cases)
    const totalAmount = user.cart.items.reduce((total, item) => {
      const product = item.product as IProduct;
      return total + item.quantity * (product.price || 0);
    }, 0);

    res.json({
      items: user.cart.items,
      totalAmount,
      totalItems: user.cart.totalItems,
      updatedAt: user.cart.updatedAt,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product is already in cart
    const existingItemIndex = user.cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity =
        user.cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Cannot exceed available stock of ${product.stock}`,
        });
      }

      user.cart.items[existingItemIndex].quantity = newQuantity;
      user.cart.items[existingItemIndex].addedAt = new Date();
    } else {
      // Add new item
      user.cart.items.push({
        product: productId,
        quantity,
        addedAt: new Date(),
      });
    }

    // Update totals
    user.cart.totalItems = user.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    user.cart.updatedAt = new Date();

    await user.save();

    // Populate response
    await user.populate(
      "cart.items.product",
      "name price image category stock"
    );

    const totalAmount = user.cart.items.reduce((total, item) => {
      const prod = item.product as IProduct;
      return total + item.quantity * (prod.price || 0);
    }, 0);

    res.json({
      items: user.cart.items,
      totalAmount,
      totalItems: user.cart.totalItems,
      updatedAt: user.cart.updatedAt,
    });
  } catch (error: any) {
    console.error("Add to cart error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/users/cart/:productId
// @access  Private
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = user.cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity === 0) {
      // Remove item
      user.cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock
      if (quantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items available in stock`,
        });
      }

      user.cart.items[itemIndex].quantity = quantity;
      user.cart.items[itemIndex].addedAt = new Date();
    }

    // Update totals
    user.cart.totalItems = user.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    user.cart.updatedAt = new Date();

    await user.save();

    // Populate response
    await user.populate(
      "cart.items.product",
      "name price image category stock"
    );
    const totalAmount = user.cart.items.reduce(
      (total, item) => total + item.quantity * product.price,
      0
    );

    res.json({
      items: user.cart.items,
      totalAmount,
      totalItems: user.cart.totalItems,
      updatedAt: user.cart.updatedAt,
    });
  } catch (error: any) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = user.cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    user.cart.items.splice(itemIndex, 1);

    // Update totals
    user.cart.totalItems = user.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    user.cart.updatedAt = new Date();

    await user.save();

    res.json({ message: "Item removed from cart" });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Clear cart
// @route   DELETE /api/users/cart
// @access  Private
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart.items = [];
    user.cart.totalItems = 0;
    user.cart.updatedAt = new Date();

    await user.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error: any) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
