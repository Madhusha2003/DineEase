import { prisma } from '../lib/prisma.js';

// GET /api/menu-items
// Fetches all menu items.
// By default, only returns items where `isAvailable` is true.
// Use the query parameter `?showAll=true` to fetch all items (for admin views).
export const getAllMenuItems = async (req, res) => {
  const { showAll } = req.query;

  try {
    const where = {};
    if (showAll !== 'true') {
      where.isAvailable = true;
    }

    const menuItems = await prisma.menuItem.findMany({ where });
    res.status(200).json(menuItems);
  } catch (error) {
    console.error("Failed to get menu items:", error);
    res.status(500).json({ error: 'An unexpected error occurred while fetching menu items.' });
  }
};

// POST /api/menu-items
// Creates a new menu item.
export const createMenuItem = async (req, res) => {
  try {
    const newItem = await prisma.menuItem.create({
      data: req.body,
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Failed to create menu item:", error);
    res.status(500).json({ error: 'An unexpected error occurred while creating the menu item.' });
  }
};

// GET /api/menu-items/:id
// Fetches a single menu item by its ID.
export const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) },
    });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    console.error(`Failed to get menu item with id ${id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred while fetching the menu item.' });
  }
};

// PUT /api/menu-items/:id
// Updates an existing menu item.
export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    // P2025 is Prisma's error code for "record to update not found"
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    console.error(`Failed to update menu item with id ${id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred while updating the menu item.' });
  }
};

// DELETE /api/menu-items/:id
// Deletes a menu item.
export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    // First, check if the menu item has any associated orders.
    const orderItemCount = await prisma.orderItem.count({
      where: { menuItemId: parseInt(id) },
    });

    if (orderItemCount > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete menu item. It has associated orders. Please mark it as unavailable instead.' 
      });
    }

    // If no orders, proceed with deletion.
    await prisma.menuItem.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // 204 No Content is standard for a successful delete.
  } catch (error) {
    // P2025 is Prisma's error code for "record to delete not found"
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    console.error(`Failed to delete menu item with id ${id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred while deleting the menu item.' });
  }
};