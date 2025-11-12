import { z } from 'zod';
import { protectedProcedure, router, db } from '../trpc.js';
import { TRPCError } from '@trpc/server';
import type admin from 'firebase-admin';
import { cosineSimilarity, generateEmbedding, generateContent } from '../lib/rag-utils.js';
import { INTENT_ANALYSIS_PROMPT, FINAL_GENERATION_SYSTEM_PROMPT, FINAL_GENERATION_SYSTEM_PROMPT_JSON, getFinalGenerationPrompt, getFinalGenerationPromptJSON } from '../lib/prompts.js';
import { vectorChunkSchema, type VectorChunk } from '../schemas/vectorChunk.js';
import { extractKeywordHints } from '../lib/keyword-logic.js';

/**
 * Validates and transforms a checklist item to match the Zod schema.
 * Handles type conversions and provides defaults for missing fields.
 */
function validateAndTransformChecklistItem(item: any, index: number): {
  step: number;
  title: string;
  description: string;
  regulatoryBody: string;
  required: boolean;
  sources: Array<{ title: string; section?: string }>;
} | null {
  try {
    // Ensure step is a number
    let step: number;
    if (typeof item.step === 'number') {
      step = item.step;
    } else if (typeof item.step === 'string') {
      const parsed = parseInt(item.step, 10);
      step = isNaN(parsed) ? index + 1 : parsed;
    } else {
      step = index + 1;
    }

    // Ensure title is a string
    const title = typeof item.title === 'string' && item.title.trim() 
      ? item.title.trim() 
      : `Step ${step}`;

    // Ensure description is a string
    const description = typeof item.description === 'string' && item.description.trim()
      ? item.description.trim()
      : '';

    // Ensure regulatoryBody is a string
    const regulatoryBody = typeof item.regulatoryBody === 'string' && item.regulatoryBody.trim()
      ? item.regulatoryBody.trim()
      : 'General';

    // Ensure required is a boolean
    const required = typeof item.required === 'boolean' 
      ? item.required 
      : (typeof item.required === 'string' ? item.required.toLowerCase() === 'true' : true);

    // Validate and transform sources array
    let sources: Array<{ title: string; section?: string }> = [];
    if (Array.isArray(item.sources)) {
      sources = item.sources
        .map((source: any) => {
          if (typeof source === 'object' && source !== null) {
            const sourceTitle = typeof source.title === 'string' && source.title.trim()
              ? source.title.trim()
              : null;
            if (sourceTitle) {
              return {
                title: sourceTitle,
                section: typeof source.section === 'string' && source.section.trim()
                  ? source.section.trim()
                  : undefined,
              };
            }
          }
          return null;
        })
        .filter((s: any) => s !== null);
    }

    // If no valid sources, provide empty array
    if (sources.length === 0 && item.sources) {
      // Try to extract source from string format
      if (typeof item.sources === 'string') {
        sources = [{ title: item.sources }];
      }
    }

    return {
      step,
      title,
      description,
      regulatoryBody,
      required,
      sources,
    };
  } catch (error) {
    console.warn(`[RAG] Failed to validate checklist item at index ${index}:`, error, item);
    return null;
  }
}

/**
 * Validates and transforms the parsed response to match the Zod output schema.
 */
function validateAndTransformResponse(
  parsedResponse: any,
  topChunks: VectorChunk[]
): {
  content: string;
  checklist?: Array<{
    step: number;
    title: string;
    description: string;
    regulatoryBody: string;
    required: boolean;
    sources: Array<{ title: string; section?: string }>;
  }>;
  sources: Array<{ title: string }>;
} {
  // Ensure content is a string
  const content = typeof parsedResponse.content === 'string' && parsedResponse.content.trim()
    ? parsedResponse.content.trim()
    : '';

  // Validate and transform checklist
  let checklist: Array<{
    step: number;
    title: string;
    description: string;
    regulatoryBody: string;
    required: boolean;
    sources: Array<{ title: string; section?: string }>;
  }> | undefined = undefined;

  if (parsedResponse.checklist && Array.isArray(parsedResponse.checklist)) {
    const validatedItems = parsedResponse.checklist
      .map((item: any, index: number) => validateAndTransformChecklistItem(item, index))
      .filter((item: any) => item !== null);

    if (validatedItems.length > 0) {
      checklist = validatedItems;
    } else {
      console.warn('[RAG] Checklist array provided but no valid items after validation');
    }
  }

  // Extract sources from chunks
  const sources = topChunks.map((chunk) => ({
    title: chunk.actName || chunk.sourceDocument,
  }));

  return {
    content,
    checklist,
    sources: Array.from(new Map(sources.map((s) => [s.title, s])).values()), // Deduplicate
  };
}

