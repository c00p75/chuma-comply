# Testing Guide - RAG System

## ✅ Ingestion Complete!

**Status**: 1,989 chunks created from 8 PDFs
- Companies Act: 1,136 chunks
- Data Protection Act: 159 chunks
- Employment Code: 337 chunks
- VAT Guides: 283 chunks
- Other documents: 74 chunks

## 🧪 Test the RAG Flow

### Step 1: Verify Documents in Firestore

**Option A: Firebase Console (Visual)**
1. Go to: https://console.firebase.google.com/project/chumacomply/firestore/data
2. Click on `vectorChunks` collection
3. You should see ~1,989 documents
4. Click on one to verify it has:
   - `content` (text chunk)
   - `embedding` (array of 768 numbers)
   - `sourceDocument` (PDF name)
   - `subscriptionTier` ('free' or 'pro')

**Option B: Command Line**
```bash
# Count documents
gcloud firestore documents list --collection-ids=vectorChunks --format="value(name)" | wc -l

# Should show ~1989
```

### Step 2: Test in the UI

1. **Start your dev server** (if not running):
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open the app**: http://localhost:5173

3. **Log in** with Firebase Auth

4. **Test queries**:

   **Query 1: General Business Registration**
   ```
   What do I need to register my business?
   ```
   **Expected**: Answer about PACRA registration with sources

   **Query 2: Data Protection**
   ```
   Do I need to register for data protection?
   ```
   **Expected**: Answer about Data Protection Commissioner with sources

   **Query 3: Employment**
   ```
   What are my obligations as an employer?
   ```
   **Expected**: Answer about Employment Code Act with sources

   **Query 4: Tax**
   ```
   When do I need to register for VAT?
   ```
   **Expected**: Answer about VAT registration with sources

### Step 3: Verify Responses

**What to check:**
- ✅ Response is contextualized (not placeholder text)
- ✅ Different queries return different answers
- ✅ Sources are displayed correctly
- ✅ Response time is reasonable (5-15 seconds)
- ✅ No errors in browser console

**What you should see:**
```
User: "What do I need to register my business?"

Bot: "To register your business in Zambia, you must first register 
your business name with PACRA (Patents and Companies Registration Agency). 
This is required for all businesses operating in Zambia. [Source: Companies Act, 2017, Sec. 12]

Sources:
- Companies Act, 2017
- PACRA: What do I do first
```

## 🔍 Troubleshooting

### Still getting "No compliance information available"

**Possible causes:**
1. Documents not fully written to Firestore yet
   - **Fix**: Wait 1-2 minutes, then try again
   - **Check**: Verify in Firestore Console

2. Query too short (< 10 characters)
   - **Fix**: Make sure query is at least 10 characters

3. Firestore query failing
   - **Check**: Look at function logs: `firebase functions:log --only api`

### Getting same response for different queries

**Cause**: Still using old mock data
- **Fix**: Clear browser cache, hard refresh (Cmd+Shift+R)
- **Verify**: Check that API function was redeployed

### Slow responses (> 30 seconds)

**Cause**: Vertex AI API calls taking time
- **Normal**: First call may be slower (cold start)
- **Check**: Function logs for timeout errors
- **Fix**: May need to increase function timeout

### CORS errors

**Cause**: Origin not in allowed list
- **Fix**: Add your domain to `ALLOWED_ORIGINS` in `services/functions/src/index.ts`
- **Redeploy**: `firebase deploy --only functions:api`

## 📊 Expected Performance

- **Intent Analysis**: 2-5 seconds
- **Firestore Query**: 1-2 seconds
- **Vector Search**: 1-2 seconds
- **Gemini Generation**: 3-8 seconds
- **Total**: 7-17 seconds (first call may be slower)

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Different queries return different answers
2. ✅ Answers are contextualized and relevant
3. ✅ Sources match the answer content
4. ✅ No "No compliance information available" errors
5. ✅ Response quality improves with more specific queries

## 🎯 Next Steps After Testing

Once everything works:
1. Test with different user tiers (free vs pro)
2. Test paywall logic (should block pro content for free users)
3. Monitor function logs for errors
4. Optimize response times if needed
5. Add more documents to corpus if needed

---

**Ready to test!** Open your app and try the queries above.

