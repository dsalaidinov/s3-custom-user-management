// bucket.routes.ts
import express from 'express';
import { createBucket, getBuckets } from '../controllers/bucket.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createBucket);
router.get('/list', isAuthenticated, isAdmin, getBuckets);

export default router;
