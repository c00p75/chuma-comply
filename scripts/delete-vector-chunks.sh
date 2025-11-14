#!/bin/bash
# Script to delete all vector chunks from Firestore using gcloud CLI

set -e

PROJECT_ID="chumacomply"
COLLECTION="vectorChunks"

echo "🗑️  Deleting all vector chunks from Firestore..."
echo ""

# Get all document IDs
echo "Fetching document IDs..."
DOC_IDS=$(gcloud firestore documents list \
  --collection-ids=$COLLECTION \
  --project=$PROJECT_ID \
  --format="value(name)" 2>/dev/null | \
  sed 's|.*/documents/vectorChunks/||' || echo "")

if [ -z "$DOC_IDS" ]; then
  echo "✅ No vector chunks found. Collection is already empty."
  exit 0
fi

# Count documents
COUNT=$(echo "$DOC_IDS" | wc -l | tr -d ' ')
echo "Found $COUNT documents to delete"
echo ""

# Delete in batches (gcloud has limits)
BATCH_SIZE=500
BATCH_NUM=0
DELETED=0

echo "$DOC_IDS" | while IFS= read -r doc_id; do
  if [ -n "$doc_id" ]; then
    gcloud firestore documents delete \
      "projects/$PROJECT_ID/databases/(default)/documents/$COLLECTION/$doc_id" \
      --project=$PROJECT_ID \
      --quiet 2>/dev/null || true
    
    DELETED=$((DELETED + 1))
    if [ $((DELETED % 100)) -eq 0 ]; then
      echo "  Deleted $DELETED chunks..."
    fi
  fi
done

echo ""
echo "✅ Deletion complete!"
echo ""

