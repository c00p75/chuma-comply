import { initTRPC, TRPCError } from '@trpc/server';
import admin from 'firebase-admin';
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}
export const db = admin.firestore();
const t = initTRPC.context().create();
export const router = t.router;
export const publicProcedure = t.procedure;
/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to use this endpoint',
        });
    }
    return next({
        ctx: {
            ...ctx,
            userId: ctx.userId, // Type narrowing
        },
    });
});
