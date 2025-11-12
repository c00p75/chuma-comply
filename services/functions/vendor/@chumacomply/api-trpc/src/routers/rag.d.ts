export declare const ragRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc.js").Context;
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
            checklist?: {
                step: number;
                title: string;
                description: string;
                regulatoryBody: string;
                required: boolean;
                sources: {
                    title: string;
                    section?: string | undefined;
                }[];
            }[] | undefined;
        };
        meta: object;
    }>;
}>>;
