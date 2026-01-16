import express from 'express';
import bcrypt from 'bcryptjs';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const { Role } = pkg;

// @route   POST /api/users
// @desc    Register a new user
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please provide all required fields: name, email, password, role.' });
  }

  if (!Object.values(Role).includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            }
        });
        res.json(users);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Server error' });
    }
});

export default router;
