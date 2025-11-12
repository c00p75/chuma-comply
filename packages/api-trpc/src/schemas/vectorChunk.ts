import { z } from 'zod';

/**
 * Zod schema for Firestore vectorChunk document.
 * Matches the Python ingestion pipeline output structure.
 */
export const vectorChunkSchema = z.object({
  chunkId: z.string(),
  sourceDocument: z.string(),
  documentType: z.string(),
  industry: z.string(),
  subscriptionTier: z.enum(['free', 'pro']),
  regulatoryBody: z.string(),
  topicPrimary: z.string(),
  topicSecondary: z.string().optional(),
  actName: z.string().optional(),
  sectionNumber: z.string().optional(),
  content: z.string(),
  embedding: z.array(z.number()).length(768), // text-embedding-005 has 768 dimensions
  embeddingDim: z.literal(768),
  pageNumber: z.number().optional(),
  chunkIndex: z.number(),
  startChar: z.number(),
  endChar: z.number(),
  createdAt: z.any().optional(), // Firestore Timestamp object (can be Timestamp, date, string, or number)
});

export type VectorChunk = z.infer<typeof vectorChunkSchema>;

/**
 * Schema for query-time chunk retrieval (without embedding for efficiency)
 */
export const vectorChunkRetrievalSchema = vectorChunkSchema.omit({ embedding: true });

export type VectorChunkRetrieval = z.infer<typeof vectorChunkRetrievalSchema>;

