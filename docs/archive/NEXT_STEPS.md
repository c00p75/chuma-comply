# Next Steps - Step-by-Step Guide

Follow these steps in order to get your RAG system working.

## Step 1: Deploy the Updated Functions

First, deploy the functions with the new region configuration:

```bash
firebase deploy --only functions
```

**What this does:**
- Deploys the API function with `GCP_LOCATION: "us-east1"`
- Ensures the ingestion function has the correct corpus path
- Makes the functions available for use

**Expected output:**
- ✅ Functions deployed successfully
- You'll see the function URLs in the output

**Time:** ~2-5 minutes

---

## Step 2: Verify Functions Are Deployed

Check that both functions are running:

```bash
firebase functions:list
```

You should see:
- `api` (v2, https, us-central1)
- `ingest_document` (v2, https, us-central1)

---

## Step 3: Ingest Documents from Corpus

This is the critical step - you need to process PDFs and store them in Firestore.

### Option A: Use the Helper Script (Easiest)

```bash
./scripts/trigger-ingestion.sh
```

The script will:
1. Help you find the ingestion URL (or use the default)
2. Trigger ingestion for all PDFs
3. Show you the response

### Option B: Manual Trigger

```bash
curl -X POST https://us-central1-chumacomply.cloudfunctions.net/ingest_document \
  -H "Content-Type: application/json" \
  -d '{"process_all": true}'
```

**What happens:**
1. Function reads PDFs from `gs://chuma-comply-corpus`
2. Extracts text from each PDF
3. Chunks the text semantically
4. Generates embeddings using Vertex AI
5. Stores chunks in Firestore `vectorChunks` collection

**Expected response:**
```json
{
  "status": "success",
  "processed": 8,
  "stored": 150
}
```

**Time:** ~5-15 minutes (depends on number/size of PDFs)

**Note:** This may take a while. The function processes PDFs one by one.

---

## Step 4: Verify Documents Are in Firestore

Check that documents were successfully ingested:

### Option A: Firebase Console (Visual)
1. Go to: https://console.firebase.google.com/project/chumacomply/firestore/data
2. Click on `vectorChunks` collection
3. You should see documents with fields like:
   - `chunkId`
   - `content`
   - `embedding` (array of numbers)
   - `sourceDocument`
   - `subscriptionTier`

### Option B: Command Line

```bash
# Count documents
gcloud firestore documents list --collection-ids=vectorChunks --format="value(name)" | wc -l

# List first few
gcloud firestore documents list --collection-ids=vectorChunks --limit=3
```

**Expected:** You should see multiple documents (hundreds or thousands depending on PDF size)

**If empty:** Check function logs:
```bash
firebase functions:log --only ingest_document
```

---

## Step 5: Test the RAG Flow

Now test that everything works end-to-end.

### Option A: Use the Test Script

```bash
./scripts/test-rag-flow.sh
```

This will:
- Check if documents exist
- Verify API is accessible
- Give you a checklist

### Option B: Test in the UI

1. **Start your dev server** (if not running):
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open the app** in your browser:
   - Usually: http://localhost:5173

3. **Log in** with a Firebase Auth account

4. **Type a test query**:
   - "What do I need to register my business?"
   - "Guide me through general business compliance"
   - "What are the data protection requirements?"

5. **Expected result:**
   - ✅ Query is sent
   - ✅ Loading indicator appears
   - ✅ Response appears with:
     - Contextualized answer
     - Sources listed below
   - ✅ Different queries return different answers

### Option C: Test with curl (Advanced)

```bash
# First, get an auth token (from browser console after login)
# Then:
curl -X GET "https://us-central1-chumacomply.cloudfunctions.net/trpc/rag.getComplianceChecklist?batch=1&input=%7B%220%22%3A%7B%22query%22%3A%22What%20do%20I%20need%20to%20register%20my%20business%3F%22%7D%7D" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 6: Troubleshooting (If Needed)

### Problem: "No compliance information available"

**Cause:** Documents not ingested or Firestore is empty

**Fix:**
1. Check Firestore: https://console.firebase.google.com/project/chumacomply/firestore/data
2. If `vectorChunks` is empty, re-run ingestion
3. Check ingestion logs for errors

### Problem: "UNAUTHORIZED" error

**Cause:** User not authenticated

**Fix:**
1. Ensure user is logged in
2. Check browser console for auth errors
3. Verify Firebase Auth is configured correctly

### Problem: Same response for different queries

**Cause:** Documents not ingested (still using old mock data)

**Fix:**
1. Verify documents are in Firestore
2. Redeploy functions if needed
3. Clear browser cache

### Problem: CORS errors

**Cause:** Origin not allowed

**Fix:**
1. Check `ALLOWED_ORIGINS` in `services/functions/src/index.ts`
2. Add your domain if needed
3. Redeploy functions

### Problem: Function timeout

**Cause:** Large PDFs or slow processing

**Fix:**
1. Check function logs
2. Process files individually instead of all at once
3. Increase function timeout in Firebase Console

---

## Step 7: Monitor and Optimize

Once everything works:

1. **Check function logs:**
   ```bash
   firebase functions:log
   ```

2. **Monitor Firestore usage:**
   - Check document count
   - Monitor read/write operations

3. **Test different query types:**
   - General questions
   - Specific compliance topics
   - Industry-specific queries

4. **Verify paywall logic:**
   - Test with free user (should see free content)
   - Test with pro user (should see pro content)
   - Verify upgrade prompts work

---

## Success Checklist

You'll know everything is working when:

- [ ] Functions deployed successfully
- [ ] Documents ingested (vectorChunks collection has data)
- [ ] Can type queries in the chat UI
- [ ] Get contextualized responses (not placeholder text)
- [ ] Different queries return different answers
- [ ] Sources are displayed correctly
- [ ] No errors in browser console
- [ ] No errors in function logs

---

## Quick Reference

**Function URLs:**
- API: `https://us-central1-chumacomply.cloudfunctions.net/api`
- Ingestion: `https://us-central1-chumacomply.cloudfunctions.net/ingest_document`

**Firebase Console:**
- Functions: https://console.firebase.google.com/project/chumacomply/functions
- Firestore: https://console.firebase.google.com/project/chumacomply/firestore/data

**Useful Commands:**
```bash
# Deploy functions
firebase deploy --only functions

# Check function status
firebase functions:list

# View logs
firebase functions:log

# Trigger ingestion
./scripts/trigger-ingestion.sh

# Test flow
./scripts/test-rag-flow.sh
```

---

**Ready? Start with Step 1!** 🚀

