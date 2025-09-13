import express from 'express';
import Product from '../models/Product';
import { authenticate, authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// In your products route - fix the pagination parameters
router.get('/', async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize as string) || parseInt(req.query.limit as string) || 8;
    const page = parseInt(req.query.pageNumber as string) || parseInt(req.query.page as string) || 1;
    
    // Build filter object
    const filters: any = {};
    
    // Keyword search
    if (req.query.keyword || req.query.search) {
      const keyword = req.query.keyword || req.query.search;
      filters.name = {
        $regex: keyword,
        $options: 'i'
      };
    }
    
    // Category filter
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    // Price filter
    if (req.query.minPrice) {
      filters.price = { 
        ...filters.price,
        $gte: parseFloat(req.query.minPrice as string)
      };
    }
    
    if (req.query.maxPrice) {
      filters.price = { 
        ...filters.price,
        $lte: parseFloat(req.query.maxPrice as string)
      };
    }
    
    // Rating filter
    if (req.query.minRating) {
      filters.rating = { 
        $gte: parseFloat(req.query.minRating as string)
      };
    }

    // Get total count with filters
    const count = await Product.countDocuments(filters);
    
    // Calculate total pages
    const pages = Math.ceil(count / pageSize);
    
    // Get products with pagination and sorting
    let sortOption: any = { createdAt: -1 };
    
    // Sort options - support both frontend and backend naming
    if (req.query.sort) {
      const sortValue = req.query.sort as string;
      switch (sortValue) {
        case 'price-low':
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price-high':
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'name-asc':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const products = await Product.find(filters)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortOption);

    res.json({
      products,
      page,
      pages,
      total: count,
      hasNext: page < pages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// In your products route - update the single product endpoint
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name email'); // Add population here

    if (product) {
      // Increment view count
      product.views = (product.views || 0) + 1;
      await product.save();
      
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create product (admin only) - Add views field
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
      stock: req.body.stock,
      rating: 0,
      numReviews: 0,
      views: 0,
      reviews: []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.image = req.body.image || product.image;
      product.category = req.body.category || product.category;
      product.stock = req.body.stock || product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create product review - Enhanced with validation
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      title: title || '',
      comment,
      createdAt: new Date()
    };

    // Add review
    product.reviews.push(review);

    // Update rating statistics
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    // Populate the user info in the response
    const updatedProduct = await Product.findById(req.params.id).populate('reviews.user', 'name email').exec();
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found after update' });
    }
    res.status(201).json({
      message: 'Review added successfully',
      reviews: updatedProduct.reviews,
      rating: updatedProduct.rating,
      numReviews: updatedProduct.numReviews
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get product reviews with pagination
router.get('/:id/reviews', async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize as string) || 5;
    const page = parseInt(req.query.pageNumber as string) || 1;
    const sort = req.query.sort as string || 'newest';

    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name email')
      .select('reviews');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sort reviews
    let sortedReviews = [...product.reviews];
    switch (sort) {
      case 'newest':
        sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
    }

    // Paginate reviews
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      totalReviews: product.reviews.length,
      page,
      pages: Math.ceil(product.reviews.length / pageSize),
      hasNext: endIndex < product.reviews.length,
      hasPrev: page > 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get top rated products
router.get('/top/rated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const minReviews = parseInt(req.query.minReviews as string) || 1;
    
    const products = await Product.find({ 
      numReviews: { $gte: minReviews },
      rating: { $gte: 4 } 
    })
    .sort({ rating: -1, numReviews: -1 })
    .limit(limit);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get product categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories.map(cat => ({
      name: cat._id,
      count: cat.count,
      image: `/images/${cat._id.toLowerCase()}.jpg`
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get featured products (high rating + many reviews)
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const minRating = parseFloat(req.query.minRating as string) || 4.5;
    const minReviews = parseInt(req.query.minReviews as string) || 10;
    
    const products = await Product.find({
      rating: { $gte: minRating },
      numReviews: { $gte: minReviews }
    })
    .sort({ rating: -1, numReviews: -1 })
    .limit(limit);
    
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get most viewed products
router.get('/most/viewed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    
    const products = await Product.find({ views: { $gt: 0 } })
      .sort({ views: -1 })
      .limit(limit);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get products by category with enhanced filtering
router.get('/category/:category', async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize as string) || 12;
    const page = parseInt(req.query.pageNumber as string) || 1;
    const { minPrice, maxPrice, minRating, sort } = req.query;

    const filters: any = { category: req.params.category };

    // Price filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice as string);
    }

    // Rating filter
    if (minRating) {
      filters.rating = { $gte: parseFloat(minRating as string) };
    }

    const count = await Product.countDocuments(filters);
    const pages = Math.ceil(count / pageSize);

    let sortOption: any = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'price_asc': sortOption = { price: 1 }; break;
        case 'price_desc': sortOption = { price: -1 }; break;
        case 'rating': sortOption = { rating: -1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
      }
    }

    const products = await Product.find(filters)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortOption);

    res.json({
      products,
      page,
      pages,
      total: count,
      category: req.params.category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get review statistics for a product
router.get('/:id/reviews/stats', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const ratingStats = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    product.reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingStats[rating as keyof typeof ratingStats]++;
      }
    });

    res.json({
      totalReviews: product.numReviews,
      averageRating: product.rating,
      ratingDistribution: ratingStats,
      recommendedPercentage: Math.round((ratingStats[5] + ratingStats[4]) / product.numReviews * 100) || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;