// routes/user.routes.ts

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();


router.get(
    '/admin',
    authenticate,
    authorize("admin"),
    DashboardController.getAllDashboardStats
);

export default router;