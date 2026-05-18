import { Request, Response } from 'express';
import Plan from '../models/plan';
import Subscription from '../models/subscription';
import { AuthRequest } from '../types/express';

export class SubscriptionController {


    static async getAllSubscriptions(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const filter: any = {};

            const subscriptions = await Subscription.find(filter)
                .skip(skip)
                .limit(limit)
                .populate('user_id', 'user_name')
                .populate('plan_id', 'name price')
                .sort({ created_at: -1 });

            const totalSubscriptions = await Subscription.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    subscriptions,
                    pagination: {
                        page,
                        limit,
                        total: totalSubscriptions,
                        pages: Math.ceil(totalSubscriptions / limit)
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
    static async getSubscriptionById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const filter: any = { _id: id };

            const subscription = await Subscription.findOne(filter)
                .populate('plan_id')
                .populate('user_id')
                .lean();

            if (!subscription) {
                res.status(404).json({
                    success: false,
                    message: 'Subscription not found'
                });
                return;
            }

            res.json({
                success: true,
                data: subscription
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async updateSubscription(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updatedSubscription = await Subscription.findByIdAndUpdate(id, req.body, { new: true });

            if (!updatedSubscription) {
                res.status(404).json({
                    success: false,
                    message: 'Subscription not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Subscription updated successfully',
                data: { subscription: updatedSubscription }
            });
        } catch (error) {
            console.error('Update subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async createSubscription(req: AuthRequest, res: Response) {
        try {

            const subscription = await Subscription.create(req.body);

            return res.status(201).json({
                success: true,
                message: 'subscription created successfully',
                data: subscription
            });

        } catch (error) {
            console.error('Create subscription error:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async createCustomizedSubscription(req: AuthRequest, res: Response) {
        try {

            const plan = await Plan.create({
                name: req.body.name,
                price: req.body.price,
                status: 'active',
                description: req.body.description,
                isCustom: true
            });
    
            const subscription = await Subscription.create({
                user_id: req.body.user_id,
                plan_id: plan._id,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                status: 'active',
                payment_method: req.body.payment_method,
                isCustom: true
            });
            return res.status(201).json({
                success: true,
                message: 'Subscription created successfully',
                data: subscription
            });
        } catch (error) {
            console.error('Create subscription error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }


}







