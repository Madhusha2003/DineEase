import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// All routes in this file are for Admins only and are protected.
router.use(protect, admin);

router.route('/')
  .post(createUser)
  .get(getAllUsers);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
