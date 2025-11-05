"""
Metadata generation and document classification for vector chunks.
"""

import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Document classification rules
DOCUMENT_CLASSIFICATIONS = {
    # Free tier documents (general compliance)
    "companies": {
        "documentType": "business_registration",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "PACRA",
        "topicPrimary": "Business Registration",
        "topicSecondary": "Incorporation",
    },
    "business names": {
        "documentType": "business_registration",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "PACRA",
        "topicPrimary": "Business Registration",
        "topicSecondary": "Name Reservation",
    },
    "pacra": {
        "documentType": "business_registration",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "PACRA",
        "topicPrimary": "Business Registration",
    },
    "vat": {
        "documentType": "tax",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "ZRA",
        "topicPrimary": "Tax",
        "topicSecondary": "VAT",
    },
    "employment": {
        "documentType": "employment",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "NAPSA",
        "topicPrimary": "Employment",
    },
    "pension": {
        "documentType": "employment",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "NAPSA",
        "topicPrimary": "Employment",
        "topicSecondary": "Pension",
    },
    # Pro tier documents (industry-specific)
    "data protection": {
        "documentType": "data_protection",
        "industry": "technology",
        "subscriptionTier": "pro",
        "regulatoryBody": "Data Protection Commissioner",
        "topicPrimary": "Data Privacy",
        "topicSecondary": "Data Handling",
    },
}


def classify_document(filename: str) -> Dict[str, str]:
    """
    Classify a document based on filename to determine metadata defaults.
    
    Args:
        filename: PDF filename
        
    Returns:
        Dictionary with classification metadata
    """
    filename_lower = filename.lower()
    
    # Match against known patterns
    for key, classification in DOCUMENT_CLASSIFICATIONS.items():
        if key in filename_lower:
            return classification.copy()
    
    # Default classification (general, free tier)
    logger.warning(f"Unknown document type for {filename}, using defaults")
    return {
        "documentType": "general",
        "industry": "general",
        "subscriptionTier": "free",
        "regulatoryBody": "General",
        "topicPrimary": "General Compliance",
    }


def extract_act_name(text: str, filename: str) -> str:
    """
    Extract the full act name from document text or filename.
    
    Args:
        text: Document text
        filename: Original filename
        
    Returns:
        Act name
    """
    # Try to extract from text first
    act_pattern = re.compile(r"((?:The\s+)?[A-Z][A-Za-z\s]+Act(?:\s+\d{4})?)", re.IGNORECASE)
    matches = act_pattern.findall(text[:1000])  # Check first 1000 chars
    
    if matches:
        return matches[0].strip()
    
    # Fallback to filename
    act_name = filename.replace(".pdf", "").replace("_", " ")
    return act_name


def extract_section_number(chunk_text: str) -> str:
    """
    Extract section number from chunk text if present.
    
    Args:
        chunk_text: Chunk content
        
    Returns:
        Section number string (e.g., "Section 15(a)") or empty string
    """
    section_match = re.search(r"Section\s+(\d+[A-Za-z]?)", chunk_text[:200], re.IGNORECASE)
    if section_match:
        return f"Section {section_match.group(1)}"
    
    subsection_match = re.search(r"\(([a-z0-9]+)\)", chunk_text[:200])
    if subsection_match:
        parent_section = re.search(r"Section\s+(\d+)", chunk_text[:500], re.IGNORECASE)
        if parent_section:
            return f"Section {parent_section.group(1)}{subsection_match.group(0)}"
    
    return ""


def generate_metadata(
    chunk: Dict[str, Any],
    filename: str,
    doc_classification: Dict[str, str]
) -> Dict[str, Any]:
    """
    Generate complete metadata for a chunk.
    
    Args:
        chunk: Chunk dictionary with content and basic metadata
        filename: Source filename
        doc_classification: Document-level classification
        
    Returns:
        Complete metadata dictionary
    """
    chunk_text = chunk.get("content", "")
    
    # Start with document classification
    metadata = doc_classification.copy()
    
    # Extract additional metadata from chunk
    section_number = extract_section_number(chunk_text)
    if section_number:
        metadata["sectionNumber"] = section_number
    
    # Extract act name if not already set
    if "actName" not in metadata or not metadata.get("actName"):
        metadata["actName"] = extract_act_name(chunk_text, filename)
    
    # Add page number if available
    if "pageNumber" in chunk:
        metadata["pageNumber"] = chunk["pageNumber"]
    
    return metadata

