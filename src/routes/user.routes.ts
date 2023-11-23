// user.routes.ts
import express from 'express';
import { createUser, getUsers, updateUser } from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/create', isAuthenticated, isAdmin, createUser);
router.get('/list', isAuthenticated, isAdmin, getUsers);
router.put('/update/:id', isAuthenticated, isAdmin, updateUser);

export default router;
