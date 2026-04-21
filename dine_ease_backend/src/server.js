import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

// import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import menuItemRoutes from './routes/menuItemRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Resolve base paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for packaged environment
const isPackaged = process.env.NODE_ENV === 'production' || !!process.versions.electron;
const resourcesPath = process.env.RESOURCES_PATH || (isPackaged ? process.resourcesPath : path.join(__dirname, '..'));

// Load environment variables from the correct path
const envPath = isPackaged
  ? path.join(resourcesPath, 'backend', '.env')
  : path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Fallback to current directory
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// check route
app.get('/api', (req, res) => {
  res.send('DineEase Backend is running!');
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', profileRoutes);

// uploads
const uploadsPath = process.env.UPLOADS_PATH || (isPackaged
  ? path.join(resourcesPath, 'backend/uploads')
  : path.join(__dirname, '../uploads'));

app.use('/uploads', express.static(uploadsPath));

// frontend
const frontendPath = isPackaged
  ? path.join(resourcesPath, 'frontend-build')
  : path.join(__dirname, '../../dine_ease_frontend/build');

app.use(express.static(frontendPath));

// fallback
app.get('*', (req, res) => {
  const indexFile = path.join(frontendPath, 'index.html');

  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Frontend build not found.');
  }
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

const localIP = getLocalIP();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://${localIP}:${PORT}`);
});