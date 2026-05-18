import { Router } from 'express';
import Joi from 'joi';
import { PlanController } from '../controllers/planController';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';



const router = Router();

const getAllPublicPlansSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.boolean().optional()
});

router.get(
    '/public',
    validate(getAllPublicPlansSchema, 'query'),
    PlanController.getAllPublicPlans
);

router.use(authenticate);
router.use(authorize("admin"));


const getAllPlansSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.boolean().optional(),
    isCustom: Joi.boolean().optional(),
});

const planIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const createPlanSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().required(),
    billing_cycle: Joi.string().valid('monthly', 'yearly', 'lifetime').required(),
    status: Joi.string().optional(),
    description: Joi.string().optional()
});

const updatePlanSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    price: Joi.number().optional(),
    billing_cycle: Joi.string().valid('monthly', 'yearly', 'lifetime').optional(),
    status: Joi.string().optional(),
    description: Joi.string().optional()
});

router.get(
    '/',
    validate(getAllPlansSchema, 'query'),
    PlanController.getAllPlans
);
router.get(
    '/:id',
    validate(planIdSchema, 'params'),
    PlanController.getPlanById
);
router.post(
    '/',
    validate(createPlanSchema),
    PlanController.createPlan
);


router.put(
    '/:id',
    validate(planIdSchema, 'params'),
    validate(updatePlanSchema),
    PlanController.updatePlan
);

export default router;