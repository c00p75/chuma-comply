# Document Ingestion Guide

## Quick Start

### Option 1: Use the Script (Recommended)
```bash
./scripts/trigger-ingestion.sh
```

The script will:
- Help you find the ingestion function URL
- Trigger ingestion for all PDFs in the corpus
- Show you the response

### Option 2: Manual Trigger

1. **Get the Function URL**:
   - Go to [Firebase Console](https://console.firebase.google.com/project/chumacomply/functions)
   - Find the `ingest_document` function
   - Copy the HTTPS trigger URL
   - Or use: `https://us-central1-chumacomply.cloudfunctions.net/ingest_document`

2. **Trigger Ingestion**:
   ```bash
   curl -X POST https://YOUR-FUNCTION-URL \
     -H "Content-Type: application/json" \
     -d '{"process_all": true}'
   ```

3. **Check Progress**:
   - Go to [Firestore Console](https://console.firebase.google.com/project/chumacomply/firestore/data)
   - Look for the `vectorChunks` collection
   - Documents should appear as they're processed

## What Happens During Ingestion

1. **Reads PDFs** from `gs://chuma-comply-corpus`
2. **Extracts text** from each PDF
3. **Chunks text** semantically (preserving legal structure)
4. **Generates metadata** (document type, industry, tier, etc.)
5. **Creates embeddings** using Vertex AI `text-embedding-005`
6. **Stores in Firestore** `vectorChunks` collection

## Verify Ingestion

After ingestion completes, check Firestore:

```bash
# Using gcloud
gcloud firestore documents list --collection-ids=vectorChunks --limit=5

# Or check in Firebase Console
# https://console.firebase.google.com/project/chumacomply/firestore/data/vectorChunks
```

You should see documents with:
- `chunkId`: Unique identifier
- `content`: Text chunk
- `embedding`: 768-dimensional vector
- `sourceDocument`: Original PDF name
- `subscriptionTier`: 'free' or 'pro'
- `documentType`: e.g., 'general', 'tax', 'employment'

## Troubleshooting

### No documents after ingestion
- Check function logs: `firebase functions:log --only ingest_document`
- Verify corpus bucket has PDFs: `gsutil ls gs://chuma-comply-corpus/`
- Check service account permissions

### Function timeout
- Large PDFs may take time
- Check function timeout settings
- Process files individually if needed

### Authentication errors
- Verify service account has permissions:
  - Firestore: Read/Write
  - Vertex AI: User
  - Cloud Storage: Object Viewer

