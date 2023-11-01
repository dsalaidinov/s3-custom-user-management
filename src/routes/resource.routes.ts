// resource.routes.ts
import express from 'express';
import { createResource, getResources } from '../controllers/resource.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.post('/create', createResource);
router.get('/list', isAuthenticated, getResources);

export default router;
