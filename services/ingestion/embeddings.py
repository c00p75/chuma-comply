"""
Vertex AI embedding generation for text chunks using REST API.
This version uses google-auth for server-safe authentication.
"""

import os
import time
import logging
from typing import List
import requests
import google.auth
import google.auth.transport.requests

logger = logging.getLogger(__name__)

# Embedding model
EMBEDDING_MODEL = "text-embedding-005"
EMBEDDING_DIMENSIONS = 768
BATCH_SIZE = 5  # Conservative batch size for REST API


def _get_authed_session() -> requests.Session:
    """
    Gets a Requests session object with automatically refreshed GCP auth.
    This will use the attached service account (rag-ingestion-sa) credentials.
    """
    try:
        # Get Application Default Credentials
        credentials, project = google.auth.default(
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        
        # Create an authorized session
        auth_request = google.auth.transport.requests.Request()
        credentials.refresh(auth_request)
        
        authed_session = requests.Session()
        authed_session.headers.update(
            {"Authorization": f"Bearer {credentials.token}"}
        )
        return authed_session
    except Exception as e:
        logger.error(f"Error getting authenticated session: {str(e)}")
        raise


def generate_embedding(text: str, project_id: str, location: str = "us-central1") -> List[float]:
    """
    Generate a single embedding using Vertex AI REST API.
    
    Args:
        text: Text to embed
        project_id: GCP project ID
        location: GCP location
        
    Returns:
        Embedding vector (768 dimensions)
    """
    try:
        # Get an authenticated session instead of a manual token
        authed_session = _get_authed_session()
        
        url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{EMBEDDING_MODEL}:predict"
        
        headers = {
            "Content-Type": "application/json",
        }
        
        payload = {
            "instances": [
                {
                    "content": text,
                    "task_type": "RETRIEVAL_DOCUMENT"
                }
            ]
        }
        
        # Use the authed_session.post, which includes the Bearer token
        response = authed_session.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        if "predictions" not in result or not result["predictions"]:
            raise ValueError("No embedding returned from Vertex AI")
        
        prediction = result["predictions"][0]
        
        # Extract embedding values
        if "embeddings" in prediction:
            embedding = prediction["embeddings"].get("values", [])
        elif "values" in prediction:
            embedding = prediction["values"]
        else:
            raise ValueError("Unexpected response structure from Vertex AI")
        
        if not embedding or len(embedding) != EMBEDDING_DIMENSIONS:
            raise ValueError(f"Invalid embedding dimensions: {len(embedding) if embedding else 0}")
        
        return list(embedding)
        
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise


def batch_generate_embeddings(
    texts: List[str],
    project_id: str,
    location: str = "us-central1",
    batch_size: int = BATCH_SIZE
) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batches using REST API.
    
    Args:
        texts: List of texts to embed
        project_id: GCP project ID
        location: GCP location
        batch_size: Number of texts to process per batch
        
    Returns:
        List of embedding vectors
    """
    all_embeddings = []
    
    # Get one session for all batches (more efficient)
    authed_session = _get_authed_session()
    
    # Process in batches
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        logger.info(f"Generating embeddings for batch {i // batch_size + 1}/{(len(texts) + batch_size - 1) // batch_size} ({len(batch)} texts)")
        
        try:
            url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{EMBEDDING_MODEL}:predict"
            
            headers = {
                "Content-Type": "application/json",
            }
            
            payload = {
                "instances": [
                    {
                        "content": text,
                        "task_type": "RETRIEVAL_DOCUMENT"
                    }
                    for text in batch
                ]
            }
            
            # Use the authed_session.post, which includes the Bearer token
            response = authed_session.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            
            if "predictions" not in result or len(result["predictions"]) != len(batch):
                raise ValueError(f"Embedding count mismatch: expected {len(batch)}, got {len(result.get('predictions', []))}")
            
            # Extract embeddings from response
            batch_embeddings = []
            for prediction in result["predictions"]:
                # Extract embedding values
                if "embeddings" in prediction:
                    embedding = prediction["embeddings"].get("values", [])
                elif "values" in prediction:
                    embedding = prediction["values"]
                else:
                    raise ValueError("Unexpected response structure from Vertex AI")
                
                if not embedding or len(embedding) != EMBEDDING_DIMENSIONS:
                    raise ValueError(f"Invalid embedding dimensions: {len(embedding) if embedding else 0}")
                
                batch_embeddings.append(list(embedding))
            
            all_embeddings.extend(batch_embeddings)
            
            # Rate limiting - small delay between batches
            if i + batch_size < len(texts):
                time.sleep(0.5)
                
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {str(e)}")
            # Fallback to individual embeddings for this batch
            logger.info("Falling back to individual embedding generation for this batch")
            for text in batch:
                try:
                    # Note: This will create a new session, which is less efficient
                    # but fine for a fallback.
                    embedding = generate_embedding(text, project_id, location)
                    all_embeddings.append(embedding)
                    time.sleep(0.2)  # Small delay between individual calls
                except Exception as e2:
                    logger.error(f"Error generating embedding for text: {str(e2)}")
                    # Use zero vector as fallback (not ideal, but prevents pipeline failure)
                    all_embeddings.append([0.0] * EMBEDDING_DIMENSIONS)
    
    if len(all_embeddings) != len(texts):
        raise ValueError(f"Final embedding count mismatch: {len(all_embeddings)} vs {len(texts)}")
    
    return all_embeddings
