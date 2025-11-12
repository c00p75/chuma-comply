/**
 * RAG utility functions for vector search and embeddings
 */
/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
}
/**
 * Generate embedding using Vertex AI REST API
 */
export async function generateEmbedding(text, projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID || 'chumacomply', location = process.env.GCP_LOCATION || 'us-central1') {
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-005:predict`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
            instances: [
                {
                    content: text,
                    task_type: 'RETRIEVAL_QUERY',
                },
            ],
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} ${errorText}`);
    }
    const result = await response.json();
    const predictions = result.predictions;
    if (!predictions || !predictions[0]) {
        throw new Error('No embedding returned from Vertex AI');
    }
    const prediction = predictions[0];
    const embedding = prediction.embeddings?.values || prediction.values || prediction.embeddings;
    if (!embedding || !Array.isArray(embedding) || embedding.length !== 768) {
        throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0}, expected 768`);
    }
    return embedding;
}
/**
 * Generate content using Vertex AI Gemini
 */
export async function generateContent(prompt, systemInstruction, projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID || 'chumacomply', location = process.env.GCP_LOCATION || 'us-central1', model = 'gemini-2.0-flash-exp') {
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }],
            },
        ],
    };
    if (systemInstruction) {
        requestBody.systemInstruction = {
            parts: [{ text: systemInstruction }],
        };
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
        throw new Error(`Vertex AI API error: ${response.status} ${errorText}`);
    }
    const result = await response.json();
    const candidates = result.candidates;
    if (!candidates || !candidates[0] || !candidates[0].content) {
        throw new Error('No content returned from Vertex AI');
    }
    const text = candidates[0].content.parts
        .map((part) => part.text)
        .join('');
    return text;
}