export const ragRouter = router({
  getComplianceChecklist: protectedProcedure
    .input(z.object({ query: z.string().min(10) }))
    .output(
      z.object({
        content: z.string(),
        checklist: z.array(
          z.object({
            step: z.number(),
            title: z.string(),
            description: z.string(),
            regulatoryBody: z.string(),
            required: z.boolean(),
            sources: z.array(z.object({ title: z.string(), section: z.string().optional() })),
          })
        ).optional(),
        sources: z.array(z.object({ title: z.string() })),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { query } = input;
        const { userId, userTier } = ctx;

        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required',
          });
        }

        // Step 1: Get user tier (already in context, but verify from Firestore if needed)
        const effectiveUserTier = userTier || 'free';
        
        // Step 1.5: Keyword-based smart logic (fast pre-filter)
        const keywordHints = extractKeywordHints(query);
        console.log(`[RAG] Keyword hints: ${JSON.stringify(keywordHints)}`);
        
        // Step 2: Intent Analysis - Extract industry, activities, location from query
        let intentData: { industry: string; activities: string[]; location: string };
        try {
          const intentPrompt = INTENT_ANALYSIS_PROMPT.replace('{query}', query);
          const intentResponse = await generateContent(intentPrompt);
          
          // Parse JSON response
          const jsonMatch = intentResponse.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in intent analysis response');
          }
          intentData = JSON.parse(jsonMatch[0]);
          
          // Merge keyword hints with LLM analysis (keyword hints take precedence for activities)
          if (keywordHints.activities.length > 0) {
            // Combine activities from both sources
            intentData.activities = [...new Set([...keywordHints.activities, ...intentData.activities])];
          }
          if (keywordHints.industry && intentData.industry === 'general') {
            intentData.industry = keywordHints.industry;
          }
        } catch (error) {
          console.error('Intent analysis failed, using keyword hints and defaults:', error);
          // Fallback to keyword hints or defaults
          intentData = {
            industry: keywordHints.industry || 'general',
            activities: keywordHints.activities,
            location: 'Zambia',
          };
        }

        // Step 3: Metadata Filtering - Query Firestore with filters
        const vectorChunksRef = db.collection('vectorChunks');
        
        // Build Firestore query with metadata filters
        // Only filter by documentType if we have activities from intent analysis
        // Documents are stored with documentTypes like: business_registration, tax, employment, data_protection
        // (not 'general')
        
        // Start building the query - CollectionReference can be used as Query
        let queryRef: admin.firestore.Query = vectorChunksRef;
        
        // Only filter by documentType if we have specific activities
        if (intentData.activities.length > 0) {
          // Use 'in' query for documentType (Firestore supports up to 10 items in 'in' queries)
          const documentTypes = intentData.activities;
          if (documentTypes.length <= 10) {
            queryRef = queryRef.where('documentType', 'in', documentTypes);
          } else {
            // If more than 10, just use the first 10
            queryRef = queryRef.where('documentType', 'in', documentTypes.slice(0, 10));
          }
        }
        // If no activities, don't filter by documentType - get all chunks

        // Optionally filter by industry if not 'general'
        if (intentData.industry !== 'general') {
          queryRef = queryRef.where('industry', '==', intentData.industry);
        }

        // Limit to max 500 chunks for in-memory search
        queryRef = queryRef.limit(500);

        const filteredDocs = await queryRef.get();
        
        console.log(`[RAG] Query: "${query}" | Intent: ${JSON.stringify(intentData)} | Found ${filteredDocs.size} chunks`);
        
        if (filteredDocs.empty) {
          // Fallback: get any chunks if no matches (don't filter by documentType)
          console.log('[RAG] Primary query returned empty, trying fallback: getting any chunks');
          const fallbackDocs = await vectorChunksRef
            .limit(500)
            .get();
          
          if (fallbackDocs.empty) {
            console.error('[RAG] No chunks found in Firestore. Documents may not be ingested.');
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No compliance information available. Please ensure documents have been ingested.',
            });
          }
          
          // Use fallback chunks
          const chunks: VectorChunk[] = [];
          fallbackDocs.forEach((doc) => {
            try {
              const data = vectorChunkSchema.parse(doc.data());
              chunks.push(data);
            } catch (error) {
              console.warn(`Failed to parse chunk ${doc.id}:`, error);
            }
          });
          
          console.log(`[RAG] Fallback: Using ${chunks.length} chunks from all documents`);

          // Step 4: In-Memory Search
          const queryEmbedding = await generateEmbedding(query);
          
          // Debug: Check embedding format
          if (chunks.length > 0) {
            const firstEmbedding = chunks[0].embedding;
            console.log(`[RAG] Debug - First chunk embedding type: ${typeof firstEmbedding}, isArray: ${Array.isArray(firstEmbedding)}, length: ${firstEmbedding?.length}, first 3 values: ${firstEmbedding?.slice(0, 3)}`);
            console.log(`[RAG] Debug - Query embedding type: ${typeof queryEmbedding}, isArray: ${Array.isArray(queryEmbedding)}, length: ${queryEmbedding?.length}, first 3 values: ${queryEmbedding?.slice(0, 3)}`);
          }
          
          // Calculate similarity for each chunk
          const chunksWithSimilarity = chunks.map((chunk) => {
            // Ensure embedding is an array of numbers
            let embedding = chunk.embedding;
            if (!Array.isArray(embedding)) {
              console.warn(`[RAG] Chunk ${chunk.chunkId} has non-array embedding: ${typeof embedding}`);
              return { chunk, similarity: 0 };
            }
            // Convert to numbers if needed
            if (embedding.length > 0 && typeof embedding[0] !== 'number') {
              embedding = embedding.map(v => typeof v === 'string' ? parseFloat(v) : v);
            }
            return {
              chunk,
              similarity: cosineSimilarity(queryEmbedding, embedding),
            };
          });

          // Sort by similarity
          const sortedChunks = chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
          
          // Log similarity scores for debugging
          const topScores = sortedChunks.slice(0, 10).map((item, idx) => ({
            idx: idx + 1,
            source: item.chunk.sourceDocument,
            similarity: item.similarity.toFixed(4),
          }));
          console.log(`[RAG] Top similarity scores:`, JSON.stringify(topScores, null, 2));

          // Filter by minimum similarity threshold (0.25) and get top 10
          const MIN_SIMILARITY_THRESHOLD = 0.25;
          const filteredChunks = sortedChunks.filter((item) => item.similarity >= MIN_SIMILARITY_THRESHOLD);
          
          let topChunks: VectorChunk[];
          if (filteredChunks.length === 0) {
            console.warn(`[RAG] No chunks meet similarity threshold ${MIN_SIMILARITY_THRESHOLD}. Highest score: ${sortedChunks[0]?.similarity.toFixed(4)}`);
            // Fallback: use top 5 even if below threshold, but log warning
            topChunks = sortedChunks.slice(0, 5).map((item) => item.chunk);
            console.log(`[RAG] Using top 5 chunks despite low similarity (fallback mode)`);
          } else {
            topChunks = filteredChunks.slice(0, 10).map((item) => item.chunk);
            console.log(`[RAG] Using ${topChunks.length} chunks above similarity threshold ${MIN_SIMILARITY_THRESHOLD}`);
          }

          // Step 5: Paywall Check - TEMPORARILY DISABLED
          // TODO: Re-enable paywall restriction later
          /*
          const hasProChunks = topChunks.some((chunk) => chunk.subscriptionTier === 'pro');
          if (hasProChunks && effectiveUserTier === 'free') {
            const freeChunks = topChunks.filter((c) => c.subscriptionTier === 'free');
            const proCount = topChunks.filter((c) => c.subscriptionTier === 'pro').length;
            
            if (freeChunks.length === 0) {
              // Only block if ALL chunks are pro
              throw new TRPCError({
                code: 'PAYMENT_REQUIRED',
                message: `I found ${proCount} industry-specific compliance guide${proCount > 1 ? 's' : ''} for you. Upgrade to Pro to unlock this answer.`,
              });
            }
            
            // Use only free chunks for free users
            topChunks = freeChunks;
            console.log(`[RAG] Filtered out ${proCount} pro chunks, using ${freeChunks.length} free chunks`);
          }
          */

          // Step 6: Final Generation with Structured JSON
          const contextChunks = topChunks.map((chunk) => ({
            content: chunk.content,
            sourceDocument: chunk.sourceDocument,
            sectionNumber: chunk.sectionNumber,
            actName: chunk.actName,
            regulatoryBody: chunk.regulatoryBody,
          }));

          const finalPrompt = getFinalGenerationPromptJSON(query, contextChunks);
          const generatedResponse = await generateContent(
            finalPrompt,
            FINAL_GENERATION_SYSTEM_PROMPT_JSON
          );

          // Parse JSON response
          let parsedResponse: { content: string; checklist?: any[] };
          try {
            // Try to extract JSON from response (may have markdown code blocks or extra text)
            let jsonText = generatedResponse.trim();
            
            // Remove markdown code blocks if present
            jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
            
            // Find JSON object
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('No JSON found in response');
            }
            
            parsedResponse = JSON.parse(jsonMatch[0]);
            console.log(`[RAG] Successfully parsed JSON response. Has checklist: ${!!parsedResponse.checklist}, checklist length: ${parsedResponse.checklist?.length || 0}`);
          } catch (error) {
            console.warn('[RAG] Failed to parse JSON response, falling back to text:', error);
            console.warn('[RAG] Response preview:', generatedResponse.substring(0, 200));
            // Fallback to plain text if JSON parsing fails
            parsedResponse = {
              content: generatedResponse,
            };
          }

          // Validate and transform response to match schema
          let validatedResponse;
          try {
            validatedResponse = validateAndTransformResponse(parsedResponse, topChunks);
            console.log(`[RAG] Validated response: content length=${validatedResponse.content.length}, checklist items=${validatedResponse.checklist?.length || 0}, sources=${validatedResponse.sources.length}`);
          } catch (validationError) {
            console.error('[RAG] Validation error:', validationError);
            console.error('[RAG] Parsed response structure:', JSON.stringify(parsedResponse, null, 2));
            // Fallback: return minimal valid response
            validatedResponse = {
              content: parsedResponse.content || 'Unable to generate response.',
              sources: topChunks.map((chunk) => ({
                title: chunk.actName || chunk.sourceDocument,
              })),
            };
          }
          
          return validatedResponse;
        }

        // Parse filtered chunks
        const chunks: VectorChunk[] = [];
        filteredDocs.forEach((doc) => {
          try {
            const data = vectorChunkSchema.parse(doc.data());
            chunks.push(data);
          } catch (error) {
            console.warn(`Failed to parse chunk ${doc.id}:`, error);
          }
        });

        console.log(`[RAG] Parsed ${chunks.length} valid chunks from ${filteredDocs.size} documents`);

        if (chunks.length === 0) {
          console.error('[RAG] No valid chunks after parsing');
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No relevant compliance information found. Please try rephrasing your question.',
          });
        }

        // Step 4: In-Memory Search
        const queryEmbedding = await generateEmbedding(query);
        
        // Debug: Check embedding format
        if (chunks.length > 0) {
          const firstEmbedding = chunks[0].embedding;
          console.log(`[RAG] Debug - First chunk embedding type: ${typeof firstEmbedding}, isArray: ${Array.isArray(firstEmbedding)}, length: ${firstEmbedding?.length}, first 3 values: ${firstEmbedding?.slice(0, 3)}`);
          console.log(`[RAG] Debug - Query embedding type: ${typeof queryEmbedding}, isArray: ${Array.isArray(queryEmbedding)}, length: ${queryEmbedding?.length}, first 3 values: ${queryEmbedding?.slice(0, 3)}`);
        }
        
        // Calculate similarity for each chunk
        const chunksWithSimilarity = chunks.map((chunk) => {
          // Ensure embedding is an array of numbers
          let embedding = chunk.embedding;
          if (!Array.isArray(embedding)) {
            console.warn(`[RAG] Chunk ${chunk.chunkId} has non-array embedding: ${typeof embedding}`);
            return { chunk, similarity: 0 };
          }
          // Convert to numbers if needed
          if (embedding.length > 0 && typeof embedding[0] !== 'number') {
            embedding = embedding.map(v => typeof v === 'string' ? parseFloat(v) : v);
          }
          return {
            chunk,
            similarity: cosineSimilarity(queryEmbedding, embedding),
          };
        });

        // Sort by similarity
        const sortedChunks = chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
        
        // Log similarity scores for debugging
        const topScores = sortedChunks.slice(0, 10).map((item, idx) => ({
          idx: idx + 1,
          source: item.chunk.sourceDocument,
          similarity: item.similarity.toFixed(4),
        }));
        console.log(`[RAG] Top similarity scores:`, JSON.stringify(topScores, null, 2));

        // Filter by minimum similarity threshold (0.25) and get top 10
        const MIN_SIMILARITY_THRESHOLD = 0.25;
        const filteredChunks = sortedChunks.filter((item) => item.similarity >= MIN_SIMILARITY_THRESHOLD);
        
        if (filteredChunks.length === 0) {
          console.warn(`[RAG] No chunks meet similarity threshold ${MIN_SIMILARITY_THRESHOLD}. Highest score: ${sortedChunks[0]?.similarity.toFixed(4)}`);
          // Fallback: use top 5 even if below threshold, but log warning
          console.log(`[RAG] Using top 5 chunks despite low similarity (fallback mode)`);
        } else {
          console.log(`[RAG] Using ${Math.min(filteredChunks.length, 10)} chunks above similarity threshold ${MIN_SIMILARITY_THRESHOLD}`);
        }
        
        let topChunks = (filteredChunks.length > 0 
          ? filteredChunks.slice(0, 10) 
          : sortedChunks.slice(0, 5)
        ).map((item) => item.chunk);

        // Step 5: Paywall Check - TEMPORARILY DISABLED
        // TODO: Re-enable paywall restriction later
        /*
        const hasProChunks = topChunks.some((chunk) => chunk.subscriptionTier === 'pro');
        if (hasProChunks && effectiveUserTier === 'free') {
          const freeChunks = topChunks.filter((c) => c.subscriptionTier === 'free');
          const proCount = topChunks.filter((c) => c.subscriptionTier === 'pro').length;
          
          if (freeChunks.length === 0) {
            // Only block if ALL chunks are pro
            throw new TRPCError({
              code: 'PAYMENT_REQUIRED',
              message: `I found ${proCount} industry-specific compliance guide${proCount > 1 ? 's' : ''} for you. Upgrade to Pro to unlock this answer.`,
            });
          }
          
          // Use only free chunks for free users
          topChunks = freeChunks;
          console.log(`[RAG] Filtered out ${proCount} pro chunks, using ${freeChunks.length} free chunks`);
        }
        */

        // Step 6: Final Generation with Structured JSON
        const contextChunks = topChunks.map((chunk) => ({
          content: chunk.content,
          sourceDocument: chunk.sourceDocument,
          sectionNumber: chunk.sectionNumber,
          actName: chunk.actName,
          regulatoryBody: chunk.regulatoryBody,
        }));

        const finalPrompt = getFinalGenerationPromptJSON(query, contextChunks);
        const generatedResponse = await generateContent(
          finalPrompt,
          FINAL_GENERATION_SYSTEM_PROMPT_JSON
        );

        // Parse JSON response
        let parsedResponse: { content: string; checklist?: any[] };
        try {
          // Try to extract JSON from response (may have markdown code blocks or extra text)
          let jsonText = generatedResponse.trim();
          
          // Remove markdown code blocks if present
          jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          
          // Find JSON object
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in response');
          }
          
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log(`[RAG] Successfully parsed JSON response. Has checklist: ${!!parsedResponse.checklist}, checklist length: ${parsedResponse.checklist?.length || 0}`);
        } catch (error) {
          console.warn('[RAG] Failed to parse JSON response, falling back to text:', error);
          console.warn('[RAG] Response preview:', generatedResponse.substring(0, 200));
          // Fallback to plain text if JSON parsing fails
          parsedResponse = {
            content: generatedResponse,
          };
        }

        // Validate and transform response to match schema
        let validatedResponse;
        try {
          validatedResponse = validateAndTransformResponse(parsedResponse, topChunks);
          console.log(`[RAG] Validated response: content length=${validatedResponse.content.length}, checklist items=${validatedResponse.checklist?.length || 0}, sources=${validatedResponse.sources.length}`);
        } catch (validationError) {
          console.error('[RAG] Validation error:', validationError);
          console.error('[RAG] Parsed response structure:', JSON.stringify(parsedResponse, null, 2));
          // Fallback: return minimal valid response
          validatedResponse = {
            content: parsedResponse.content || 'Unable to generate response.',
            sources: topChunks.map((chunk) => ({
              title: chunk.actName || chunk.sourceDocument,
            })),
          };
        }
        
        return validatedResponse;
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('RAG pipeline error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to generate compliance checklist. Please try again.',
        });
      }
    }),
});
