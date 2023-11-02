import express from 'express';
import {
  createS3System,
  getS3Systems,
} from '../controllers/s3system.controller';
import { isAdmin } from '../middleware/isAdmin';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createS3System); 
router.get('/list', isAuthenticated, isAdmin, getS3Systems); 

export default router;
