"""
Chuma Comply - PDF Ingestion Cloud Function
Processes PDF documents from corpus, chunks them, generates embeddings, and stores in Firestore.
"""

import os
import json
import logging
import tempfile
import shutil
from typing import List, Dict, Any
from datetime import datetime

from google.cloud import firestore
from google.cloud import storage

from pdf_parser import extract_text_from_pdf, clean_text
from chunking import semantic_chunk
from metadata import generate_metadata, classify_document
from embeddings import batch_generate_embeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients
db = firestore.Client()

# Environment variables
# Firebase Functions automatically sets GCLOUD_PROJECT
PROJECT_ID = os.getenv("GCLOUD_PROJECT") or os.getenv("GCP_PROJECT_ID")
if not PROJECT_ID:
    # Try to get from Firestore client
    try:
        PROJECT_ID = db.project
    except:
        PROJECT_ID = "chumacomply"  # Fallback to project ID
        logger.warning(f"PROJECT_ID not set, using fallback: {PROJECT_ID}")

LOCATION = os.getenv("GCP_LOCATION", "us-central1")
CORPUS_PATH = os.getenv("CORPUS_PATH", "/workspace/corpus")

# Initialize Storage client
storage_client = storage.Client(project=PROJECT_ID)

logger.info(f"Initialized with PROJECT_ID: {PROJECT_ID}, LOCATION: {LOCATION}, CORPUS_PATH: {CORPUS_PATH}")


def get_pdfs_from_gcs(bucket_name: str) -> List[str]:
    """
    List all PDF files in a GCS bucket.
    
    Args:
        bucket_name: GCS bucket name (without gs:// prefix)
        
    Returns:
        List of PDF filenames
    """
    try:
        bucket = storage_client.bucket(bucket_name)
        blobs = bucket.list_blobs()
        pdf_files = [blob.name for blob in blobs if blob.name.endswith('.pdf')]
        logger.info(f"Found {len(pdf_files)} PDF files in gs://{bucket_name}")
        return pdf_files
    except Exception as e:
        logger.error(f"Error listing PDFs from GCS bucket {bucket_name}: {str(e)}")
        raise


def download_from_gcs(bucket_name: str, blob_name: str, local_path: str) -> str:
    """
    Download a file from GCS to local path.
    
    Args:
        bucket_name: GCS bucket name
        blob_name: Name of the blob in the bucket
        local_path: Local file path to save to
        
    Returns:
        Local file path
    """
    try:
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.download_to_filename(local_path)
        logger.info(f"Downloaded gs://{bucket_name}/{blob_name} to {local_path}")
        return local_path
    except Exception as e:
        logger.error(f"Error downloading gs://{bucket_name}/{blob_name}: {str(e)}")
        raise


