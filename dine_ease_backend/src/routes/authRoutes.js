import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
