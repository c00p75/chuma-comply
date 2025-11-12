/**
 * Vertex AI Vector Search integration
 * Hybrid approach: Use Vector Search if configured, otherwise fallback to in-memory search
 */
export interface VectorSearchResult {
    id: string;
    distance: number;
    metadata?: Record<string, any>;
}
export interface VectorSearchConfig {
    projectId: string;
    location: string;
    indexEndpoint: string;
    deployedIndexId: string;
}
/**
 * Check if Vector Search is configured
 */
export declare function isVectorSearchConfigured(): boolean;
/**
 * Get Vector Search configuration from environment variables
 */
export declare function getVectorSearchConfig(): VectorSearchConfig | null;
/**
 * Query Vertex AI Vector Search
 * @param queryEmbedding - The query embedding vector
 * @param topK - Number of results to return (default: 10)
 * @param filter - Optional metadata filters
 */
export declare function queryVectorSearch(queryEmbedding: number[], topK?: number, filter?: Record<string, any>): Promise<VectorSearchResult[]>;
/**
 * Hybrid search: Try Vector Search, fallback to in-memory if not configured
 */
export declare function hybridVectorSearch(queryEmbedding: number[], allChunks: Array<{
    chunkId: string;
    embedding: number[];
    [key: string]: any;
}>, topK?: number, filter?: Record<string, any>): Promise<Array<{
    chunkId: string;
    similarity: number;
    chunk: any;
}>>;
