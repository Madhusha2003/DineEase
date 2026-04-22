import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Multer setup for logo storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use UPLOADS_PATH if set (by main.js in production), fallback to local 'uploads/'
    const uploadPath = process.env.UPLOADS_PATH || 'uploads/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
  }
});

// Get the current restaurant profile
router.get('/', async (req, res) => {
  try {
    let profile = await prisma.restaurantProfile.findUnique({
      where: { id: 1 },
    });

    // If no profile exists yet, return default
    if (!profile) {
      profile = {
        name: "My Restaurant",
        logoUrl: "",
        theme: "light"
      };
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    res.status(500).json({ error: "Failed to fetch restaurant profile" });
  }
});

// Handle Logo Upload (File)
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    // We update the DB immediately or let the PUT / handle it?
    // User requested "add url or file not both, handle always only one selection"
    // So if they upload a file, we should probably update the DB with this URL.

    const profile = await prisma.restaurantProfile.upsert({
      where: { id: 1 },
      update: { logoUrl },
      create: { id: 1, name: "My Restaurant", logoUrl, theme: "light" },
    });

    res.json({ message: "Logo uploaded successfully", logoUrl, profile });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ error: error.message || "Failed to upload logo" });
  }
});

// Update the restaurant profile (Admin only)
router.put('/', async (req, res) => {
  try {
    const { name, logoUrl, theme } = req.body;

    const profile = await prisma.restaurantProfile.upsert({
      where: { id: 1 },
      update: { name, logoUrl, theme },
      create: { id: 1, name, logoUrl: logoUrl || "", theme: theme || "light" },
    });

    res.json(profile);
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    res.status(500).json({ error: "Failed to update restaurant profile" });
  }
});

export default router;
