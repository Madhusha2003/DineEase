import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing information.' });
  }

  try {
    // Database data check
    const user = await prisma.user.findUnique({ where: { email } });

    // Check user is active or not
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Access denied.' });
    }

    // PASSWORD SECURITY CHECK
    const storedPass = user.password || '';
    const isAlreadyHashed = storedPass.startsWith('$2'); // Bcrypt hashes usually start with $2
    let isMatch = false;

    if (isAlreadyHashed) {
      // Standard way: compare typed password with the "scrambled" one in DB
      isMatch = await bcrypt.compare(password, storedPass);
    } else {
      // Old way: direct comparison
      isMatch = (password === storedPass);
      
      // AUTO-UPGRADE: If it matched, hash it now for better security!
      if (isMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({ 
          where: { id: user.id }, 
          data: { password: hashedPassword } 
        });
      }
    }

    if (!isMatch) return res.status(401).json({ error: 'Wrong password.' });

    // (JWT)
    // We put the 'role' in the payload so the frontend knows where to send them.
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    // 5. SEND TO FRONTEND
    res.json({ token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/setup-status
// @desc    Check if the system needs initial admin setup
// @access  Public
router.get('/setup-status', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ needsSetup: userCount === 0 });
  } catch (error) {
    console.error("Setup status error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/setup-admin
// @desc    Create the first admin account
// @access  Public (Only if no users exist)
router.post('/setup-admin', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(403).json({ error: 'Setup already completed.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all fields.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

export default router;
