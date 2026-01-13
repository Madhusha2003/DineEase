import { prisma } from '../lib/prisma.js';

// GET /api/tables
export const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany();
    res.status(200).json(tables);
  } catch (error) {
    console.error("Failed to get tables:", error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// POST /api/tables
export const createTable = async (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ error: 'tableNumber is required.' });
  }
  try {
    const newTable = await prisma.table.create({
      data: { tableNumber },
    });
    res.status(201).json(newTable);
  } catch (error) {
    // P2002 is Prisma's unique constraint violation code
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A table with this number already exists.' });
    }
    console.error("Failed to create table:", error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};