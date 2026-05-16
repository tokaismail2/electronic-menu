import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { SubscriptionController } from '../controllers/subscriptionControllers';

const router = Router();
router.use(authenticate);
router.use(authorize("admin"));


const getAllSubscriptionSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.boolean().optional()
});

const IdSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const createSubscriptionSchema = Joi.object({
    plan_id: Joi.string().hex().length(24).required(),
    user_id: Joi.string().hex().length(24).required(),
    status: Joi.string().optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    payment_method: Joi.string().required(),

});

const updateSubscriptionSchema = Joi.object({
    plan_id: Joi.string().hex().length(24).optional(),
    user_id: Joi.string().hex().length(24).optional(),
    status: Joi.string().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    payment_method: Joi.string().optional()
});

router.get(
    '/',
    validate(getAllSubscriptionSchema, 'query'),
    SubscriptionController.getAllSubscriptions
);
router.get(
    '/:id',
    validate(IdSchema, 'params'),
    SubscriptionController.getSubscriptionById
);
router.post(
    '/',
    validate(createSubscriptionSchema),
    SubscriptionController.createSubscription
);


router.put(
    '/:id',
    validate(IdSchema, 'params'),
    validate(updateSubscriptionSchema),
    SubscriptionController.updateSubscription
);

export default router;