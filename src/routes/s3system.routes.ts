import express from 'express';
import {
  createS3System,
  getS3Systems,
  getS3SystemsByUser,
  updateS3System,
} from '../controllers/s3system.controller';
import { isAdmin } from '../middleware/isAdmin';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createS3System); 
router.get('/list', isAuthenticated, isAdmin, getS3Systems); 
router.get('/list-system-by-user', isAuthenticated, getS3SystemsByUser); 
router.put('/update/:id', isAuthenticated, isAdmin, updateS3System); 

export default router;
