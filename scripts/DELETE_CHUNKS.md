# Delete Vector Chunks from Firestore

## Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/project/chumacomply/firestore/data)
2. Navigate to the `vectorChunks` collection
3. Select all documents (or use the "Delete collection" option if available)
4. Confirm deletion

## Option 2: Using Python Script (Requires Authentication)

```bash
# Authenticate first
gcloud auth application-default login

# Run the deletion script
cd /Users/yxzuji/Desktop/Projects/hytel/chumacomply
python3 scripts/delete-vector-chunks.py
```

## Option 3: Using gcloud CLI

```bash
# List all chunk IDs
gcloud firestore documents list \
  --collection-ids=vectorChunks \
  --project=chumacomply \
  --format="value(name)" | \
  sed 's|.*/documents/vectorChunks/||' > chunk_ids.txt

# Delete each chunk (this may take a while for large collections)
while read doc_id; do
  gcloud firestore documents delete \
    "projects/chumacomply/databases/(default)/documents/vectorChunks/$doc_id" \
    --project=chumacomply \
    --quiet
done < chunk_ids.txt
```

## Option 4: Using Node.js (from functions directory)

```bash
cd services/functions
node ../scripts/delete-chunks-firebase-admin.js
```

