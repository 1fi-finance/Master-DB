/**
 * Dynamic CORS Service
 * 
 * This service provides dynamic CORS configuration management by fetching
 * allowed origins from the database. This eliminates the need for redeployment
 * when adding new allowed origins.
 * 
 * Usage:
 * ```typescript
 * const corsService = new DynamicCorsService('mms'); // or 'los'
 * const allowedOrigins = await corsService.getAllowedOrigins();
 * const isAllowed = await corsService.isOriginAllowed('https://example.com');
 * ```
 */

import { eq, and, or } from "drizzle-orm";
import { db } from "../db";
import { corsConfig } from "../db/schema/shared";

export class DynamicCorsService {
    private serviceName: string;

    /**
     * Creates a new DynamicCorsService instance
     * @param serviceName - The service identifier ('mms', 'los', etc.)
     */
    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    /**
     * Fetches all allowed origins for this service from the database
     * Includes both service-specific origins and global origins (service = '*')
     * @returns Array of allowed origin URLs
     */
    async getAllowedOrigins(): Promise<string[]> {
        try {
            const configs = await db
                .select({ origin: corsConfig.origin })
                .from(corsConfig)
                .where(
                    and(
                        eq(corsConfig.isActive, true),
                        or(
                            eq(corsConfig.service, this.serviceName),
                            eq(corsConfig.service, '*')
                        )
                    )
                );

            return configs.map(c => c.origin);
        } catch (error) {
            console.error(`[DynamicCorsService] Error fetching allowed origins for ${this.serviceName}:`, error);
            // Return empty array on error - middleware should handle this gracefully
            return [];
        }
    }

    /**
     * Checks if a specific origin is allowed for this service
     * @param origin - The origin URL to check
     * @returns boolean indicating if the origin is allowed
     */
    async isOriginAllowed(origin: string | undefined): Promise<boolean> {
        if (!origin) {
            return false;
        }

        try {
            const allowedOrigins = await this.getAllowedOrigins();

            // Allow if origin is in list or if wildcard is configured
            return allowedOrigins.includes(origin) ||
                allowedOrigins.includes('*');
        } catch (error) {
            console.error(`[DynamicCorsService] Error checking origin ${origin}:`, error);
            return false;
        }
    }

    /**
     * Gets the CORS options object for use with cors middleware
     * @returns CorsOptions object compatible with cors package
     */
    async getCorsOptions(): Promise<{
        origin: string[] | boolean;
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    }> {
        const allowedOrigins = await this.getAllowedOrigins();

        // If wildcard is configured, allow all origins
        if (allowedOrigins.includes('*')) {
            return {
                origin: true,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
            };
        }

        return {
            origin: allowedOrigins.length > 0 ? allowedOrigins : false,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
        };
    }
}

/**
 * Factory function to create a DynamicCorsService instance
 * @param serviceName - The service identifier ('mms', 'los', etc.)
 * @returns DynamicCorsService instance
 */
export function createDynamicCorsService(serviceName: string): DynamicCorsService {
    return new DynamicCorsService(serviceName);
}
