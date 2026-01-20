import { prisma } from '../lib/prisma.js';

// GET /api/tables
export const getAllTables = async (req, res) => {
  try {
    // 1. Get all tables, ordered by their ID
    const tables = await prisma.table.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    // 2. Get guest counts for all active orders, grouped by table
    const guestCounts = await prisma.order.groupBy({
      by: ['tableId'],
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED'],
        },
      },
      _sum: {
        numberOfGuests: true,
      },
    });

    // 3. Create a lookup map for guest counts
    const guestCountMap = guestCounts.reduce((acc, curr) => {
      acc[curr.tableId] = curr._sum.numberOfGuests || 0;
      return acc;
    }, {});

    // 4. Combine table data with live guest counts
    const tablesWithStatus = tables.map(table => ({
      ...table,
      occupiedSeats: guestCountMap[table.id] || 0,
    }));

    res.status(200).json(tablesWithStatus);
  } catch (error) {
    console.error("Failed to get tables:", error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// POST /api/tables
export const createTable = async (req, res) => {
  const { tableNumber, capacity } = req.body;
  if (!tableNumber || !capacity) {
    return res.status(400).json({ error: 'Table number and capacity are required.' });
  }
  try {
    const newTable = await prisma.table.create({
      data: { tableNumber, capacity: parseInt(capacity) },
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

// DELETE /api/tables/:id
export const deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    // First, check if the table has any associated orders.
    const orderCount = await prisma.order.count({
      where: { tableId: parseInt(id) },
    });

    if (orderCount > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete table. It has associated orders.' 
      });
    }

    // If no orders, proceed with deletion.
    await prisma.table.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send(); // 204 No Content is standard for a successful delete.
  } catch (error) {
    if (error.code === 'P2025') { // Prisma's "record to delete not found"
      return res.status(404).json({ error: 'Table not found.' });
    }
    console.error(`Failed to delete table with id ${id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred while deleting the table.' });
  }
};
