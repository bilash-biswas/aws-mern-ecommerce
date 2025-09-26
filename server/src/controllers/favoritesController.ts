import { Request, Response } from 'express';
import { IUser } from '../models/User';
import User from '../models/User';
import Product from '../models/Product';

interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get user's favorites
// @route   GET /api/users/favorites
// @access  Private
export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id)
      .populate('favorites.product', 'name price image category stock rating');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add product to favorites
// @route   POST /api/users/favorites
// @access  Private
export const addToFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if product is already in favorites
    const isAlreadyFavorite = user.favorites.some(
      fav => fav.product.toString() === productId
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({ message: 'Product already in favorites' });
    }

    // Add to favorites
    user.favorites.push({
      product: productId,
      addedAt: new Date()
    });

    await user.save();

    // Populate the response
    await user.populate('favorites.product', 'name price image category stock rating');

    res.status(201).json(user.favorites);
  } catch (error: any) {
    console.error('Add to favorites error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove product from favorites
// @route   DELETE /api/users/favorites/:productId
// @access  Private
export const removeFromFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favoriteIndex = user.favorites.findIndex(
      fav => fav.product.toString() === productId
    );

    if (favoriteIndex === -1) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    res.json({ message: 'Product removed from favorites' });
  } catch (error: any) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if product is in favorites
// @route   GET /api/users/favorites/check/:productId
// @access  Private
export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorites.some(
      fav => fav.product.toString() === productId
    );

    res.json({ isFavorite });
  } catch (error: any) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Sync favorites with server
// @route   POST /api/users/favorites/sync
// @access  Private
export const syncFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate all product IDs
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some product IDs are invalid' });
    }

    // Get existing favorite product IDs
    const existingProductIds = user.favorites.map(fav => fav.product.toString());

    // Add new favorites (avoid duplicates)
    const newProductIds = productIds.filter(id => !existingProductIds.includes(id));
    const newFavorites = newProductIds.map(productId => ({
      product: productId,
      addedAt: new Date()
    }));

    user.favorites.push(...newFavorites);
    await user.save();

    // Populate response
    await user.populate('favorites.product', 'name price image category stock rating');

    res.json({
      message: `Synced ${newFavorites.length} favorites`,
      favorites: user.favorites
    });
  } catch (error: any) {
    console.error('Sync favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};