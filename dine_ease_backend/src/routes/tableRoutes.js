import { Router } from 'express';
import { getAllTables, createTable, deleteTable } from '../controllers/tableController.js';

const router = Router();

router.route('/')
  .get(getAllTables)
  .post(createTable);

router.route('/:id')
  .delete(deleteTable);

export default router;