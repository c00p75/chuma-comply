# Chuma Comply - Ingestion Service

Python Cloud Function for processing PDF documents, chunking them semantically, generating embeddings, and storing in Firestore.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export GCP_PROJECT_ID=your-project-id
export GCP_LOCATION=us-central1
export CORPUS_PATH=/path/to/corpus
```

## Local Development

For local testing, you can create a simple script:

```python
from main import process_pdf
import os

os.environ['GCP_PROJECT_ID'] = 'your-project-id'
os.environ['GCP_LOCATION'] = 'us-central1'
os.environ['CORPUS_PATH'] = '../../corpus'

result = process_pdf('../../corpus/Companies Act, 2017.pdf', 'Companies Act, 2017.pdf')
print(result)
```

## Deployment

### Firebase Functions (Python)

Create `firebase.json` configuration:

```json
{
  "functions": [
    {
      "source": "services/ingestion",
      "runtime": "python311"
    }
  ]
}
```

Deploy:
```bash
firebase deploy --only functions:ingestDocument
```

### Manual HTTP Trigger

Once deployed, you can trigger ingestion:

```bash
curl -X POST https://YOUR-FUNCTION-URL \
  -H "Content-Type: application/json" \
  -d '{"process_all": true}'
```

Or process a specific file:

```bash
curl -X POST https://YOUR-FUNCTION-URL \
  -H "Content-Type: application/json" \
  -d '{"filename": "Companies Act, 2017.pdf"}'
```

## Architecture

1. **PDF Parsing**: Uses `unstructured.io` to extract text with layout awareness
2. **Chunking**: Semantic chunking that preserves legal document structure (Sections, Parts)
3. **Metadata Tagging**: Classifies documents by tier (free/pro) and regulatory body
4. **Embeddings**: Generates 768-dim vectors using Vertex AI `text-embedding-005`
5. **Storage**: Stores chunks with embeddings in Firestore `vectorChunks` collection

## Firestore Schema

Each document in `vectorChunks` collection:

```python
{
  "chunkId": "unique_id",
  "sourceDocument": "Companies_Act_2017.pdf",
  "documentType": "business_registration",
  "industry": "general",
  "subscriptionTier": "free",  # or "pro"
  "regulatoryBody": "PACRA",
  "topicPrimary": "Business Registration",
  "topicSecondary": "Incorporation",
  "actName": "Companies Act, 2017",
  "sectionNumber": "Section 15",
  "content": "chunk text...",
  "embedding": [0.023, -0.11, ...],  # 768 dimensions
  "embeddingDim": 768,
  "pageNumber": 12,
  "chunkIndex": 34,
  "startChar": 1700,
  "endChar": 2212,
  "createdAt": timestamp
}
```

