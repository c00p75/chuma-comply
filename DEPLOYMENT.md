# Deployment Guide

This guide covers deploying all components of the Chuma Comply application to Firebase and Google Cloud.

## Prerequisites

1. **Firebase CLI** installed:
   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticated with Firebase and GCP**:
   ```bash
   firebase login
   gcloud auth login
   ```

3. **Set your Firebase project**:
   ```bash
   # Update .firebaserc with your project ID
   firebase use YOUR_PROJECT_ID
   ```

## Step 0: Configure Cloud Build Permissions

Before deploying functions, ensure Cloud Build has the necessary permissions to write to Artifact Registry. This is required for Firebase Functions v2 (2nd Gen) deployments.

1. **Get your project number**:
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
   echo "Project Number: $PROJECT_NUMBER"
   ```

2. **Grant Artifact Registry Writer role to Cloud Build service account**:
   ```bash
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"
   ```

**Note**: If you see permission errors during deployment (e.g., "Permission artifactregistry.repositories.uploadArtifacts denied"), this step was likely skipped.

## Step 1: Configure Project

1. **Update `.firebaserc`**:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

2. **Set Environment Variables**:
   
   For the ingestion function, set these via Firebase Console or CLI:
   ```bash
   firebase functions:config:set \
     ingestion.gcp_project_id="your-project-id" \
     ingestion.gcp_location="us-central1" \
     ingestion.corpus_path="/workspace/corpus"
   ```
   
   Or update the ingestion function to use Firebase Functions environment variables:
   ```bash
   # Using Firebase Functions config v2
   firebase functions:config:get
   ```

## Step 2: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore
```

This deploys:
- `firestore.rules` - Security rules for conversations, messages, and vectorChunks
- `firestore.indexes.json` - Composite index for conversations query

**Important**: After deploying indexes, wait for them to build (check Firebase Console → Firestore → Indexes).

## Step 3: Build TypeScript Functions

Build the tRPC API functions:

```bash
cd services/functions
pnpm install
pnpm build
cd ../..
```

## Step 4: Deploy Functions

### Deploy all functions:
```bash
firebase deploy --only functions
```

### Deploy specific functions:
```bash
# Deploy tRPC API only
firebase deploy --only functions:api

# Deploy ingestion function only
firebase deploy --only functions:ingestDocument
```

## Step 5: Build and Deploy Web App

1. **Build the web app**:
   ```bash
   cd apps/web
   pnpm install
   pnpm build
   cd ../..
   ```

2. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

## Step 6: Set Up GCS Bucket for Corpus (Optional)

If you plan to upload PDFs via GCS for ingestion:

```bash
# Create bucket
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://chuma-comply-corpus

# Set uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://chuma-comply-corpus

# Upload PDFs
gsutil cp corpus/*.pdf gs://chuma-comply-corpus/
```

Update the ingestion function's `CORPUS_PATH` environment variable to point to the GCS bucket if needed.

## Step 7: Verify Deployment

### 1. Test Firestore Rules
- Try creating a conversation in the app
- Verify you can only access your own conversations

### 2. Test tRPC API
```bash
# Get the function URL
firebase functions:config:get

# Test the endpoint (example)
curl https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/api/trpc/health
```

### 3. Test Ingestion Function
```bash
# Trigger ingestion for a single file
curl -X POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ingestDocument \
  -H "Content-Type: application/json" \
  -d '{"filename": "Companies Act, 2017.pdf"}'

# Or process all PDFs
curl -X POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ingestDocument \
  -H "Content-Type: application/json" \
  -d '{"process_all": true}'
```

### 4. Verify Vector Chunks in Firestore
- Go to Firebase Console → Firestore
- Check `vectorChunks` collection
- Verify documents have `embedding` arrays (768 dimensions)

## Troubleshooting

### Cloud Build Permission Errors

If you see errors like:
```
DENIED: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/PROJECT_ID/locations/REGION/repositories/gcf-artifacts"
```

**Solution**: Grant the Artifact Registry Writer role to Cloud Build:
```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

This is required because Firebase Functions v2 uses Artifact Registry to store build artifacts and container images during the deployment process.

### Ingestion Function Issues

1. **Missing dependencies**: The function needs all Python packages. Ensure `requirements.txt` is correct.

2. **PDFs not found**: If using local corpus, ensure files are uploaded with the function or use GCS bucket.

3. **Embedding generation fails**: Check Vertex AI API is enabled and service account has permissions:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

### Firestore Index Build Time

Composite indexes can take several minutes to build. Check status in Firebase Console.

### CORS Issues

If you see CORS errors, ensure your web app URL is in the allowed origins in `services/functions/src/index.ts`.

## Deployment Checklist

- [ ] Updated `.firebaserc` with correct project ID
- [ ] Set environment variables for ingestion function
- [ ] Deployed Firestore rules and indexes
- [ ] Built TypeScript functions
- [ ] Deployed all functions
- [ ] Built web app
- [ ] Deployed hosting
- [ ] Tested ingestion function
- [ ] Verified vectorChunks in Firestore
- [ ] Tested chat storage (conversations/messages)

## Next Steps

After deployment:

1. **Ingest your corpus PDFs**:
   - Call the ingestion function with `{"process_all": true}`
   - Monitor Cloud Logging for progress

2. **Set up monitoring**:
   - Enable Firebase Performance Monitoring
   - Set up alerts for function errors

3. **Configure custom domain** (optional):
   ```bash
   firebase hosting:channel:deploy preview --only hosting
   ```

