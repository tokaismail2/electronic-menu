// import { Response, NextFunction } from 'express';
// import { AuthRequest } from '../types/express';
// import { isValidObjectId } from 'mongoose';
// import { remember } from '../utils/cache';
// import UserMembership from '../models/UserMembership';


// export const userCompanyContext = async (
//     req: AuthRequest,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         if (!req.user || !req.user._id) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Authentication required',
//                 code: 'AUTH_REQUIRED',
//             });
//         }

//         const companyId = req.headers['x-company-id'] as string;

//         if (!companyId || !isValidObjectId(companyId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'x-company-id header is required',
//                 code: 'COMPANY_CONTEXT_MISSING',
//             });
//         }

//         const cacheKey = `user_company_ctx:${req.user._id}:${companyId}`;

//         const membershipExists = await remember<boolean>(
//             cacheKey,
//             async () => {
//                 const membership = await UserMembership.findOne({
//                     user_id: req.user!._id,
//                     company_id: companyId,
//                 }).select('_id');
//                 return !!membership;
//             },
//             60 * 60 
//         );

//         if (!membershipExists) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not a member of this company',
//                 code: 'NOT_A_MEMBER',
//             });
//         }

//         req.company_id = companyId;
//         next();
//     } catch (error) {
//         console.error('userCompanyContext middleware error:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error validating company context',
//             code: 'COMPANY_CONTEXT_ERROR',
//         });
//     }
// };
