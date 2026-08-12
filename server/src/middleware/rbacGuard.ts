import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

export const rbacGuard = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // If user is Super Admin or has explicit requiredPermission, pass
    const user = req.user;

    if (!user) {
      // In dev fallback or if authenticated token passed
      return next();
    }

    if (user.role === 'Super Admin') {
      return next();
    }

    if (user.permissions && user.permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires permission: '${requiredPermission}'`
    });
  };
};
