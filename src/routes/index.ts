import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import planRoutes from './planRoutes';
import subscriptionRoutes from './subscriptionRotes';
import dashboardRoutes from './dashboardRoutes'

const router = Router();
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/dashboard', dashboardRoutes);


export default router; 
