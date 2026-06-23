import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

// Define types for our data structures
interface BrandDictionary {
  [key: string]: string[];
}

interface CategoryDetails {
  description: string;
  minPrice: number;
  maxPrice: number;
  keywords: string[];
}

// Enhanced categories with details
const categories: { [key: string]: CategoryDetails } = {
  'Electronics': {
    description: 'Cutting-edge gadgets and devices',
    minPrice: 20,
    maxPrice: 2000,
    keywords: ['smart', 'wireless', 'digital', 'high-tech', 'portable']
  },
  'Sports': {
    description: 'Equipment and apparel for athletic activities',
    minPrice: 15,
    maxPrice: 500,
    keywords: ['performance', 'training', 'athletic', 'professional', 'outdoor']
  },
  'Home': {
    description: 'Products for home living and improvement',
    minPrice: 10,
    maxPrice: 1000,
    keywords: ['comfort', 'decor', 'functional', 'stylish', 'practical']
  },
  'Accessories': {
    description: 'Complementary items to enhance your style',
    minPrice: 5,
    maxPrice: 300,
    keywords: ['fashionable', 'trendy', 'complementary', 'stylish', 'elegant']
  },
  'Fashion': {
    description: 'Clothing and apparel for all occasions',
    minPrice: 15,
    maxPrice: 400,
    keywords: ['trendy', 'fashionable', 'comfortable', 'stylish', 'modern']
  },
  'Books': {
    description: 'Literature and educational materials',
    minPrice: 5,
    maxPrice: 50,
    keywords: ['informative', 'engaging', 'educational', 'inspiring', 'knowledgeable']
  },
  'Toys': {
    description: 'Playthings and games for all ages',
    minPrice: 8,
    maxPrice: 150,
    keywords: ['fun', 'educational', 'creative', 'interactive', 'engaging']
  },
  'Beauty': {
    description: 'Cosmetics and personal care products',
    minPrice: 8,
    maxPrice: 200,
    keywords: ['nourishing', 'rejuvenating', 'luxurious', 'pampering', 'refreshing']
  },
  'Food': {
    description: 'Gourmet and specialty food items',
    minPrice: 3,
    maxPrice: 100,
    keywords: ['delicious', 'fresh', 'flavorful', 'premium', 'organic']
  },
  'Health': {
    description: 'Wellness and healthcare products',
    minPrice: 10,
    maxPrice: 150,
    keywords: ['healthy', 'nutritious', 'beneficial', 'natural', 'wholesome']
  },
  'Automotive': {
    description: 'Car accessories and maintenance products',
    minPrice: 10,
    maxPrice: 500,
    keywords: ['durable', 'reliable', 'efficient', 'performance', 'maintenance']
  },
  'Baby': {
    description: 'Products for infants and toddlers',
    minPrice: 8,
    maxPrice: 200,
    keywords: ['safe', 'gentle', 'comfortable', 'nurturing', 'soft']
  },
  'Garden': {
    description: 'Gardening tools and outdoor living',
    minPrice: 10,
    maxPrice: 300,
    keywords: ['natural', 'durable', 'outdoor', 'growing', 'fresh']
  },
  'Pet Supplies': {
    description: 'Products for your furry friends',
    minPrice: 5,
    maxPrice: 150,
    keywords: ['healthy', 'fun', 'comfortable', 'nutritious', 'engaging']
  },
  'Office Supplies': {
    description: 'Products for workspace organization',
    minPrice: 3,
    maxPrice: 100,
    keywords: ['organized', 'efficient', 'professional', 'functional', 'practical']
  }
};

