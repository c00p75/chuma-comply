# Deployment Instructions for Chuma Comply

## Step 1: Create Environment File

Create `apps/web/.env.local` with your Firebase configuration:

```bash
cd apps/web
cat > .env.local << 'EOF'
VITE_FIREBASE_CONFIG={"apiKey":"YOUR_FIREBASE_API_KEY_HERE","authDomain":"chumacomply.firebaseapp.com","projectId":"chumacomply","storageBucket":"chumacomply.firebasestorage.app","messagingSenderId":"679862482069","appId":"1:679862482069:web:04fc93e975d2cccff4179c","measurementId":"G-3RR1F86W7G"}
VITE_API_BASE_URL=https://us-central1-chumacomply.cloudfunctions.net/api
EOF
cd ../..
```

## Step 2: Login to Firebase

```bash
firebase login
```

## Step 3: Set Your Project

```bash
firebase use chumacomply
```

## Step 4: Enable Required APIs

Make sure these Google Cloud APIs are enabled:

```bash
gcloud services enable \
  aiplatform.googleapis.com \
  cloudfunctions.googleapis.com \
  firebase.googleapis.com \
  firestore.googleapis.com
```

## Step 4.5: Grant Cloud Build Permissions

Firebase Functions v2 requires Cloud Build to have Artifact Registry Writer permissions:

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

## Step 5: Deploy Everything

### Option A: Use the deployment script (recommended)

```bash
./deploy.sh --all
```

### Option B: Deploy manually

```bash
# 1. Deploy Firestore rules and indexes
firebase deploy --only firestore

# 2. Build and deploy TypeScript functions
cd services/functions
pnpm install
pnpm build
cd ../..

# Deploy functions
firebase deploy --only functions

# 3. Build and deploy web app
cd apps/web
pnpm install
pnpm build
cd ../..

# Deploy hosting
firebase deploy --only hosting
```

## Step 6: Update API URL (after functions deploy)

After deploying functions, update `apps/web/.env.local` with the actual API URL:

1. Check your function URL in Firebase Console → Functions
2. Update `VITE_API_BASE_URL` in `apps/web/.env.local`
3. Rebuild and redeploy hosting:
   ```bash
   cd apps/web
   pnpm build
   cd ../..
   firebase deploy --only hosting
   ```

## Step 7: Ingest PDFs (Optional)

After deployment, ingest your PDF corpus:

```bash
# Get your function URL from Firebase Console → Functions → ingestDocument
curl -X POST https://us-central1-chumacomply.cloudfunctions.net/ingestDocument \
  -H "Content-Type: application/json" \
  -d '{"process_all": true}'
```

**Note**: For production, you should upload PDFs to a GCS bucket first, then update the ingestion function to read from there.

## Verify Deployment

1. **Visit your app**: https://chumacomply.web.app
2. **Check Firestore**: Verify `vectorChunks` collection exists (after ingestion)
3. **Test chat**: Create a conversation and send a message

## Troubleshooting

**Functions won't build?**
- Ensure Node.js 20+ is installed
- Run `pnpm install` in `services/functions`

**Python function fails to deploy?**
- Check Python 3.11 is available
- Verify `requirements.txt` has all dependencies

**Can't access Firestore?**
- Check Firestore rules are deployed
- Verify indexes are built (check Firebase Console)