def process_pdf(pdf_path: str, filename: str) -> Dict[str, Any]:
    """
    Process a single PDF: extract, chunk, tag, embed, and store.
    
    Args:
        pdf_path: Full path to PDF file
        filename: Original filename for metadata
        
    Returns:
        Dictionary with processing results
    """
    try:
        logger.info(f"Processing {filename}...")
        
        # Step 1: Extract text
        raw_text = extract_text_from_pdf(pdf_path)
        cleaned_text = clean_text(raw_text)
        
        if not cleaned_text:
            raise ValueError(f"No text extracted from {filename}")
        
        # Step 2: Classify document for subscription tier
        doc_classification = classify_document(filename)
        
        # Step 3: Chunk text semantically
        chunks = semantic_chunk(cleaned_text, filename)
        logger.info(f"Generated {len(chunks)} chunks from {filename}")
        
        # Step 4: Generate metadata for each chunk
        chunks_with_metadata = []
        for chunk in chunks:
            metadata = generate_metadata(
                chunk=chunk,
                filename=filename,
                doc_classification=doc_classification
            )
            chunks_with_metadata.append({
                **chunk,
                **metadata
            })
        
        # Step 5: Generate embeddings (batch for efficiency)
        chunk_texts = [chunk["content"] for chunk in chunks_with_metadata]
        embeddings = batch_generate_embeddings(
            chunk_texts,
            project_id=PROJECT_ID,
            location=LOCATION
        )
        
        if len(embeddings) != len(chunks_with_metadata):
            raise ValueError(f"Embedding count mismatch: {len(embeddings)} vs {len(chunks_with_metadata)}")
        
        # Step 6: Store in Firestore
        batch = db.batch()
        stored_count = 0
        
        for i, chunk_data in enumerate(chunks_with_metadata):
            # Create Firestore-safe chunk ID
            safe_name = filename.replace('.pdf', '').replace(' ', '_').replace(',', '').replace('/', '_')
            chunk_id = f"{safe_name}_chunk_{i}"
            
            # Check if chunk already exists
            chunk_ref = db.collection("vectorChunks").document(chunk_id)
            if chunk_ref.get().exists:
                logger.debug(f"Chunk {chunk_id} already exists, skipping")
                continue
            
            # Prepare document
            doc_data = {
                "chunkId": chunk_id,
                "sourceDocument": filename,
                "documentType": chunk_data["documentType"],
                "industry": chunk_data["industry"],
                "subscriptionTier": chunk_data["subscriptionTier"],
                "regulatoryBody": chunk_data["regulatoryBody"],
                "topicPrimary": chunk_data["topicPrimary"],
                "topicSecondary": chunk_data.get("topicSecondary", ""),
                "actName": chunk_data.get("actName", ""),
                "sectionNumber": chunk_data.get("sectionNumber", ""),
                "content": chunk_data["content"],
                "embedding": embeddings[i],
                "embeddingDim": 768,
                "pageNumber": chunk_data.get("pageNumber", 0),
                "chunkIndex": chunk_data["chunkIndex"],
                "startChar": chunk_data["startChar"],
                "endChar": chunk_data["endChar"],
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
            
            batch.set(chunk_ref, doc_data)
            stored_count += 1
            
            # Firestore batch limit is 500
            if stored_count % 500 == 0:
                batch.commit()
                batch = db.batch()
                logger.info(f"Committed batch of 500 chunks for {filename}")
        
        # Commit remaining
        if stored_count % 500 != 0:
            batch.commit()
        
        logger.info(f"Successfully stored {stored_count} chunks from {filename}")
        
        return {
            "success": True,
            "filename": filename,
            "chunks_created": stored_count,
            "total_chunks": len(chunks_with_metadata),
        }
        
    except Exception as e:
        logger.error(f"Error processing {filename}: {str(e)}", exc_info=True)
        return {
            "success": False,
            "filename": filename,
            "error": str(e),
        }


def ingest_document(request):
    """
    HTTP Cloud Function entry point for document ingestion.
    Compatible with Firebase Functions Python runtime.
    
    Expected request JSON:
    {
        "filename": "Companies Act, 2017.pdf",  # Optional: specific file
        "process_all": true  # Optional: process all PDFs in corpus
    }
    """
    from flask import jsonify
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)
    
    try:
        request_json = request.get_json(silent=True) or {}
        
        # Determine if CORPUS_PATH is a GCS bucket
        is_gcs = CORPUS_PATH.startswith("gs://")
        bucket_name = None
        if is_gcs:
            # Extract bucket name from gs://bucket-name/path format
            path_parts = CORPUS_PATH.replace("gs://", "").split("/", 1)
            bucket_name = path_parts[0]
            bucket_prefix = path_parts[1] if len(path_parts) > 1 else ""
            logger.info(f"Using GCS bucket: {bucket_name}, prefix: {bucket_prefix}")
        
        # Determine which files to process
        if request_json.get("process_all"):
            if is_gcs:
                # List PDFs from GCS bucket
                all_blobs = get_pdfs_from_gcs(bucket_name)
                if bucket_prefix:
                    pdf_files = [blob for blob in all_blobs if blob.startswith(bucket_prefix)]
                else:
                    pdf_files = all_blobs
                logger.info(f"Processing {len(pdf_files)} PDF files from GCS")
            else:
                # Process all PDFs in local corpus
                corpus_dir = CORPUS_PATH
                if not os.path.exists(corpus_dir):
                    return jsonify({
                        "error": f"Corpus directory not found: {corpus_dir}"
                    }), 400
                pdf_files = [f for f in os.listdir(corpus_dir) if f.endswith(".pdf")]
                logger.info(f"Processing {len(pdf_files)} PDF files from local directory")
        elif request_json.get("filename"):
            pdf_files = [request_json["filename"]]
        else:
            return jsonify({
                "error": "Must provide 'filename' or 'process_all': true"
            }), 400
        
        # Create temp directory if using GCS
        temp_dir = None
        if is_gcs:
            temp_dir = tempfile.mkdtemp(prefix="chuma_ingest_")
            logger.info(f"Created temporary directory: {temp_dir}")
        
        try:
            results = []
            for filename in pdf_files:
                try:
                    if is_gcs:
                        # Download from GCS to temp directory
                        local_filename = os.path.basename(filename)
                        pdf_path = os.path.join(temp_dir, local_filename)
                        download_from_gcs(bucket_name, filename, pdf_path)
                        # Use original filename for metadata, but process from local path
                        result = process_pdf(pdf_path, os.path.basename(filename))
                    else:
                        # Use local file path
                        pdf_path = os.path.join(CORPUS_PATH, filename)
                        if not os.path.exists(pdf_path):
                            logger.warning(f"File not found: {pdf_path}")
                            results.append({
                                "success": False,
                                "filename": filename,
                                "error": "File not found"
                            })
                            continue
                        result = process_pdf(pdf_path, filename)
                    
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error processing {filename}: {str(e)}")
                    results.append({
                        "success": False,
                        "filename": filename,
                        "error": str(e)
                    })
        finally:
            # Clean up temp directory
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                logger.info(f"Cleaned up temporary directory: {temp_dir}")
        
        success_count = sum(1 for r in results if r.get("success"))
        
        response = jsonify({
            "message": f"Processed {success_count}/{len(results)} documents",
            "results": results
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
        
    except Exception as e:
        logger.error(f"Error in ingest_document: {str(e)}", exc_info=True)
        error_response = jsonify({
            "error": str(e)
        })
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500
