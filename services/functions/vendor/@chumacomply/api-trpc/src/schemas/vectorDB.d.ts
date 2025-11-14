import { z } from 'zod';
/**
 * Zod schema for Firestore vectorDB metadata document.
 * Tracks statistics about the vector store.
 */
export declare const vectorDBSchema: z.ZodObject<{
    version: z.ZodNumber;
    embeddingModel: z.ZodString;
    dimensions: z.ZodNumber;
    documents: z.ZodNumber;
    chunks: z.ZodNumber;
    updatedAt: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    version: number;
    embeddingModel: string;
    dimensions: number;
    documents: number;
    chunks: number;
    updatedAt?: any;
}, {
    version: number;
    embeddingModel: string;
    dimensions: number;
    documents: number;
    chunks: number;
    updatedAt?: any;
}>;
export type VectorDB = z.infer<typeof vectorDBSchema>;
