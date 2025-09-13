import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

// Define types for our data structures
interface BrandDictionary {
  [key: string]: string[];
}

// Categories for our products
const categories: string[] = [
  'Electronics',
  'Sports',
  'Home',
  'Accessories',
  'Fashion',
  'Books',
  'Toys',
  'Beauty',
  'Food',
  'Health'
];

// Brands for different categories
const brands: BrandDictionary = {
  Electronics: ['Samsung', 'Apple', 'Sony', 'LG', 'Bose', 'Dell', 'HP', 'Canon'],
  Sports: ['Nike', 'Adidas', 'Under Armour', 'Puma', 'Reebok', 'Wilson', 'Spalding'],
  Home: ['IKEA', 'Home Depot', 'Williams-Sonoma', 'Cuisinart', 'KitchenAid', 'Dyson'],
  Accessories: ['Fossil', 'Casio', 'Timex', 'Ray-Ban', 'Oakley'],
  Fashion: ['Zara', 'H&M', 'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger'],
  Books: ['Penguin', 'HarperCollins', 'Random House', 'Scholastic'],
  Toys: ['Lego', 'Hasbro', 'Mattel', 'Fisher-Price', 'Nerf'],
  Beauty: ['L\'Oreal', 'Maybelline', 'Nivea', 'Neutrogena', 'Olay'],
  Food: ['Kellogg\'s', 'Nestle', 'Heinz', 'Campbell\'s', 'General Mills'],
  Health: ['Johnson & Johnson', 'Bayer', 'Pfizer', 'GSK', 'Sanofi']
};

// Generate sample products that match the IProduct interface
const generateSampleProducts = (count: number = 1000): Partial<IProduct>[] => {
  const products: Partial<IProduct>[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories);
    const categoryBrands = brands[category] || ['Generic'];
    const brand = faker.helpers.arrayElement(categoryBrands);
    
    const product: Partial<IProduct> = {
      name: `${brand} ${faker.commerce.productName()}`,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
      image: `https://images.unsplash.com/photo-${faker.string.alphanumeric(10)}`,
      category: category,
      stock: faker.number.int({ min: 0, max: 100 }),
      rating: parseFloat(faker.number.float({ min: 2, max: 5 }).toFixed(1)),
      numReviews: faker.number.int({ min: 0, max: 200 }),
      reviews: [],
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date()
    };
    
    products.push(product);
  }
  
  return products;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Generate sample products
    const sampleProducts = generateSampleProducts(1000);
    
    // Insert new products
    await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${sampleProducts.length} products`);
    
    // Get some statistics
    const productCount = await Product.countDocuments();
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
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
const productCount = process.argv[2] ? parseInt(process.argv[2]) : 1000;

if (isNaN(productCount) || productCount <= 0) {
  console.error('Please provide a valid number of products to generate');
  process.exit(1);
}

console.log(`Generating ${productCount} sample products...`);
seedDatabase();