// Enhanced brands for different categories
const brands: BrandDictionary = {
  'Electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Bose', 'Dell', 'HP', 'Canon', 'Nikon', 'Microsoft', 'Google', 'Xiaomi', 'Huawei', 'OnePlus'],
  'Sports': ['Nike', 'Adidas', 'Under Armour', 'Puma', 'Reebok', 'Wilson', 'Spalding', 'Columbia', 'The North Face', 'Asics', 'New Balance'],
  'Home': ['IKEA', 'Home Depot', 'Williams-Sonoma', 'Cuisinart', 'KitchenAid', 'Dyson', 'Philips', 'Black+Decker', 'OXO', 'Rubbermaid'],
  'Accessories': ['Fossil', 'Casio', 'Timex', 'Ray-Ban', 'Oakley', 'Michael Kors', 'Kate Spade', 'Tiffany & Co.', 'Swarovski', 'Victorinox'],
  'Fashion': ['Zara', 'H&M', 'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren', 'Gap', 'Forever 21', 'Uniqlo', 'Gucci', 'Louis Vuitton'],
  'Books': ['Penguin', 'HarperCollins', 'Random House', 'Scholastic', 'Simon & Schuster', 'Macmillan', 'Hachette', 'Oxford University Press'],
  'Toys': ['Lego', 'Hasbro', 'Mattel', 'Fisher-Price', 'Nerf', 'Barbie', 'Hot Wheels', 'Play-Doh', 'Melissa & Doug', 'VTech'],
  'Beauty': ['L\'Oreal', 'Maybelline', 'Nivea', 'Neutrogena', 'Olay', 'Estée Lauder', 'Clinique', 'MAC', 'Sephora', 'Kiehl\'s'],
  'Food': ['Kellogg\'s', 'Nestle', 'Heinz', 'Campbell\'s', 'General Mills', 'Kraft', 'Unilever', 'PepsiCo', 'Coca-Cola', 'Danone'],
  'Health': ['Johnson & Johnson', 'Bayer', 'Pfizer', 'GSK', 'Sanofi', 'Nature Made', 'Centrum', 'Nature\'s Bounty', 'Solgar'],
  'Automotive': ['Shell', 'Castrol', 'Bosch', '3M', 'Goodyear', 'Michelin', 'Mobil 1', 'Valvoline', 'STP', 'ACDelco'],
  'Baby': ['Gerber', 'Pampers', 'Huggies', 'Johnson\'s', 'Avent', 'Playtex', 'Babyganics', 'Summer Infant', 'Graco', 'Fisher-Price'],
  'Garden': ['Scotts', 'Miracle-Gro', 'Weber', 'Black+Decker', 'Fiskars', 'Ames', 'True Temper', 'Gardena', 'Husqvarna'],
  'Pet Supplies': ['Purina', 'Pedigree', 'Whiskas', 'Royal Canin', 'Iams', 'Hill\'s Science Diet', 'Greenies', 'Kong', 'Hartz'],
  'Office Supplies': ['3M', 'Staples', 'Sharpie', 'Pilot', 'Bic', 'Ticonderoga', 'Post-it', 'Scotch', 'Dymo', 'Fellowes']
};

// Category-specific product names
const productNames: { [key: string]: string[] } = {
  'Electronics': ['Smartphone', 'Laptop', 'Tablet', 'Smart Watch', 'Headphones', 'Bluetooth Speaker', 'Camera', 'Gaming Console', 'TV', 'Monitor'],
  'Sports': ['Running Shoes', 'Yoga Mat', 'Basketball', 'Tennis Racket', 'Dumbbell Set', 'Exercise Bike', 'Sports Jersey', 'Water Bottle', 'Backpack', 'Fitness Tracker'],
  'Home': ['Coffee Maker', 'Blender', 'Vacuum Cleaner', 'Air Purifier', 'Desk Lamp', 'Cookware Set', 'Cutting Board', 'Storage Bins', 'Bedding Set', 'Curtains'],
  'Accessories': ['Sunglasses', 'Wristwatch', 'Wallet', 'Handbag', 'Necklace', 'Bracelet', 'Earrings', 'Scarf', 'Hat', 'Belt'],
  'Fashion': ['T-Shirt', 'Jeans', 'Dress', 'Sweater', 'Jacket', 'Skirt', 'Shorts', 'Swimwear', 'Suit', 'Coat'],
  'Books': ['Novel', 'Cookbook', 'Biography', 'Science Fiction', 'Mystery', 'Self-Help', 'History', 'Children\'s Book', 'Textbook', 'Poetry'],
  'Toys': ['Building Blocks', 'Action Figure', 'Doll', 'Puzzle', 'Board Game', 'Remote Control Car', 'Stuffed Animal', 'Art Set', 'Science Kit', 'Outdoor Playset'],
  'Beauty': ['Moisturizer', 'Foundation', 'Lipstick', 'Mascara', 'Perfume', 'Shampoo', 'Conditioner', 'Face Mask', 'Sunscreen', 'Serum'],
  'Food': ['Chocolate', 'Coffee', 'Tea', 'Snack Bars', 'Cereal', 'Pasta', 'Sauce', 'Cookies', 'Crackers', 'Jam'],
  'Health': ['Multivitamin', 'Protein Powder', 'Omega-3', 'Probiotic', 'Vitamin D', 'Calcium', 'Fiber Supplement', 'Weight Management', 'Joint Support', 'Sleep Aid'],
  'Automotive': ['Motor Oil', 'Car Wax', 'Air Filter', 'Windshield Wipers', 'Car Mat', 'Jump Starter', 'Tire Pressure Gauge', 'Cleaning Kit', 'Car Cover', 'GPS Navigator'],
  'Baby': ['Diapers', 'Baby Wipes', 'Baby Formula', 'Baby Food', 'Pacifier', 'Bottle', 'Bib', 'Onesie', 'Rattle', 'Teether'],
  'Garden': ['Gardening Gloves', 'Pruning Shears', 'Watering Can', 'Garden Hose', 'Plant Pot', 'Seeds', 'Fertilizer', 'Lawn Mower', 'Weed Killer', 'Outdoor Furniture'],
  'Pet Supplies': ['Pet Food', 'Pet Treats', 'Pet Toy', 'Pet Bed', 'Pet Collar', 'Pet Leash', 'Pet Bowl', 'Pet Grooming', 'Pet Carrier', 'Litter Box'],
  'Office Supplies': ['Notebook', 'Pen', 'Pencil', 'Stapler', 'Paper Clips', 'Binder', 'Folder', 'Tape', 'Calculator', 'Desk Organizer']
};

