import { Router } from 'express';
import {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  deleteHistoricalOrders
} from '../controllers/orderController.js';

const router = Router();

router.route('/').get(getAllOrders).post(createOrder);

router.route('/historical').delete(deleteHistoricalOrders);

router.route('/:id')
  .get(getOrderById)
  .delete(deleteOrder)

router.route('/:id/status').put(updateOrderStatus);



export default router;