import { prisma } from '../lib/prisma.js';

// GET /api/orders
// Fetches all orders.
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        table: true,
         // Include table details
        items: {
          include: {
            menuItem: true, // Include menu item details for each order item
          },
        },
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to get orders:", error);
    res.status(500).json({ error: 'An unexpected error occurred while fetching orders.' });
  }
};

/// POST /api/orders
export const createOrder = async (req, res) => {
  const { tableId, cart } = req.body;


  try {
    
    // Get current prices from the Database
    const itemIds = cart.map(item => item.id);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } }
    });

    // Calculate Total
    let calculatedTotal = 0;
    const orderItemsData = cart.map(cartItem => {
      const menuItem = dbMenuItems.find(dbItem => dbItem.id === cartItem.id);
      
      if (!menuItem) throw new Error(`Item with ID ${cartItem.id} no longer exists.`);
      
      calculatedTotal += menuItem.price * cartItem.quantity;

      return {
        menuItemId: menuItem.id,
        quantity: cartItem.quantity,
        size: cartItem.size,
        // note
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

// PUT /api/orders/:id/status
// Updates the status of a single order.
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["NEW", "PROCESSING", "READY", "SERVED", "CANCELLED"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: status },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    if (error.code === 'P2025') { // Prisma's "record to update not found"
      return res.status(404).json({ error: 'Order not found.' });
    }
    console.error(`Failed to update order status for id ${id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred while updating the order status.' });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    // FIRST: Delete all items belonging to this order
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // SECOND: Delete the order itself
    await prisma.order.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: "Order and items deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};