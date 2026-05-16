// routes/user.routes.ts

import { Router } from 'express';
import Joi from 'joi';
import { UserController } from '../controllers/userController';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(authorize("admin"));


const getAllUsersSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    is_active: Joi.boolean().optional()
});

const userIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const createUserSchema = Joi.object({
    user_name: Joi.string().min(2).max(100).required(),
    password: Joi.string().min(6).required(),
    is_active: Joi.boolean().optional()
});

const updateUserSchema = Joi.object({
    user_name: Joi.string().min(2).max(100).optional(),
    password: Joi.string().min(6).optional(),
    is_active: Joi.boolean().optional()
});

router.get(
    '/',
    validate(getAllUsersSchema, 'query'),
    UserController.getAllUsers
);
router.get(
    '/:id',
    validate(userIdSchema, 'params'),
    UserController.getUserById
);
router.post(
    '/',
    validate(createUserSchema),
    UserController.createUser
);


router.put(
    '/:id',
    validate(userIdSchema, 'params'),
    validate(updateUserSchema),
    UserController.updateUser
);

export default router;