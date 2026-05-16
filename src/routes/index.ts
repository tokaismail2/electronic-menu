import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import planRoutes from './planRoutes';
import subscriptionRoutes from './subscriptionRotes';

const router = Router();
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);


export default router; 
