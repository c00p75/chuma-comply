# **Vertex AI RAG Notes (Reference Architecture)**

## **1\. Goals and Outcomes**

* Build a RAG app grounded in a PDF corpus.  
* Use Vertex AI (Gemini 2.5 Pro, embeddings, Vector Search/RAG Store) with a Cloud Run API.  
* Store documents in Cloud Storage; host frontend on Firebase Hosting.  
* RAG process: store vector chunks and a vector database representation in Firestore.

## **2\. Prerequisites**

* Google Cloud project with billing enabled (example: your-project-id)  
* Tools installed:  
    \- gcloud CLI: https://cloud.google.com/sdk/docs/install  
    \- Firebase CLI: https://firebase.google.com/docs/cli  
    \- Docker: https://docs.docker.com/get-docker/  
    \- Node.js 18+, PNPM 8+  
* Access/roles to create resources and bind IAM

Quick checks:

\# Set/confirm project  
gcloud config set project your-project-id  
gcloud config get-value project

\# Enable required APIs  
gcloud services enable \\  
  aiplatform.googleapis.com \\  
  run.googleapis.com \\  
  storage.googleapis.com \\  
  cloudbuild.googleapis.com \\  
  artifactregistry.googleapis.com \\  
  firebase.googleapis.com

\# Verify enabled services  
gcloud services list \--enabled

## **3\. Google Cloud Services Used**

* Vertex AI: Gemini 2.5 Pro (generation), text/multimodal embeddings, Vector Search / RAG Store  
* Cloud Storage: PDF corpus bucket (e.g., gs://your-corpus-bucket)  
* Cloud Run: Backend API (e.g., rag-api)  
* Artifact Registry \+ Cloud Build: Container images & builds  
* Firebase: Hosting (chat/admin/landing), Auth, Firestore, Storage  
* IAM \+ Cloud Logging/Monitoring

Helpful inventory commands:

\# Cloud Run services  
gcloud run services list \--region=us-central1

\# Buckets  
gcloud storage buckets list

\# Vertex AI resources  
gcloud ai indexes list \--location=us-central1  
gcloud ai index-endpoints list \--location=us-central1

## **4\. Service Accounts and IAM (Recommended)**

Create scoped service accounts with least privilege.

Example service accounts:

* API (Cloud Run): rag-api-sa@your-project-id.iam.gserviceaccount.com  
    \- roles: Vertex AI User, Storage Object Viewer (corpus bucket), Logging Writer, Cloud Run Invoker/Developer, Artifact Registry Reader (or Writer for builds)  
* Ingestion (Cloud Functions/Jobs): rag-ingestion-sa@your-project-id.iam.gserviceaccount.com  
    \- roles: Vertex AI User, Storage Object Admin (corpus \+ uploads bucket), Logging Writer

Commands:

\# Create service accounts  
gcloud iam service-accounts create rag-api-sa \\  
  \--display-name="RAG API Service"

gcloud iam service-accounts create rag-ingestion-sa \\  
  \--display-name="RAG Ingestion"

\# Grant roles (project-level)  
PROJECT\_ID=$(gcloud config get-value project)  
for ROLE in roles/aiplatform.user roles/logging.logWriter roles/run.developer; do  
  gcloud projects add-iam-policy-binding "$PROJECT\_ID" \\  
    \--member="serviceAccount:rag-api-sa@$PROJECT\_ID.iam.gserviceaccount.com" \\  
    \--role="$ROLE"  
done

\# Artifact Registry (if building/pulling images)  
for ROLE in roles/artifactregistry.reader; do  
  gcloud projects add-iam-policy-binding "$PROJECT\_ID" \\  
    \--member="serviceAccount:rag-api-sa@$PROJECT\_ID.iam.gserviceaccount.com" \\  
    \--role="$ROLE"  
done

\# Bucket-level (corpus viewer for API)  
gcloud storage buckets add-iam-policy-binding gs://your-corpus-bucket \\  
  \--member="serviceAccount:rag-api-sa@$PROJECT\_ID.iam.gserviceaccount.com" \\  
  \--role="roles/storage.objectViewer"

\# Ingestion SA roles (project-level)  
for ROLE in roles/aiplatform.user roles/logging.logWriter roles/storage.objectAdmin; do  
  gcloud projects add-iam-policy-binding "$PROJECT\_ID" \\  
    \--member="serviceAccount:rag-ingestion-sa@$PROJECT\_ID.iam.gserviceaccount.com" \\  
    \--role="$ROLE"  
done

Cost controls:

\# Budget/alert (example — customize amount and notifications)  
gcloud billing budgets create \--billing-account=XXXXXX-XXXXXX-XXXXXX \\  
  \--display-name="RAG Project Budget" \--amount-units=100.00

## **5\. Data Sources and Corpus (Storage)**

* Authoritative corpus bucket: gs://your-corpus-bucket  
* Admin uploads may land in Firebase Storage, then move to the corpus bucket.

Create bucket:

gcloud storage buckets create gs://your-corpus-bucket \\  
  \--location=US \--uniform-bucket-level-access

## **6\. Ingestion → Chunking → Embedding → Indexing**

This is the core RAG pipeline.

### **6.1 Ingestion**

* Trigger: Admin uploads PDF  
* Flow:  
    1\) Move file to corpus bucket (your-corpus-bucket)  
    2\) Extract text (and optionally images)  
    3\) Chunk text  
    4\) Generate embeddings per chunk  
    5\) Upsert chunks to vector store (Vertex AI Vector Search or Firestore vector collections)

