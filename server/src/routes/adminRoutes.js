import { Router } from 'express';
import { deleteUser, getAdminStats, listUsers, resetUserPassword, toggleUserStatus } from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/stats', getAdminStats);
router.get('/users', listUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.post('/users/:userId/reset-password', resetUserPassword);
router.delete('/users/:userId', deleteUser);

export default router;
