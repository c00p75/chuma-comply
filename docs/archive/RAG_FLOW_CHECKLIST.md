# RAG Flow Comprehensive Checklist

## Flow: User Types Prompt → Gets Response

### ✅ 1. Frontend (ChatInput.tsx)
- [x] Calls `trpc.rag.getComplianceChecklist.query({ query: text })`
- [x] Handles errors gracefully
- [x] Displays response with sources

### ✅ 2. tRPC Client (apps/web/src/lib/trpc.ts)
- [x] Sends auth token in Authorization header
- [x] Uses correct API base URL from env
- [x] Properly configured httpBatchLink

### ✅ 3. Firebase Function (services/functions/src/index.ts)
- [x] Handles CORS correctly
- [x] Extracts auth token from Authorization header
- [x] Verifies token and gets userId
- [x] Fetches user tier from Firestore
- [x] Creates context with userId and userTier
- [x] Passes context to tRPC handler
- [x] Error handling with CORS headers

### ✅ 4. tRPC Router (packages/api-trpc/src/routers/rag.ts)
- [x] Uses `protectedProcedure` (requires auth)
- [x] Step 1: Gets user tier from context
- [x] Step 2: Intent analysis with Gemini
- [x] Step 3: Metadata filtering in Firestore
- [x] Step 4: In-memory vector search (cosine similarity)
- [x] Step 5: Paywall check
- [x] Step 6: Final generation with Gemini
- [x] Returns content and sources

### ⚠️ 5. Potential Issues Found

#### Issue 1: Region Mismatch
- **Problem**: RAG API function uses `us-central1` (default) for Vertex AI calls, but corpus is in `us-east1`
- **Impact**: Should still work, but may have slightly higher latency
- **Fix**: Add `GCP_LOCATION: "us-east1"` to API function environment variables (optional)

#### Issue 2: Documents Not Ingested
- **Problem**: Firestore `vectorChunks` collection is empty
- **Impact**: Will get "No compliance information available" error
- **Fix**: Run ingestion function to process PDFs from corpus

#### Issue 3: Environment Variables
- **API Function**: No `GCP_LOCATION` set (defaults to `us-central1`)
- **Ingestion Function**: ✅ Has `CORPUS_PATH` and `GCP_LOCATION` set correctly

### 🔧 Required Actions

1. **Deploy Updated Functions**:
   ```bash
   firebase deploy --only functions
   ```

2. **Ingest Documents** (if not done):
   - Get ingestion function URL from Firebase Console
   - Trigger with: `curl -X POST <INGESTION_URL> -H "Content-Type: application/json" -d '{"process_all": true}'`

3. **Optional: Set GCP_LOCATION for API Function**:
   Add to `firebase.json` under the API function:
   ```json
   {
     "source": "services/functions",
     "environmentVariables": {
       "GCP_LOCATION": "us-east1"
     }
   }
   ```

### ✅ What Will Work

Once documents are ingested:
1. User types query → Frontend sends to tRPC
2. Auth token included → Function verifies and gets user tier
3. RAG pipeline runs → Intent analysis, filtering, search, generation
4. Response returned → User sees answer with sources

### ❌ What Won't Work

- If `vectorChunks` collection is empty → Will get "No compliance information available"
- If user is not authenticated → Will get "UNAUTHORIZED" error
- If ingestion function hasn't processed PDFs → No data to search

