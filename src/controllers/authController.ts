import { Request, Response } from 'express';
import User from '../models/user';
import { AuthRequest } from '../types/express';
import Subscription from '../models/subscription';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthController {


    static async login(req: Request, res: Response) {
        try {


            const { user_name, password } = req.body;

            const user = await User.findOne({ user_name });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid user_name',
                });
                return;
            }

            if (!user.is_active) {
                res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
                return;
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid password',
                });
            }


            const token = jwt.sign(
                {
                    id: user._id,
                    user_name: user.user_name,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key'
            );


            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user._id,
                        user_name: user.user_name,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }


}







