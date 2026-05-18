import { Request, Response } from 'express';
import Plan from '../models/plan';
import Subscription from '../models/subscription';
import { AuthRequest } from '../types/express';

export class PlanController {


    static async getAllPlans(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const filter: any = {};

            if (req.query.status !== undefined) {
                filter.status = req.query.status;
            }

            if (req.query.isCustom !== undefined) {
                filter.isCustom = req.query.isCustom;
            }


            const plans = await Plan.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });

            const totalPlans = await Plan.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    plans,
                    pagination: {
                        page,
                        limit,
                        total: totalPlans,
                        pages: Math.ceil(totalPlans / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getAllPublicPlans(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const filter: any = {
                isCustom: false
            };

            if (req.query.status !== undefined) {
                filter.status = req.query.status;
            }


            const plans = await Plan.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });

            const totalPlans = await Plan.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    plans,
                    pagination: {
                        page,
                        limit,
                        total: totalPlans,
                        pages: Math.ceil(totalPlans / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getPlanById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const plan = await Plan.findById(id).lean();

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: "Plan not found",
                });
            }

            const subscriptions = await Subscription.find({
                plan_id: plan._id,
            }).populate('user_id', 'user_name')
                .populate('plan_id', 'name price')
                .lean();

            return res.json({
                success: true,
                data: {
                    plan,
                    subscriptions,
                },
            });
        } catch (error) {
            console.error("Get plan by ID error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async updatePlan(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updatedPlan = await Plan.findByIdAndUpdate(id, req.body, { new: true });

            if (!updatedPlan) {
                res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Plan updated successfully',
                data: { plan: updatedPlan }
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async createPlan(req: AuthRequest, res: Response) {
        try {

            const plan = await Plan.create(req.body);

            return res.status(201).json({
                success: true,
                message: 'plan created successfully',
                data: {
                    id: plan._id,
                    name: plan.name,
                    price: plan.price,
                    billing_cycle: plan.billing_cycle,
                    status: plan.status,
                    description: plan.description
                }
            });

        } catch (error) {
            console.error('Create plan error:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }


}







