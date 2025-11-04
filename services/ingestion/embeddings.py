"""
Vertex AI embedding generation for text chunks using REST API.
"""

import os
import time
import logging
from typing import List
import requests

logger = logging.getLogger(__name__)

# Embedding model
EMBEDDING_MODEL = "text-embedding-005"
EMBEDDING_DIMENSIONS = 768
BATCH_SIZE = 5  # Conservative batch size for REST API


def _get_access_token() -> str:
    """Get GCP access token for authentication."""
    import subprocess
    try:
        result = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except Exception as e:
        logger.error(f"Error getting access token: {str(e)}")
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
        access_token = _get_access_token()
        url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{EMBEDDING_MODEL}:predict"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
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
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
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
    
    # Process in batches
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        logger.info(f"Generating embeddings for batch {i // batch_size + 1}/{(len(texts) + batch_size - 1) // batch_size} ({len(batch)} texts)")
        
        try:
            access_token = _get_access_token()
            url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{EMBEDDING_MODEL}:predict"
            
            headers = {
                "Authorization": f"Bearer {access_token}",
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
            
            response = requests.post(url, json=payload, headers=headers, timeout=60)
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