Optional automation: Cloud Function triggered by Storage finalize events.

### **6.2 Chunking**

* Recommended: 512 characters per chunk, 50-character overlap  
* Metadata: documentId, source, pageNumber, chunkIndex, startChar, endChar

Example (TypeScript pseudocode):

function chunkText(content: string, size \= 512, overlap \= 50\) {  
  const chunks: { content: string; index: number; start: number; end: number }\[\] \= \[\];  
  let i \= 0, start \= 0;  
  while (start \< content.length) {  
    const end \= Math.min(content.length, start \+ size);  
    chunks.push({ content: content.slice(start, end), index: i++, start, end });  
    start \= end \- overlap;  
    if (start \< 0\) start \= 0;  
  }  
  return chunks;  
}

### **6.3 Embedding**

* Text embedding model: text-embedding-005 (recommended for text-only)  
* Multimodal embedding: multimodalembedding@001 (image+text, 1408 dims)

Node.js (PredictionServiceClient) example for multimodal embeddings:

import { PredictionServiceClient } from '@google-cloud/aiplatform';

const client \= new PredictionServiceClient();  
const endpoint \= \`projects/${PROJECT\_ID}/locations/${LOCATION}/publishers/google/models/multimodalembedding@001:predict\`;

const \[response\] \= await client.predict({  
  endpoint,  
  // Each instance is { image: { bytesBase64Encoded }, text }  
  instances: \[{ image: { bytesBase64Encoded: imageBase64 }, text }\],  
});  
const predictions \= (response as any).predictions as Array\<{ multimodalEmbedding?: number\[\]; imageEmbedding?: number\[\]; textEmbedding?: number\[\] }\>;  
const embedding \= predictions?.\[0\]?.multimodalEmbedding || predictions?.\[0\]?.imageEmbedding || predictions?.\[0\]?.textEmbedding;

Curl alternative (publisher model):

ACCESS\_TOKEN=$(gcloud auth print-access-token)  
PREDICT\_URL="\[https://us-central1-aiplatform.googleapis.com/v1/projects/$\](https://us-central1-aiplatform.googleapis.com/v1/projects/$){PROJECT\_ID}/locations/us-central1/publishers/google/models/multimodalembedding@001:predict"

curl \-s \-H "Authorization: Bearer $ACCESS\_TOKEN" \-H "Content-Type: application/json" \\  
  "$PREDICT\_URL" \\  
  \-d "{ \\"instances\\": \[{ \\"image\\": { \\"bytesBase64Encoded\\": \\"$IMAGE\_BASE64\\" }, \\"text\\": \\"$QUERY\\" }\] }"

### **6.4 Indexing Options**

You have two recommended paths:

A) Vertex AI Vector Search / RAG Store (Production-grade)

* Create index & endpoint, deploy index, upsert embeddings  
* Pros: Scalable, fast ANN search, managed infra  
* Cons: Hosting cost while deployed

B) Firestore Vector Storage (New projects baseline)

* Store embeddings in Firestore collections and perform similarity search in the API service (Cloud Run) by loading candidate vectors and computing cosine similarity server-side.  
* Pros: Lower infra overhead, centralized data, simpler ops  
* Cons: Not suitable for very large corpora without additional indexing strategies (e.g., in-memory ANN index in the API, partitioning/sharding, or Bloom/LSH prefilters)

Vertex AI Vector Search (high-level CLI):

\# Create index (example)  
gcloud ai indexes create \\  
  \--display-name="rag-index" \\  
  \--metadata-file=metadata.json \\  
  \--location=us-central1

\# Create index endpoint and deploy index  
gcloud ai index-endpoints create \--display-name="rag-endpoint" \--location=us-central1  
INDEX\_ENDPOINT\_ID=$(gcloud ai index-endpoints list \--location=us-central1 \--format="value(name)" | sed \-n '1p')  
INDEX\_ID=$(gcloud ai indexes list \--location=us-central1 \--format="value(name)" | sed \-n '1p')

gcloud ai index-endpoints deploy-index "$INDEX\_ENDPOINT\_ID" \\  
  \--deployed-index-id=rag\_deployed \\  
  \--index="$INDEX\_ID" \\  
  \--location=us-central1

## **7\. Retrieval (Query-Time Flow)**

1. Accept query (text or image+text)  
2. Generate query embedding (text-only or multimodal)  
3. Search vector store (Vertex AI or Firestore-based)  
4. Build grounding context from top-k chunks (include \[n\], source, snippets)  
5. Generate answer via Gemini 2.5 Pro with retrieval tool/RAG grounding  
6. Extract citations from grounding metadata or parsed text

Gemini (RAG-enabled) request pattern:

const request \= {  
  contents: \[{  
    role: 'user',  
    parts: \[ { text: prompt }, imagePart /\* optional \*/ \],  
  }\],  
  systemInstruction: { role: 'system', parts: \[{ text: systemPrompt }\] },  
  tools: \[{  
    retrieval: {  
      vertexRagStore: {  
        ragResources: \[{ ragCorpus: \`projects/${PROJECT\_ID}/locations/${LOCATION}/ragCorpora/${CORPUS\_ID}\` }\],  
      },  
    },  
  }\],  
  generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },  
};

## **8\. Cloud Run API (Backend) Essentials**

Deploy with cost-friendly scaling:

\# Option A: Using Artifact Registry (recommended)  
REGION=us-central1  
REPO=rag-repo  
SERVICE=rag-api  
IMAGE=us-central1-docker.pkg.dev/${PROJECT\_ID}/${REPO}/api:latest

\# Create repository once (if not exists)  
gcloud artifacts repositories create ${REPO} \\  
  \--repository-format=docker \\  
  \--location=${REGION}

\# Build & push  
gcloud auth configure-docker ${REGION}-docker.pkg.dev  
docker build \-t ${IMAGE} ./services/api  
docker push ${IMAGE}

\# Deploy to Cloud Run  
gcloud run deploy ${SERVICE} \\  
  \--image ${IMAGE} \\  
  \--region ${REGION} \\  
  \--allow-unauthenticated \\  
  \--port 3001 \\  
  \--memory 2Gi \\  
  \--cpu 1 \\  
  \--max-instances 10 \\  
  \--min-instances 0 \\  
  \--timeout 300 \\  
  \--concurrency 100

\# Option B: Using Container Registry (legacy)  
gcloud run deploy rag-api \\  
  \--image gcr.io/${PROJECT\_ID}/rag-api \\  
  \--platform managed \\  
  \--region us-central1 \\  
  \--allow-unauthenticated \\  
  \--port 3001 \\  
  \--memory 2Gi \\  
  \--cpu 1 \\  
  \--max-instances 10 \\  
  \--min-instances 0 \\  
  \--timeout 300 \\  
  \--concurrency 100

Verify:

gcloud run services describe rag-api \--region=us-central1 \--format="value(status.url)"

## **9\. Firestore Vector Schema (New Projects Standard)**

Collections:

* users: user profile/roles  
* conversations: per-user conversation headers  
* messages: child collection (or top-level with conversationId)  
* vectorChunks: vectorized text chunks  
* vectorDB: metadata/stats/config about the vector store

Example documents:

// vectorChunks/{chunkId}  
{  
  "documentId": "doc\_123",  
  "source": "zari-maize-manual.pdf",  
  "pageNumber": 12,  
  "chunkIndex": 34,  
  "startChar": 1700,  
  "endChar": 2212,  
  "content": "Leaf blight appears as...",  
  "embedding": \[0.023, \-0.11, ...\],  
  "embeddingDim": 768,  
  "createdAt": 1735588888000  
}

// vectorDB/{id}  
{  
  "version": 1,  
  "embeddingModel": "text-embedding-005",  
  "dimensions": 768,  
  "documents": 124,  
  "chunks": 3821,  
  "updatedAt": 1735588888000  
}

Security rules (illustrative):

// Allow users to read public chunks for grounding (or restrict via API-only access)  
match /databases/{database}/documents {  
  match /vectorChunks/{chunkId} {  
    allow read: if request.auth \!= null; // tighten as needed  
    allow write: if false; // writes only via backend pipeline  
  }  
  match /vectorDB/{id} {  
    allow read: if request.auth \!= null;  
    allow write: if false;  
  }  
}

Server-side search (Cloud Run):

* Load a candidate subset (by source, pageNumber, or precomputed partition key)  
* Compute cosine similarity in memory  
* Return top-k chunks to the model as grounding context

Cosine similarity:

function cosineSimilarity(a: number\[\], b: number\[\]) {  
  let dot \= 0, na \= 0, nb \= 0;  
  for (let i \= 0; i \< a.length; i++) { dot \+= a\[i\]\*b\[i\]; na \+= a\[i\]\*a\[i\]; nb \+= b\[i\]\*b\[i\]; }  
  return (na && nb) ? dot / (Math.sqrt(na) \* Math.sqrt(nb)) : 0;  
}

### **9.1 Application Firestore Rules (core app data)**

rules\_version \= '2';  
service cloud.firestore {  
  match /databases/{database}/documents {  
    match /conversations/{conversationId} {  
      allow read, write: if request.auth \!= null &&  
        request.auth.uid \== resource.data.userId;  
    }  
    match /conversations/{conversationId}/messages/{messageId} {  
      allow read, write: if request.auth \!= null &&  
        get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId \== request.auth.uid;  
    }  
    match /users/{userId} {  
      allow read: if request.auth \!= null && request.auth.uid \== userId;  
      allow write: if request.auth \!= null && request.auth.uid \== userId && resource.data.role \== "user";  
Such as:     }  
    match /admin/{document=\*\*} {  
      allow read, write: if request.auth \!= null &&  
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role \== "admin";  
    }  
  }  
}

### **9.2 Firestore Indexes (example)**

{  
  "indexes": \[  
    {  
      "collectionGroup": "conversations",  
      "queryScope": "COLLECTION",  
      "fields": \[  
        { "fieldPath": "userId", "order": "ASCENDING" },  
        { "fieldPath": "createdAt", "order": "DESCENDING" }  
      \]  
    }  
  \]  
}

### **9.3 Firebase Storage Rules (uploads)**

rules\_version \= '2';  
service firebase.storage {  
  match /b/{bucket}/o {  
    match /admin/uploads/{allPaths=\*\*} {  
      allow read, write: if request.auth \!= null &&  
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role \== "admin";  
    }  
    match /public/{allPaths=\*\*} {  
      allow read: if true;  
    }  
  }  
}

## **10\. Cost Management Best Practices**

* Set Cloud Run \--min-instances 0  
* Undeploy Vector Search indexes outside heavy usage windows  
* Cache embeddings (hash content; skip if unchanged)  
* Batch embedding/indexing jobs  
* Keep prompts concise (token costs)  
* Set budgets and alerts; review billing by service/SKU regularly

Helpful billing guidance:

\# Use Billing \> Reports in console and group by Service and SKU  
\# Optionally export billing data to BigQuery for deep analysis

## **11\. End-to-End Checklist**

* \[ \] Project configured; APIs enabled; budgets set  
* \[ \] Service accounts created; IAM roles bound  
* \[ \] Buckets created; upload/ingestion path defined  
* \[ \] Chunking \+ embedding pipeline implemented  
* \[ \] Vector store selected: Vertex AI Vector Search or Firestore vector collections  
* \[ \] Cloud Run API deployed with env vars  
* \[ \] Frontends deployed to Firebase Hosting  
* \[ \] RAG responses grounded with citations  
* \[ \] Monitoring/logging in place; costs reviewed

## **12\. Deployment & Operations Essentials**

### **12.1 Frontend Deployment (Firebase Hosting)**

pnpm build:web  
firebase deploy \--only hosting:chat,hosting:admin,hosting:landing

### **12.2 Cloud Functions Deployment (PDF ingestion)**

cd functions  
npm install  
firebase deploy \--only functions

Note: If functions live outside functions/, adjust the deployment process accordingly or use Google Cloud Functions via gcloud.

### **12.3 Authentication Setup (Google OAuth)**

* In Firebase Console \> Authentication \> Sign-in method  
    \- Enable Google as a sign-in provider  
    \- Add authorized domains (e.g., your-hosting-domain.web.app)

### **12.4 Testing and Verification**

* Chat: ask a question, verify answers and citations  
* Admin: upload a PDF, verify it lands in your-corpus-bucket  
* Chat history: authenticate, create conversation, re-login, verify persistence  
* API: test via Postman/curl (health endpoints, RAG procedures)

### **12.5 Monitoring and Logging**

* Cloud Run: logs, error alerts, latency SLOs  
* Firebase: Crashlytics for frontend errors  
* Vertex AI: export request logs to BigQuery for analytics (optional)

### **12.6 Addressing Common Deployment Challenges**

* ES Module/CommonJS conflicts: prefer Node 18, set "type": "module" in package.json when using ESM, avoid mixing CJS/ESM in the same service, and ensure Docker uses Node 18 base images.  
* Dependency resolution: use PNPM workspaces, avoid circular dependencies in shared packages, and pin critical versions to reduce drift.  
* Inconsistent environments: use typesafe env validation (e.g., T3 Env \+ Zod), keep .env.example updated, separate .env.production, and set Cloud Run env vars explicitly per environment.  
* Over-engineered packages: minimize shared packages; keep interfaces small and decoupled between frontends and backend.

### **12.7 Best Practices**

* Use a staging environment before production.  
* Back up Firestore before major changes.  
* Track costs (Vertex AI, Cloud Storage, Firestore) and set budget alerts.  
* Automate CI/CD with GitHub Actions and consider Changesets for versioning.

## **13\. Reference Configuration Template (fill for your project)**

* Project: \<YOUR\_PROJECT\_ID\>  
* Region: us-central1  
* Vertex model: gemini-2.5-pro  
* Embedding models: text-embedding-005 (text), multimodalembedding@001 (multimodal)  
* Corpus bucket: gs://your-corpus-bucket  
* RAG corpus ID: \<YOUR\_RAG\_CORPUS\_ID\> (if using Vertex RAG Store)  
* Vector Search index/endpoint: \<YOUR\_INDEX\_ID\> / \<YOUR\_ENDPOINT\_ID\> (if using Vector Search)  
* Cloud Run service: rag-api (recommended \--min-instances 0\)

## **14\. References**

* Firebase Firestore Documentation: https://firebase.google.com/docs/firestore  
* Vertex AI RAG Engine Documentation: https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine  
* Google Cloud Deployment Best Practices: https://cloud.google.com/architecture/best-practices