/**
 * RAG utility functions for vector search and embeddings
 */
/**
 * Calculate cosine similarity between two vectors
 */
export declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * Generate embedding using Vertex AI REST API
 */
export declare function generateEmbedding(text: string, projectId?: string, location?: string): Promise<number[]>;
/**
 * Generate content using Vertex AI Gemini
 */
export declare function generateContent(prompt: string, systemInstruction?: string, projectId?: string, location?: string, model?: string): Promise<string>;
