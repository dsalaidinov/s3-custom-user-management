// resource.routes.ts
import express from 'express';
import { createResource, getResources } from '../controllers/resource.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createResource);
router.get('/list', isAuthenticated, isAdmin, getResources);

export default router;
