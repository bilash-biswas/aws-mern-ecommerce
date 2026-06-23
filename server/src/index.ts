import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import productRoutes from './routes/products';
import userRouters from './routes/users';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import newsletterRoutes from './routes/newsletter';
import favoriteRoutes from './routes/favorites'; 
import cartRoutes from './routes/cart';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Docker, Next.js client, etc.) for accurate client IP rate limiting
app.set('trust proxy', 1);

// Global Security Middleware
app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://10.0.2.2:3000',
    'http://192.168.10.235:3000',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

// Brute-force rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);



mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern_ecommerce')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRouters);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});