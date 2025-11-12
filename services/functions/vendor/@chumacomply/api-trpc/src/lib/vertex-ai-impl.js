/**
 * Runtime implementation of firebase-admin/vertex-ai using REST API
 * This provides the getVertexAI() function and related types using Vertex AI REST API
 */
import { GoogleAuth } from 'google-auth-library';
// Get project ID from environment or default
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID || 'chumacomply';
const LOCATION = process.env.GCP_LOCATION || 'us-central1';
// Initialize auth client
const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
class GenerativeModelImpl {
    constructor(model, systemInstruction, tools) {
        this.model = model;
        this.systemInstruction = systemInstruction;
        this.tools = tools;
    }
    async generateContent(request) {
        const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${this.model}:generateContent`;
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const requestBody = {
            contents: request.contents,
        };
        if (this.systemInstruction) {
            // Vertex AI REST API expects systemInstruction as parts array, not with role
            requestBody.systemInstruction = {
                parts: this.systemInstruction.parts,
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
            console.error(`Vertex AI generateContent API error: ${response.status}`, errorText);
            throw new Error(`Vertex AI API error: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        console.log('Vertex AI generateContent response:', JSON.stringify(result, null, 2).substring(0, 500));
        return {
            response: {
                candidates: result.candidates,
                promptFeedback: result.promptFeedback,
            },
        };
    }
    async embedContent(text) {
        const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${this.model}:predict`;
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
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
        const embedding = prediction.embeddings?.values ||
            prediction.values ||
            prediction.embeddings;
        return {
            embedding: {
                values: embedding,
            },
            values: embedding,
        };
    }
    startChat(options) {
        const chatTools = options.tools || this.tools;
        return {
            sendMessage: async (prompt) => {
                const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${this.model}:generateContent`;
                const client = await auth.getClient();
                const accessToken = await client.getAccessToken();
                const requestBody = {
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
                    ],
                };
                if (this.systemInstruction) {
                    // Vertex AI REST API expects systemInstruction as parts array, not with role
                    requestBody.systemInstruction = {
                        parts: this.systemInstruction.parts,
                    };
                }
                if (chatTools && chatTools.length > 0) {
                    requestBody.tools = chatTools;
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
                const candidate = result.candidates?.[0];
                // Extract function calls from the response
                const functionCalls = candidate?.content?.parts
                    ?.filter((part) => part.functionCall)
                    .map((part) => ({
                    name: part.functionCall.name,
                    args: part.functionCall.args || {},
                })) || [];
                return {
                    response: {
                        functionCalls: () => (functionCalls.length > 0 ? functionCalls : undefined),
                    },
                };
            },
        };
    }
}
class VertexAIImpl {
    getGenerativeModel(options) {
        return new GenerativeModelImpl(options.model, options.systemInstruction, options.tools);
    }
}
export function getVertexAI() {
    return new VertexAIImpl();
}
