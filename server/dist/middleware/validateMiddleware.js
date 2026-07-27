"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
                });
                return;
            }
            res.status(400).json({ success: false, message: 'Invalid payload' });
        }
    };
};
exports.validateRequest = validateRequest;
