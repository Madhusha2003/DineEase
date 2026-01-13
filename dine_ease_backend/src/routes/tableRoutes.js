import { Router } from 'express';
import { getAllTables, createTable } from '../controllers/tableController.js';

const router = Router();

router.route('/')
  .get(getAllTables)
  .post(createTable);

export default router;