// Enhanced images with category-specific images
const categoryImages: { [key: string]: string[] } = {
  'Electronics': [
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Home': [
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Books': [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Toys': [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Beauty': [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595877244574-e90ce41ce089?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Food': [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Health': [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ]
};

// Generate realistic product descriptions
const generateProductDescription = (category: string, productName: string, brand: string): string => {
  const details = categories[category];
  const keyword = faker.helpers.arrayElement(details.keywords);
  
  const descriptions = [
    `Experience the ${keyword} quality of ${brand}'s ${productName}. Designed for those who appreciate excellence in ${category.toLowerCase()}.`,
    `The ${brand} ${productName} redefines what you can expect from ${category.toLowerCase()} products with its innovative design and superior performance.`,
    `Discover the perfect blend of style and functionality with ${brand}'s ${productName}. A must-have for any ${category.toLowerCase()} enthusiast.`,
    `Elevate your ${category.toLowerCase()} collection with the premium ${productName} from ${brand}. Crafted with attention to detail and quality materials.`,
    `${brand} presents the ${productName} - a revolutionary product that sets new standards in the ${category.toLowerCase()} category.`
  ];
  
  return faker.helpers.arrayElement(descriptions);
};

// Generate sample products that match the IProduct interface
const generateSampleProducts = (count: number = 1000000): Partial<IProduct>[] => {
  const products: Partial<IProduct>[] = [];
  const categoryKeys = Object.keys(categories);
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categoryKeys);
    const categoryDetails = categories[category];
    const categoryBrands = brands[category] || ['Generic'];
    const brand = faker.helpers.arrayElement(categoryBrands);
    const productType = faker.helpers.arrayElement(productNames[category] || [faker.commerce.productName()]);
    
    const productName = `${brand} ${productType} ${faker.helpers.arrayElement(['Pro', 'Elite', 'Premium', 'Advanced', 'Max', 'Plus', ''])}`.trim();
    
    const product: Partial<IProduct> = {
      name: productName,
      description: generateProductDescription(category, productType, brand),
      price: parseFloat(faker.commerce.price({ 
        min: categoryDetails.minPrice, 
        max: categoryDetails.maxPrice, 
        dec: 2 
      })),
      image: faker.helpers.arrayElement(categoryImages[category] || [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      category: category,
      stock: faker.number.int({ min: 0, max: 200 }),
      rating: parseFloat(faker.number.float({ min: 3, max: 5 }).toFixed(1)),
      numReviews: faker.number.int({ min: 0, max: 500 }),
      views: faker.number.int({ min: 0, max: 5000 }),
      totalSell: faker.number.int({ min: 0, max: 1000 }),
      reviews: [],
      discount: faker.datatype.boolean({ probability: 0.3 }) 
        ? faker.number.int({ min: 5, max: 30 }) 
        : 0,
      createdAt: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }),
      updatedAt: new Date()
    };
    
    products.push(product);
  }
  
  return products;
};

// Generate realistic reviews for products
const generateReviews = (productId: mongoose.Types.ObjectId, count: number) => {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    reviews.push({
      user: new mongoose.Types.ObjectId(), // Random user ID
      name: faker.person.fullName(),
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.sentences(2),
      createdAt: faker.date.past({ years: 1 })
    });
  }
  return reviews;
};

const seedDatabase = async (count: number) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Generate sample products
    const sampleProducts = generateSampleProducts(count);
    
    // Insert new products in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < sampleProducts.length; i += batchSize) {
      const batch = sampleProducts.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(sampleProducts.length / batchSize)}`);
    }
    
    console.log(`Successfully inserted ${sampleProducts.length} products`);
    
    // Add reviews to some products
    const products = await Product.find({});
    for (const product of products) {
      if (faker.datatype.boolean({ probability: 0.7 })) { // 70% of products get reviews
        const reviewCount = faker.number.int({ min: 1, max: 15 });
        const reviews = generateReviews(product.id, reviewCount);
        
        // Calculate new average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
        
        await Product.findByIdAndUpdate(product._id, {
          reviews,
          rating: averageRating,
          numReviews: reviewCount
        });
      }
    }
    
    console.log('Added reviews to products');
    
    // Get some statistics
    const productCount = await Product.countDocuments();
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`Total products in database: ${productCount}`);
    console.log('Products by category:');
    categoryCounts.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Handle command line arguments
const productCount = process.argv[2] ? parseInt(process.argv[2]) : 1000000;

if (isNaN(productCount) || productCount <= 0) {
  console.error('Please provide a valid number of products to generate');
  process.exit(1);
}

console.log(`Generating ${productCount} realistic sample products...`);
seedDatabase(productCount);