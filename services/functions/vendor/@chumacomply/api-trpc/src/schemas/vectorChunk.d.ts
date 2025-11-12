import { z } from 'zod';
/**
 * Zod schema for Firestore vectorChunk document.
 * Matches the Python ingestion pipeline output structure.
 */
export declare const vectorChunkSchema: z.ZodObject<{
    chunkId: z.ZodString;
    sourceDocument: z.ZodString;
    documentType: z.ZodString;
    industry: z.ZodString;
    subscriptionTier: z.ZodEnum<["free", "pro"]>;
    regulatoryBody: z.ZodString;
    topicPrimary: z.ZodString;
    topicSecondary: z.ZodOptional<z.ZodString>;
    actName: z.ZodOptional<z.ZodString>;
    sectionNumber: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    embedding: z.ZodArray<z.ZodNumber, "many">;
    embeddingDim: z.ZodLiteral<768>;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    chunkIndex: z.ZodNumber;
    startChar: z.ZodNumber;
    endChar: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    chunkId: string;
    sourceDocument: string;
    documentType: string;
    industry: string;
    subscriptionTier: "free" | "pro";
    regulatoryBody: string;
    topicPrimary: string;
    content: string;
    embedding: number[];
    embeddingDim: 768;
    chunkIndex: number;
    startChar: number;
    endChar: number;
    topicSecondary?: string | undefined;
    actName?: string | undefined;
    sectionNumber?: string | undefined;
    pageNumber?: number | undefined;
    createdAt?: any;
}, {
    chunkId: string;
    sourceDocument: string;
    documentType: string;
    industry: string;
    subscriptionTier: "free" | "pro";
    regulatoryBody: string;
    topicPrimary: string;
    content: string;
    embedding: number[];
    embeddingDim: 768;
    chunkIndex: number;
    startChar: number;
    endChar: number;
    topicSecondary?: string | undefined;
    actName?: string | undefined;
    sectionNumber?: string | undefined;
    pageNumber?: number | undefined;
    createdAt?: any;
}>;
export type VectorChunk = z.infer<typeof vectorChunkSchema>;
/**
 * Schema for query-time chunk retrieval (without embedding for efficiency)
 */
export declare const vectorChunkRetrievalSchema: z.ZodObject<Omit<{
    chunkId: z.ZodString;
    sourceDocument: z.ZodString;
    documentType: z.ZodString;
    industry: z.ZodString;
    subscriptionTier: z.ZodEnum<["free", "pro"]>;
    regulatoryBody: z.ZodString;
    topicPrimary: z.ZodString;
    topicSecondary: z.ZodOptional<z.ZodString>;
    actName: z.ZodOptional<z.ZodString>;
    sectionNumber: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    embedding: z.ZodArray<z.ZodNumber, "many">;
    embeddingDim: z.ZodLiteral<768>;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    chunkIndex: z.ZodNumber;
    startChar: z.ZodNumber;
    endChar: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodAny>;
}, "embedding">, "strip", z.ZodTypeAny, {
    chunkId: string;
    sourceDocument: string;
    documentType: string;
    industry: string;
    subscriptionTier: "free" | "pro";
    regulatoryBody: string;
    topicPrimary: string;
    content: string;
    embeddingDim: 768;
    chunkIndex: number;
    startChar: number;
    endChar: number;
    topicSecondary?: string | undefined;
    actName?: string | undefined;
    sectionNumber?: string | undefined;
    pageNumber?: number | undefined;
    createdAt?: any;
}, {
    chunkId: string;
    sourceDocument: string;
    documentType: string;
    industry: string;
    subscriptionTier: "free" | "pro";
    regulatoryBody: string;
    topicPrimary: string;
    content: string;
    embeddingDim: 768;
    chunkIndex: number;
    startChar: number;
    endChar: number;
    topicSecondary?: string | undefined;
    actName?: string | undefined;
    sectionNumber?: string | undefined;
    pageNumber?: number | undefined;
    createdAt?: any;
}>;
export type VectorChunkRetrieval = z.infer<typeof vectorChunkRetrievalSchema>;
