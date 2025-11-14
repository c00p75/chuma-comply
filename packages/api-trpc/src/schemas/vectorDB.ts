import { z } from 'zod';

/**
 * Zod schema for Firestore vectorDB metadata document.
 * Tracks statistics about the vector store.
 */
export const vectorDBSchema = z.object({
  version: z.number(),
  embeddingModel: z.string(),
  dimensions: z.number(),
  documents: z.number(),
  chunks: z.number(),
  updatedAt: z.any(), // Firestore Timestamp
});

export type VectorDB = z.infer<typeof vectorDBSchema>;

