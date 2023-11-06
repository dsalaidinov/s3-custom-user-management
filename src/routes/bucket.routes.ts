// bucket.routes.ts
import express from 'express';
import { createBucket, getBuckets, getBucketsByUser, getObjectsInBucketByUser } from '../controllers/bucket.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createBucket);
router.get('/list', isAuthenticated, isAdmin, getBuckets);
router.get('/list-by-user', isAuthenticated, isAdmin, getBucketsByUser);
router.get('/list-objects-by-user', isAuthenticated, isAdmin, getObjectsInBucketByUser);

export default router;
