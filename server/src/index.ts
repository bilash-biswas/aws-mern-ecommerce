import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import productRoutes from './routes/products';
import userRouters from './routes/users';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));



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



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});