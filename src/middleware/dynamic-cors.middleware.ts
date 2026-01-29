/**
 * Dynamic CORS Middleware
 * 
 * This middleware provides dynamic CORS configuration by fetching allowed origins
 * from the database on each request. This eliminates the need for redeployment
 * when adding new allowed origins.
 * 
 * Usage:
 * ```typescript
 * import { createDynamicCorsMiddleware } from './middleware/dynamic-cors.middleware';
 * 
 * const app = express();
 * app.use(createDynamicCorsMiddleware('mms')); // or 'los'
 * ```
 */

import { Request, Response, NextFunction } from "express";
import cors from "cors";
import { DynamicCorsService } from "../services/dynamic-cors.service";

/**
 * Creates a dynamic CORS middleware for a specific service
 * @param serviceName - The service identifier ('mms', 'los', etc.)
 * @returns Express middleware function
 */
export function createDynamicCorsMiddleware(serviceName: string) {
    const corsService = new DynamicCorsService(serviceName);

    return async (req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin;

        // If no origin header (e.g., same-origin request), allow it
        if (!origin) {
            return cors({
                origin: true,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
            })(req, res, next);
        }

        try {
            const isAllowed = await corsService.isOriginAllowed(origin);

            if (isAllowed) {
                // Origin is allowed - apply CORS with the specific origin
                cors({
                    origin: origin,
                    credentials: true,
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
                })(req, res, next);
            } else {
                // Origin not allowed - block request with 403
                console.warn(`[DynamicCORS] Blocked request from unauthorized origin: ${origin}`);
                res.status(403).json({
                    error: 'CORS Error',
                    message: 'Origin not allowed',
                    origin: origin
                });
            }
        } catch (error) {
            console.error(`[DynamicCORS] Error processing CORS for origin ${origin}:`, error);
            // On error, block the request for security
            res.status(500).json({
                error: 'CORS Error',
                message: 'Error processing CORS configuration'
            });
        }
    };
}

/**
 * Alternative: Creates a dynamic CORS middleware that uses the cors package's
 * origin callback function for async origin validation
 * @param serviceName - The service identifier ('mms', 'los', etc.)
 * @returns Express middleware function
 */
export function createDynamicCorsMiddlewareCallback(serviceName: string) {
    const corsService = new DynamicCorsService(serviceName);

    return cors({
        origin: async (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            try {
                // Allow requests with no origin (mobile apps, curl, etc.)
                if (!origin) {
                    return callback(null, true);
                }

                const isAllowed = await corsService.isOriginAllowed(origin);

                if (isAllowed) {
                    callback(null, true);
                } else {
                    console.warn(`[DynamicCORS] Blocked request from unauthorized origin: ${origin}`);
                    callback(new Error(`Origin ${origin} not allowed by CORS`));
                }
            } catch (error) {
                console.error(`[DynamicCORS] Error validating origin ${origin}:`, error);
                callback(new Error('CORS configuration error'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    });
}
