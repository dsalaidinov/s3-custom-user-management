// resource.routes.ts
import express from 'express';
import { createResource, getResources } from '../controllers/resource.controller';

const router = express.Router();

router.post('/resources', createResource);
router.get('/resources', getResources);

export default router;
