export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    rag: import("@trpc/server").TRPCBuiltRouter<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getComplianceChecklist: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                query: string;
            };
            output: {
                content: string;
                sources: {
                    title: string;
                }[];
            };
            meta: object;
        }>;
    }>>;
}>>;
export type AppRouter = typeof appRouter;
