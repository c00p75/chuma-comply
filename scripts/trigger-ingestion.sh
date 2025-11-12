#!/bin/bash
# Script to trigger document ingestion
# This will process all PDFs from the corpus bucket

set -e

echo "🔍 Finding ingestion function URL..."

# Try to get the function URL
# For Firebase Functions v2, the URL format is typically:
# https://<region>-<project-id>.cloudfunctions.net/<function-name>
# or
# https://<function-name>-<hash>-<region>.a.run.app

PROJECT_ID="chumacomply"
REGION="us-central1"
FUNCTION_NAME="ingest_document"

# Try different URL patterns
URL1="https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}"
URL2="https://${FUNCTION_NAME}-${REGION}.a.run.app"

echo ""
echo "Try these URLs (one should work):"
echo "1. $URL1"
echo "2. $URL2"
echo ""
echo "Or get it from Firebase Console:"
echo "   https://console.firebase.google.com/project/${PROJECT_ID}/functions"
echo ""

# Try to get from gcloud if available
if command -v gcloud &> /dev/null; then
    echo "Attempting to get URL from gcloud..."
    GCLOUD_URL=$(gcloud run services describe ${FUNCTION_NAME} --region=${REGION} --format="value(status.url)" 2>/dev/null || echo "")
    if [ ! -z "$GCLOUD_URL" ]; then
        echo "✅ Found URL: $GCLOUD_URL"
        INGESTION_URL="$GCLOUD_URL"
    else
        echo "⚠️  Could not auto-detect URL. Please use one of the URLs above."
        read -p "Enter the ingestion function URL: " INGESTION_URL
    fi
else
    read -p "Enter the ingestion function URL (or press Enter to use $URL1): " INGESTION_URL
    INGESTION_URL=${INGESTION_URL:-$URL1}
fi

echo ""
echo "🚀 Triggering ingestion for all PDFs in corpus..."
echo "URL: $INGESTION_URL"
echo ""

# Trigger ingestion
response=$(curl -s -w "\n%{http_code}" -X POST "$INGESTION_URL" \
  -H "Content-Type: application/json" \
  -d '{"process_all": true}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq . 2>/dev/null || echo "$body"

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 202 ]; then
    echo ""
    echo "✅ Ingestion triggered successfully!"
    echo "   Check Firebase Console for progress:"
    echo "   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data"
    echo "   Look for the 'vectorChunks' collection"
else
    echo ""
    echo "❌ Ingestion failed. Check the error above."
    exit 1
fi

