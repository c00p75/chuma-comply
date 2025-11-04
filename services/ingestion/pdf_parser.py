"""
PDF text extraction and cleaning utilities.
"""

import re
import logging
from typing import List

try:
    from unstructured.partition.pdf import partition_pdf
    from unstructured.chunking.title import chunk_by_title
except ImportError:
    # Fallback to PyPDF2 if unstructured is not available
    try:
        import PyPDF2
        HAS_PYPDF2 = True
    except ImportError:
        HAS_PYPDF2 = False
        logging.warning("Neither unstructured nor PyPDF2 available. PDF parsing may fail.")

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file using unstructured.io.
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        Extracted text content
    """
    try:
        # Use unstructured.io for better layout understanding
        elements = partition_pdf(
            filename=file_path,
            strategy="hi_res",  # High resolution for better accuracy
            infer_table_structure=True,
        )
        
        # Combine all text elements
        text_parts = []
        for element in elements:
            if hasattr(element, "text") and element.text:
                text_parts.append(element.text.strip())
        
        full_text = "\n\n".join(text_parts)
        logger.info(f"Extracted {len(full_text)} characters from {file_path}")
        
        return full_text
        
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}")
        # Fallback to basic extraction if available
        if HAS_PYPDF2:
            return _extract_with_pypdf2(file_path)
        raise


def _extract_with_pypdf2(file_path: str) -> str:
    """Fallback PDF extraction using PyPDF2."""
    import PyPDF2
    
    text_parts = []
    with open(file_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            if text:
                text_parts.append(text)
    
    return "\n\n".join(text_parts)


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

