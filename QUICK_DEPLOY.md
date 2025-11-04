# Quick Deployment Guide

## Before You Start

1. **Update `.firebaserc`** with your Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Select your project**:
   ```bash
   firebase use your-project-id
   ```

## Deploy Everything (One Command)

```bash
./deploy.sh --all
```

Or manually:

```bash
# 1. Deploy Firestore rules and indexes
firebase deploy --only firestore

# 2. Build and deploy functions
cd services/functions && pnpm install && pnpm build && cd ../..
firebase deploy --only functions

# 3. Build and deploy web app
cd apps/web && pnpm install && pnpm build && cd ../..
firebase deploy --only hosting
```

## After Deployment

1. **Ingest your PDFs**:
   ```bash
   # Get your function URL from Firebase Console → Functions
   curl -X POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ingestDocument \
     -H "Content-Type: application/json" \
     -d '{"process_all": true}'
   ```

2. **Verify in Firestore**:
   - Check `vectorChunks` collection exists
   - Verify chunks have embeddings (768 dimensions)

3. **Test your app**:
   - Visit: `https://YOUR-PROJECT-ID.web.app`
   - Create a conversation
   - Send a message

## Troubleshooting

**Functions won't deploy?**
- Check Firebase CLI is updated: `npm install -g firebase-tools@latest`
- Verify you have billing enabled on GCP project

**Ingestion function fails?**
- Ensure Vertex AI API is enabled: `gcloud services enable aiplatform.googleapis.com`
- Check service account has Vertex AI User role

**PDFs not found?**
- PDFs must be uploaded to the function's workspace or use GCS bucket
- Update `CORPUS_PATH` environment variable if using GCS

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md).

