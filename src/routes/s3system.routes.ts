import express from 'express';
import {
  createS3System,
  getS3Systems,
} from '../controllers/s3system.controller';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/create', isAdmin, createS3System); 
router.get('/list', isAdmin, getS3Systems); 

export default router;
