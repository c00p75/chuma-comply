#!/usr/bin/env python3
"""
Script to delete all vector chunks from Firestore.
This will clear the vectorChunks collection for re-ingestion.
"""

import os
import sys
from google.cloud import firestore
from google.auth import default

# Initialize Firestore client
db = firestore.Client()

def delete_all_chunks():
    """Delete all documents from the vectorChunks collection."""
    print("🗑️  Deleting all vector chunks from Firestore...")
    print("")
    
    chunks_ref = db.collection("vectorChunks")
    
    # Get all chunks
    chunks = chunks_ref.stream()
    
    deleted_count = 0
    batch = db.batch()
    batch_count = 0
    BATCH_SIZE = 100  # Firestore transaction limit - use smaller batches to avoid "Transaction too big" error
    
    for chunk in chunks:
        batch.delete(chunk.reference)
        batch_count += 1
        deleted_count += 1
        
        # Firestore batch limit is 500, but we use 100 to be safe
        if batch_count >= BATCH_SIZE:
            batch.commit()
            print(f"  Deleted {deleted_count} chunks so far...")
            batch = db.batch()
            batch_count = 0
    
    # Commit remaining
    if batch_count > 0:
        batch.commit()
    
    print(f"")
    print(f"✅ Successfully deleted {deleted_count} vector chunks")
    print("")
    
    # Also delete vectorDB metadata
    try:
        metadata_ref = db.collection("vectorDB").document("metadata")
        metadata_ref.delete()
        print("✅ Deleted vectorDB metadata")
    except Exception as e:
        print(f"⚠️  Could not delete metadata: {e}")
    
    print("")
    print("🎯 Ready for re-ingestion!")

if __name__ == "__main__":
    try:
        delete_all_chunks()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

