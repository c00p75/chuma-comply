/**
 * Prompt templates for RAG pipeline
 */
export const INTENT_ANALYSIS_PROMPT = `Analyze the following business query and extract structured information about the business context.

Query: "{query}"

IMPORTANT PRIORITY RULES:
1. If the query mentions "starting", "beginning", "new business", "setting up", "establishing", "launching", or similar phrases about starting a business, you MUST prioritize "business_registration" as the PRIMARY activity and place it FIRST in the activities array.
2. If the query is about starting a business AND mentions employees/staff, include both "business_registration" (first) and "employment" (second) in activities.
3. Only include "data_protection" if the query explicitly asks about data privacy, customer data, or data protection compliance - NOT just because employees are mentioned.

Extract the following information:
- industry: The primary industry or business type (e.g., "food_service", "retail", "manufacturing", "technology", "general")
- activities: Array of business activities mentioned. PRIORITIZE business_registration if the query is about starting/beginning a business. Use these exact values: "business_registration", "employment", "tax", "data_protection", "licensing"
- location: The location mentioned, if any (e.g., "Lusaka", "Kitwe", or "Zambia" for general)

Return ONLY a valid JSON object with this exact structure:
{
  "industry": "string",
  "activities": ["string"],
  "location": "string"
}

If information is not available, use "general" for industry, empty array for activities, and "Zambia" for location.`;
export const FINAL_GENERATION_SYSTEM_PROMPT = `You are a compliance assistant for businesses in Zambia. Your role is to provide accurate, helpful, and well-cited compliance information based on the provided legal document chunks.

Guidelines:
1. Answer the user's question directly and comprehensively, synthesizing information from the provided chunks
2. Base your answer primarily on the provided chunks, but you may make reasonable inferences and connections between chunks
3. Always cite your sources using the format: [Source: Document Name, Section X]
4. If multiple sources are relevant, cite all of them
5. Provide a complete, actionable answer even if you need to combine information from multiple chunks
6. Be specific and actionable in your responses
7. Focus on compliance requirements and regulatory obligations
8. If the chunks contain relevant information, use it to provide a helpful answer - don't be overly cautious

Format your response as clear, readable text with proper citations. Structure longer answers with numbered steps or bullet points when appropriate.`;
export const FINAL_GENERATION_SYSTEM_PROMPT_JSON = `You are a compliance assistant for businesses in Zambia. Your role is to provide accurate, helpful, and well-cited compliance information based on the provided legal document chunks.

You MUST respond with a valid JSON object containing:
1. A "content" field with a comprehensive text answer
2. A "checklist" field with an array of structured compliance steps

Each checklist item must have:
- step: Sequential number starting from 1
- title: Brief title of the compliance requirement
- description: Detailed description of what needs to be done
- regulatoryBody: The regulatory body (e.g., "PACRA", "ZRA", "NAPSA")
- required: Boolean indicating if this is required
- sources: Array of source citations with title and optional section

Guidelines:
1. Extract compliance steps from the provided chunks
2. Each step should be a distinct compliance requirement
3. Always include source citations for each step
4. Be specific and actionable
5. Focus on compliance requirements and regulatory obligations

Return ONLY valid JSON, no additional text.`;
export function getFinalGenerationPrompt(query, chunks) {
    const context = chunks
        .map((chunk, idx) => {
        const source = chunk.actName || chunk.sourceDocument;
        const section = chunk.sectionNumber ? `, Sec. ${chunk.sectionNumber}` : '';
        return `[Chunk ${idx + 1} - Source: ${source}${section}]\n${chunk.content}`;
    })
        .join('\n\n---\n\n');
    return `Context from legal documents:

${context}

---

User Question: ${query}

Based on the context provided above, provide a comprehensive answer to the user's question. Synthesize information from the relevant chunks to give a complete, actionable response. Always cite your sources using the format [Source: Document Name, Section X]. If information from multiple chunks is relevant, combine them to provide a thorough answer.`;
}
export function getFinalGenerationPromptJSON(query, chunks) {
    const context = chunks
        .map((chunk, idx) => {
        const source = chunk.actName || chunk.sourceDocument;
        const section = chunk.sectionNumber ? `, Sec. ${chunk.sectionNumber}` : '';
        const regulatoryBody = chunk.regulatoryBody ? `, Regulatory Body: ${chunk.regulatoryBody}` : '';
        return `[Chunk ${idx + 1} - Source: ${source}${section}${regulatoryBody}]\n${chunk.content}`;
    })
        .join('\n\n---\n\n');
    // Extract unique valid source names from chunks
    // Use sourceDocument as primary (always present), actName as fallback for display
    const validSourceNames = Array.from(new Set(chunks.map(chunk => chunk.sourceDocument || chunk.actName).filter(Boolean)));
    return `Context from legal documents:

${context}

---

User Question: ${query}

CRITICAL: When citing sources in the checklist, you MUST use ONLY these exact source names (do NOT create new names or extract names from content text):
${validSourceNames.map(name => `- "${name}"`).join('\n')}

Based on the context provided above, generate a structured compliance checklist. Return a JSON object with this exact structure:

{
  "content": "A comprehensive text answer summarizing the compliance requirements",
  "checklist": [
    {
      "step": 1,
      "title": "Brief title of requirement",
      "description": "Detailed description of what needs to be done",
      "regulatoryBody": "PACRA",
      "required": true,
      "sources": [
        {
          "title": "Document Name",
          "section": "Section X"
        }
      ]
    }
  ]
}

Extract all compliance steps from the context. Each step should be a distinct requirement. For each step's sources array, use ONLY the source names listed above (do NOT create new source names or extract names from the content text). Return ONLY valid JSON, no additional text.`;
}
