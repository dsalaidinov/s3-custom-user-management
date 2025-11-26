// bucket.routes.ts
import express from 'express';
import { createBucket, getBuckets, getBucketsByUser, getObjectsInBucketByUser, downloadObject, uploadObject, previewObject, searchObject } from '../controllers/bucket.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createBucket);
router.get('/list', isAuthenticated, isAdmin, getBuckets);
router.get('/list-by-user', isAuthenticated, getBucketsByUser);
router.get('/list-objects-by-user', getObjectsInBucketByUser);
router.get('/download', downloadObject);
router.post('/upload', isAuthenticated, upload.single('file'), uploadObject);
router.get('/preview', previewObject);
router.get('/search', searchObject);


export default router;
