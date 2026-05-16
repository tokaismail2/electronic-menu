import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

type ValidationProperty = 'body' | 'query' | 'params';

export const validate = (
    schema: Joi.ObjectSchema,
    property: ValidationProperty = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = req[property] as any;

        // Parse JSON strings from multipart/form-data
        const parsedData: any = {};

        for (const key in data) {
            try {
                if (
                    typeof data[key] === 'string' &&
                    (data[key].startsWith('{') || data[key].startsWith('['))
                ) {
                    parsedData[key] = JSON.parse(data[key]);
                } else {
                    parsedData[key] = data[key];
                }
            } catch {
                parsedData[key] = data[key];
            }
        }

        const { error, value } = schema.validate(parsedData, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: false,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
        }

        // Replace with validated values
        Object.assign(req[property], value);

        next();
    };
};