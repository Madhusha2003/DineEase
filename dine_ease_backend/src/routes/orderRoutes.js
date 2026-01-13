import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  manageOrderItem,
} from '../controllers/orderController.js';

const router = Router();

router.route('/').post(createOrder);

router.route('/:id').get(getOrderById);

router.route('/:id/item').put(manageOrderItem);

export default router;