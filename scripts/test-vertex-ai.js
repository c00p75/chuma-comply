#!/usr/bin/env node
/**
 * Test script for Vertex AI embedding and content generation
 * This tests the core Vertex AI functionality used by the RAG system
 */

import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'chumacomply';
const LOCATION = process.env.GCP_LOCATION || 'us-east1';

async function testEmbedding() {
  console.log('🧪 Testing Vertex AI Embedding Generation...\n');
  
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/text-embedding-005:predict`;
  
  const testQuery = "What do I need to register my business in zambia?";
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({
        instances: [
          {
            content: testQuery,
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
    const prediction = result.predictions[0];
    const embedding = prediction.embeddings?.values || prediction.values || prediction.embeddings;
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding format');
    }
    
    console.log(`✅ Embedding generated successfully!`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`   Query: "${testQuery}"\n`);
    
    return embedding;
  } catch (error) {
    console.error('❌ Embedding test failed:', error.message);
    throw error;
  }
}

async function testContentGeneration() {
  console.log('🧪 Testing Vertex AI Content Generation...\n');
  
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-2.5-flash:generateContent`;
  
  const testPrompt = `Context from legal documents:

[Chunk 1 - Source: Companies Act, 2017.pdf, Sec. 12]
To register a business in Zambia, you must first apply for name clearance with PACRA. The approved name is valid for 30 days.

[Chunk 2 - Source: PACRA_ What do I do first.pdf]
You can obtain registration forms from PACRA offices, the PACRA Portal, or ZamPortal.

---

User Question: What do I need to register my business in zambia?

Based on the context provided above, provide a comprehensive answer to the user's question. Synthesize information from the relevant chunks to give a complete, actionable response. Always cite your sources using the format [Source: Document Name, Section X]. If information from multiple chunks is relevant, combine them to provide a thorough answer.`;
  
  const systemInstruction = `You are a compliance assistant for businesses in Zambia. Your role is to provide accurate, helpful, and well-cited compliance information based on the provided legal document chunks.

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
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: testPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      }),
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
    
    console.log(`✅ Content generation successful!`);
    console.log(`   Model: gemini-2.5-flash`);
    console.log(`   Response length: ${text.length} characters\n`);
    console.log(`📝 Generated Response:\n${'─'.repeat(60)}\n${text}\n${'─'.repeat(60)}\n`);
    
    return text;
  } catch (error) {
    console.error('❌ Content generation test failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Testing Vertex AI Integration for RAG System           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Location: ${LOCATION}\n`);
  
  try {
    // Test embedding generation
    await testEmbedding();
    
    // Test content generation
    await testContentGeneration();
    
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ All Tests Passed!                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('Next steps:');
    console.log('1. Test the full RAG pipeline in your UI: http://localhost:5173');
    console.log('2. Query: "What do I need to register my business in zambia?"');
    console.log('3. Check logs: firebase functions:log --only api --limit 50');
    console.log('4. Look for [RAG] entries showing similarity scores\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();

