import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload and attach to request
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, isActive: true }
      });

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ error: 'Not authorized, user not found or inactive' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Middleware to check for Admin role
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};
