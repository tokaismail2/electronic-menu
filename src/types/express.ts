import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: any;
    user_id?: any;
    role?: string;
    is_active?: boolean;
}
