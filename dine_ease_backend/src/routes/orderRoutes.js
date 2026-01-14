import { Router } from 'express';
import {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';

const router = Router();

router.route('/').get(getAllOrders).post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .delete(deleteOrder)
  
router.route('/:id/status').put(updateOrderStatus);



export default router;