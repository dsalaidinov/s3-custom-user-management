// bucket.routes.ts
import express from 'express';
import { assignAccess, getAssings } from '../controllers/policy.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, assignAccess);
router.get('/list', isAuthenticated, isAdmin, getAssings);

export default router;
