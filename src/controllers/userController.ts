import { Request, Response } from 'express';
import User from '../models/user';
import { AuthRequest } from '../types/express';
import Subscription from '../models/subscription';
import bcrypt from 'bcryptjs';

export class UserController {


    static async getAllUsers(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const filter: any = {};

            if (req.query.is_active !== undefined) {
                filter.is_active = req.query.is_active === 'true';
            }


            const users = await User.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });

            const totalUsers = await User.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page,
                        limit,
                        total: totalUsers,
                        pages: Math.ceil(totalUsers / limit)
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
    static async getUserById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const user = await User.findById(id).lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const subscriptions = await Subscription.find({
                user_id: user._id,
            }).lean();

            return res.json({
                success: true,
                data: {
                    user: {
                        _id: user._id,
                        user_name: user.user_name,
                        role: user.role,
                        is_active: user.is_active,
                    },
                    subscriptions: subscriptions || null,
                },
            });
        } catch (error) {
            console.error("Get user by ID error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async updateUser(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }


            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

            res.json({
                success: true,
                message: 'User updated successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async createUser(req: AuthRequest, res: Response) {
        try {
            const existingUser = await User.findOne({
                user_name: req.body.user_name
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User name already exists',
                });
            }


            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = await User.create({
                ...req.body,
                password: hashedPassword,
            });


            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: user._id,
                    user_name: user.user_name,
                    is_active: user.is_active
                }
            });

        } catch (error) {
            console.error('Create user error:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }


}







