import { prisma } from '../lib/prisma.js';

/// POST /api/orders
export const createOrder = async (req, res) => {
  const { tableId, cart } = req.body;


  try {
    
    // Get current prices from the Database
    // This prevents someone from "hacking" the price in the browser.
    const itemIds = cart.map(item => item.id);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } }
    });

    // 4. Calculate Total
    let calculatedTotal = 0;
    const orderItemsData = cart.map(cartItem => {
      const menuItem = dbMenuItems.find(dbItem => dbItem.id === cartItem.id);
      
      if (!menuItem) throw new Error(`Item with ID ${cartItem.id} no longer exists.`);
      
      calculatedTotal += menuItem.price * cartItem.quantity;

      return {
        menuItemId: menuItem.id,
        quantity: cartItem.quantity,
        // size and note 
      };
    });

    // 5. Create Order and OrderItems (Prisma Nested Write)
    const newOrder = await prisma.order.create({
      data: {
        tableId: parseInt(tableId),
        total: calculatedTotal,
        status: "NEW", // This matches your Enum OrderStatus
        items: {
          create: orderItemsData // This automatically populates the OrderItem table
        }
      },
      // This tells Prisma to include the items in the response so the frontend can see them
      include: {
        items: {
          include: {
            menuItem: true // Also include the name/image of the food
          }
        }
      }
    });

    // 6. Success!
    res.status(201).json(newOrder);

  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
};


// GET /api/orders/:id
// Fetches a single order by its ID, including all items and their details.
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          orderBy: { id: 'asc' },
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(`Failed to get order with id ${id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred while fetching the order.' });
  }
};

// PUT /api/orders/:id/item
// Manages items in a cart: adds, updates quantity, or removes.
export const manageOrderItem = async (req, res) => {
  const { id: orderId } = req.params;
  const { menuItemId, quantity } = req.body; // quantity is the CHANGE in quantity (+1, -1, etc.)

  if (!menuItemId || quantity === undefined) {
    return res.status(400).json({ error: 'menuItemId and quantity are required.' });
  }

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const existingItem = await tx.orderItem.findFirst({
        where: {
          orderId: parseInt(orderId),
          menuItemId: parseInt(menuItemId),
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > 0) {
          await tx.orderItem.update({ where: { id: existingItem.id }, data: { quantity: newQuantity } });
        } else {
          await tx.orderItem.delete({ where: { id: existingItem.id } });
        }
      } else if (quantity > 0) {
        await tx.orderItem.create({
          data: {
            orderId: parseInt(orderId),
            menuItemId: parseInt(menuItemId),
            quantity: quantity,
          },
        });
      }

      // Recalculate total price and return the updated order
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: parseInt(orderId) },
        include: { menuItem: true },
      });
      const total = orderItems.reduce((sum, item) => sum + item.quantity * item.menuItem.price, 0);

      return tx.order.update({
        where: { id: parseInt(orderId) },
        data: { total },
        include: { items: { orderBy: { id: 'asc' }, include: { menuItem: true } } },
      });
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(`Failed to manage item for order ${orderId}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};