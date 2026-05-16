// routes/user.routes.ts

import { Router } from 'express';
import Joi from 'joi';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validate';

const router = Router();


const loginSchema = Joi.object({
    user_name: Joi.required(),
    password: Joi.required(),
});

router.post(
    '/login',
    validate(loginSchema),
    AuthController.login
);

export default router;