import { Router } from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuItemController.js';

const router = Router();

router.route('/')
  .get(getAllMenuItems)
  .post(createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(updateMenuItem)
  .delete(deleteMenuItem);



export default router;