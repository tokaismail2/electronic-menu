import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import UserMembership from '../models/UserMembership';

export const isApprovedUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        const membership = await UserMembership.findOne({
            user_id: req.user._id
            
        });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'No membership found for this company',
                code: 'MEMBERSHIP_NOT_FOUND',
            });
        }
        if (membership.is_approved !== true) {
            return res.status(403).json({
                success: false,
                message: membership.is_approved === null
                    ? 'Your membership is pending approval'
                    : 'Your membership has been rejected',
                code: 'USER_NOT_APPROVED',
            });
        }

        next();
    } catch (error) {
        console.error('isApprovedUser middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validating membership',
            code: 'USER_VALIDATION_ERROR',
        });
    }
};
