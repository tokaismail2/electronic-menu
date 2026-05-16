import { Response, NextFunction } from 'express';
import Company from '../models/Company';
import { AuthRequest } from '../types/express';
import { isValidObjectId } from 'mongoose';
import { remember } from '../utils/cache';

export const companyContext = async (
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

        const companyId = req.headers['x-company-id'] as string;

        if (!companyId || !isValidObjectId(companyId)) {
            return res.status(400).json({
                success: false,
                message: 'company context is required',
                code: 'COMPANY_CONTEXT_MISSING',
            });
        }

        const cacheKey = `company_context:${req.user._id}:${companyId}`;

     
        const isAllowed = await remember<boolean>(
            cacheKey,
            async () => {
                const company = await Company.findOne({
                    _id: companyId,
                    manager_id: req.user!._id,
                }).select('_id');

                return !!company; // true or false
            },
              24*60*60// TTL = 24 hours
        );

        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: 'Company with this manager not found',
            });
        }

        req.company_id = companyId;
        next();
    } catch (error) {
        console.error('company context middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validating company context',
            code: 'COMPANY_CONTEXT_ERROR',
        });
    }
};
