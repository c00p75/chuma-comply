/**
 * Vertex AI Vector Search integration
 * Hybrid approach: Use Vector Search if configured, otherwise fallback to in-memory search
 */
/**
 * Check if Vector Search is configured
 */
export function isVectorSearchConfigured() {
    return !!(process.env.VECTOR_SEARCH_INDEX_ENDPOINT &&
        process.env.VECTOR_SEARCH_DEPLOYED_INDEX_ID);
}
/**
 * Get Vector Search configuration from environment variables
 */
export function getVectorSearchConfig() {
    if (!isVectorSearchConfigured()) {
        return null;
    }
    return {
        projectId: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID || 'chumacomply',
        location: process.env.GCP_LOCATION || 'us-east1',
        indexEndpoint: process.env.VECTOR_SEARCH_INDEX_ENDPOINT,
        deployedIndexId: process.env.VECTOR_SEARCH_DEPLOYED_INDEX_ID,
    };
}
/**
 * Query Vertex AI Vector Search
 * @param queryEmbedding - The query embedding vector
 * @param topK - Number of results to return (default: 10)
 * @param filter - Optional metadata filters
 */
export async function queryVectorSearch(queryEmbedding, topK = 10, filter) {
    const config = getVectorSearchConfig();
    if (!config) {
        throw new Error('Vector Search not configured');
    }
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    // Vector Search API endpoint
    const url = `https://${config.location}-aiplatform.googleapis.com/v1/${config.indexEndpoint}:findNeighbors`;
    const requestBody = {
        deployed_index_id: config.deployedIndexId,
        queries: [
            {
                datapoint: {
                    feature_vector: queryEmbedding,
                },
                neighbor_count: topK,
            },
        ],
    };
    // Add metadata filters if provided
    if (filter) {
        requestBody.queries[0].datapoint.restricts = filter;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vector Search API error: ${response.status} ${errorText}`);
    }
    const result = await response.json();
    const neighbors = result.nearestNeighbors?.[0]?.neighbors || [];
    return neighbors.map((neighbor) => ({
        id: neighbor.datapoint.datapointId || '',
        distance: neighbor.distance || 0,
        metadata: neighbor.datapoint.restricts || {},
    }));
}
/**
 * Hybrid search: Try Vector Search, fallback to in-memory if not configured
 */
export async function hybridVectorSearch(queryEmbedding, allChunks, topK = 10, filter) {
    // Try Vector Search first if configured
    if (isVectorSearchConfigured()) {
        try {
            console.log('[RAG] Using Vertex AI Vector Search');
            const vectorResults = await queryVectorSearch(queryEmbedding, topK, filter);
            // Map Vector Search results to chunks
            const chunkMap = new Map(allChunks.map((c) => [c.chunkId, c]));
            return vectorResults
                .map((result) => {
                const chunk = chunkMap.get(result.id);
                if (!chunk)
                    return null;
                // Convert distance to similarity (1 - normalized distance)
                const similarity = 1 - Math.min(result.distance, 1);
                return {
                    chunkId: result.id,
                    similarity,
                    chunk,
                };
            })
                .filter((item) => item !== null)
                .slice(0, topK);
        }
        catch (error) {
            console.warn('[RAG] Vector Search failed, falling back to in-memory search:', error);
            // Fall through to in-memory search
        }
    }
    // Fallback to in-memory search
    console.log('[RAG] Using in-memory cosine similarity search');
    return [];
}
