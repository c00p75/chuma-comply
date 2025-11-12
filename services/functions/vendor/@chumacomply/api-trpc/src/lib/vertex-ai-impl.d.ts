/**
 * Runtime implementation of firebase-admin/vertex-ai using REST API
 * This provides the getVertexAI() function and related types using Vertex AI REST API
 */
interface SystemInstruction {
    role: string;
    parts: Array<{
        text: string;
    }>;
}
interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: Record<string, any>;
}
interface Tool {
    functionDeclarations: FunctionDeclaration[];
}
interface GenerativeModelOptions {
    model: string;
    systemInstruction?: SystemInstruction;
    tools?: Tool[];
}
interface ContentPart {
    text?: string;
}
interface Content {
    role: string;
    parts: ContentPart[];
}
interface GenerateContentRequest {
    contents: Content[];
}
interface EmbedContentResponse {
    embedding?: {
        values?: number[];
        value?: number[];
    };
    values?: number[];
}
interface FunctionCall {
    args: Record<string, any>;
}
interface Candidate {
    content?: {
        parts?: Array<{
            text?: string;
        }>;
    };
    finishReason?: string;
}
interface PromptFeedback {
    blockReason?: string;
}
interface GenerateContentResponse {
    response: {
        candidates?: Candidate[];
        promptFeedback?: PromptFeedback;
    };
}
interface Chat {
    sendMessage(prompt: string): Promise<{
        response: {
            functionCalls(): FunctionCall[] | undefined;
        };
    }>;
}
declare class GenerativeModelImpl {
    private model;
    private systemInstruction?;
    private tools?;
    constructor(model: string, systemInstruction?: SystemInstruction | undefined, tools?: Tool[] | undefined);
    generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse>;
    embedContent(text: string): Promise<EmbedContentResponse>;
    startChat(options: {
        tools?: Tool[];
    }): Chat;
}
declare class VertexAIImpl {
    getGenerativeModel(options: GenerativeModelOptions): GenerativeModelImpl;
}
export declare function getVertexAI(): VertexAIImpl;
export {};
