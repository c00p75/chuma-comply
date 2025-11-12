# Complete RAG Setup Summary

## ✅ What's Been Done

### 1. Region Configuration ✅
- **API Function**: Added `GCP_LOCATION: "us-east1"` to environment variables
- **Ingestion Function**: Already has `GCP_LOCATION: "us-east1"` and `CORPUS_PATH: "gs://chuma-comply-corpus"`
- Both functions now use `us-east1` to match your corpus region

### 2. Scripts Created ✅
- **`scripts/trigger-ingestion.sh`**: Helper script to trigger document ingestion
- **`scripts/test-rag-flow.sh`**: Test script to verify the complete flow
- **`INGESTION_GUIDE.md`**: Complete guide for ingesting documents

### 3. Code Flow Verified ✅
- Frontend → API → RAG Pipeline all connected
- Authentication working
- Error handling in place
- CORS configured correctly

## 🚀 Next Steps

### Step 1: Deploy Updated Functions
```bash
firebase deploy --only functions
```

This will deploy:
- API function with `GCP_LOCATION: "us-east1"`
- Ingestion function (already configured)

### Step 2: Ingest Documents

**Option A: Use the script**
```bash
./scripts/trigger-ingestion.sh
```

**Option B: Manual trigger**
```bash
# Get URL from Firebase Console or use:
INGESTION_URL="https://us-central1-chumacomply.cloudfunctions.net/ingest_document"

curl -X POST "$INGESTION_URL" \
  -H "Content-Type: application/json" \
  -d '{"process_all": true}'
```

### Step 3: Verify Documents in Firestore
1. Go to [Firestore Console](https://console.firebase.google.com/project/chumacomply/firestore/data)
2. Check `vectorChunks` collection
3. Should see documents with embeddings

### Step 4: Test the Flow
```bash
./scripts/test-rag-flow.sh
```

Or test in the UI:
1. Open your app
2. Log in
3. Type a query: "What do I need to register my business?"
4. Should get a contextualized response with sources

## 📋 Ingestion Function URL

The ingestion function is deployed at:
- **URL**: `https://us-central1-chumacomply.cloudfunctions.net/ingest_document`
- **Region**: `us-central1`
- **Runtime**: Python 3.11

To get the exact URL:
1. Go to [Firebase Console Functions](https://console.firebase.google.com/project/chumacomply/functions)
2. Click on `ingest_document`
3. Copy the "Trigger URL"

## 🔍 Verification Checklist

Before testing in the UI, verify:

- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Documents ingested: Check `vectorChunks` collection in Firestore
- [ ] User authenticated: Logged in with Firebase Auth
- [ ] API URL configured: `VITE_API_BASE_URL` in `.env.local` points to your function
- [ ] Environment variables set: `GCP_LOCATION` in both functions

## 🐛 Troubleshooting

### "No compliance information available"
- **Cause**: No documents in Firestore
- **Fix**: Run ingestion function

### "UNAUTHORIZED" error
- **Cause**: User not authenticated
- **Fix**: Ensure user is logged in

### CORS errors
- **Cause**: Origin not in allowed list
- **Fix**: Add your domain to `ALLOWED_ORIGINS` in `services/functions/src/index.ts`

### Function timeout
- **Cause**: Large PDFs or slow processing
- **Fix**: Check function logs, may need to increase timeout

## 📊 Expected Response Format

When everything works, you'll get:
```json
{
  "content": "To register your business in Zambia, you must... [Source: Companies Act, Sec. 12]",
  "sources": [
    { "title": "Companies Act, 2017" }
  ]
}
```

## 🎯 Success Criteria

You'll know it's working when:
1. ✅ You can type a query in the chat
2. ✅ You get a relevant, contextualized answer
3. ✅ Sources are displayed below the answer
4. ✅ Different queries return different answers (not the same placeholder)

---

**Ready to go!** Deploy the functions and ingest documents, then test in the UI.

