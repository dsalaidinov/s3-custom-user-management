import express from 'express';
import {
  createS3System,
  getS3Systems,
} from '../controllers/s3system.controller';

const router = express.Router();

router.post('/s3systems', createS3System); 
router.get('/s3systems', getS3Systems); 

export default router;
