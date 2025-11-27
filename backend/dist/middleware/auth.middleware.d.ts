import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../types/index.js';
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map