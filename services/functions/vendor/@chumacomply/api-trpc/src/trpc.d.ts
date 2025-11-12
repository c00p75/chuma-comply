import admin from 'firebase-admin';
export declare const db: admin.firestore.Firestore;
export interface Context {
    userId?: string;
    userTier?: 'free' | 'pro';
}
export declare const router: import("@trpc/server").TRPCRouterBuilder<{
    ctx: Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<Context, object, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
/**
 * Protected procedure that requires authentication
 */
export declare const protectedProcedure: import("@trpc/server").TRPCProcedureBuilder<Context, object, {
    userId: string;
    userTier: "free" | "pro" | undefined;
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
