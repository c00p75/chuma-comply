"""
PDF text extraction and cleaning utilities.
Now includes a PyPDF2 fallback for difficult documents.
"""

import re
import logging
from typing import List

# Try to import unstructured
try:
    from unstructured.partition.pdf import partition_pdf
    HAS_UNSTRUCTURED = True
except ImportError:
    HAS_UNSTRUCTURED = False
    logging.warning("unstructured library not found.")

# Try to import PyPDF2
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False
    logging.warning("PyPDF2 library not found. PDF parsing may fail.")

logger = logging.getLogger(__name__)


def _extract_with_unstructured(file_path: str) -> str:
    """Extract text using unstructured.io (fast strategy)."""
    if not HAS_UNSTRUCTURED:
        logger.warning("unstructured not available, cannot extract.")
        return ""
        
    elements = partition_pdf(
        filename=file_path,
        strategy="fast",  # Fast extraction without model downloads
        infer_table_structure=True,
    )
    
    # Combine all text elements
    text_parts = []
    for element in elements:
        if hasattr(element, "text") and element.text:
            text_parts.append(element.text.strip())
    
    full_text = "\n\n".join(text_parts)
    logger.info(f"Unstructured extracted {len(full_text)} characters from {file_path}")
    return full_text

def _extract_with_pypdf2(file_path: str) -> str:
    """Fallback PDF extraction using PyPDF2."""
    if not HAS_PYPDF2:
        logger.warning("PyPDF2 not available, cannot extract.")
        return ""
        
    text_parts = []
    try:
        with open(file_path, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        full_text = "\n\n".join(text_parts)
        logger.info(f"PyPDF2 extracted {len(full_text)} characters from {file_path}")
        return full_text
    except Exception as e:
        logger.error(f"PyPDF2 fallback extraction failed: {str(e)}")
        return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file using the best available method.
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        Extracted text content
    """
    full_text = ""
    
    # 1. Try unstructured first
    if HAS_UNSTRUCTURED:
        try:
            full_text = _extract_with_unstructured(file_path)
        except Exception as e:
            logger.warning(f"unstructured failed for {file_path}: {str(e)}. Trying fallback.")
            full_text = ""
            
    # 2. If unstructured returned nothing, try PyPDF2
    if not full_text and HAS_PYPDF2:
        logger.info(f"Unstructured returned no text. Trying PyPDF2 fallback for {file_path}.")
        try:
            full_text = _extract_with_pypdf2(file_path)
        except Exception as e:
            logger.error(f"PyPDF2 fallback also failed for {file_path}: {str(e)}")
            full_text = "" # Ensure it's an empty string on failure

    if not full_text:
        logger.error(f"All extraction methods failed for {file_path}. Returning empty string.")
        
    return full_text


def clean_text(text: str) -> str:
    """
    Clean extracted text by removing artifacts and normalizing.
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)
    
    # Remove common PDF artifacts
    text = re.sub(r"\f", "\n", text)  # Form feed characters
    text = re.sub(r"\x0c", "", text)  # Page breaks
    
    # Remove headers/footers (common patterns)
    # Remove lines that are just page numbers
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        # Skip lines that are just page numbers or common headers
        if line and not re.match(r"^\d+$", line):  # Not just digits
            if len(line) > 3:  # Skip very short lines (likely artifacts)
                cleaned_lines.append(line)
    
    cleaned_text = "\n".join(cleaned_lines)
    
    # Final normalization
    cleaned_text = re.sub(r"\n{3,}", "\n\n", cleaned_text)  # Max 2 consecutive newlines
    
    return cleaned_text.strip()
