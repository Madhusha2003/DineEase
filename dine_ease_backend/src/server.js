import express from 'express';
import cors from 'cors';

// import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import menuItemRoutes from './routes/menuItemRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Initialize Express app and Prisma Client
const app = express();
const PORT = process.env.PORT || 3001;
// const PORT = process.env.PORT || 8000;

// Enable CORS for all routes to allow frontend requests
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// check route
app.get('/api', (req, res) => {
  res.send('DineEase Backend is running!');
});

// Use the routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
