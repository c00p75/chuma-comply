"""
Semantic and hierarchical chunking for legal documents.
Preserves legal structure (Sections, Parts) and prevents splitting concepts.
"""

import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Legal document structure patterns
SECTION_PATTERN = re.compile(r"^Section\s+\d+[A-Za-z]?", re.IGNORECASE | re.MULTILINE)
PART_PATTERN = re.compile(r"^Part\s+[IVX]+", re.IGNORECASE | re.MULTILINE)
SUBSECTION_PATTERN = re.compile(r"^\([a-z0-9]+\)", re.IGNORECASE | re.MULTILINE)

# Chunking parameters
MAX_CHUNK_SIZE = 512
OVERLAP_SIZE = 50


def semantic_chunk(text: str, filename: str) -> List[Dict[str, Any]]:
    """
    Chunk text semantically, preserving legal document structure.
    
    Strategy:
    1. Split by legal boundaries (Sections, Parts)
    2. Fallback to sentence-aware chunking with overlap
    3. Preserve metadata about chunk boundaries
    
    Args:
        text: Text to chunk
        filename: Source filename for reference
        
    Returns:
        List of chunk dictionaries with content and metadata
    """
    chunks = []
    
    # Try to split by legal structure first
    sections = _split_by_sections(text)
    
    if len(sections) > 1:
        logger.info(f"Found {len(sections)} sections in {filename}, chunking by structure")
        for section_text in sections:
            section_chunks = _chunk_with_overlap(section_text, len(chunks))
            chunks.extend(section_chunks)
    else:
        # Fallback to sentence-aware chunking
        logger.info(f"No clear sections found in {filename}, using sentence-aware chunking")
        chunks = _chunk_with_overlap(text, 0)
    
    # Add metadata to each chunk
    for i, chunk in enumerate(chunks):
        chunk["chunkIndex"] = i
        chunk["startChar"] = chunk.get("startChar", 0)
        chunk["endChar"] = chunk.get("endChar", len(chunk["content"]))
    
    return chunks


def _split_by_sections(text: str) -> List[str]:
    """
    Split text by Section boundaries.
    
    Args:
        text: Text to split
        
    Returns:
        List of section texts
    """
    sections = []
    
    # Find all section markers
    section_matches = list(SECTION_PATTERN.finditer(text))
    
    if len(section_matches) < 2:
        return [text]  # Not enough sections to split meaningfully
    
    # Split at section boundaries
    for i in range(len(section_matches)):
        start_pos = section_matches[i].start()
        end_pos = section_matches[i + 1].start() if i + 1 < len(section_matches) else len(text)
        section_text = text[start_pos:end_pos].strip()
        if section_text:
            sections.append(section_text)
    
    # Add text before first section
    if section_matches[0].start() > 0:
        preamble = text[:section_matches[0].start()].strip()
        if preamble:
            sections.insert(0, preamble)
    
    return sections


def _chunk_with_overlap(text: str, start_index: int = 0) -> List[Dict[str, any]]:
    """
    Chunk text with sentence awareness and overlap.
    
    Args:
        text: Text to chunk
        start_index: Starting chunk index for this batch
        
    Returns:
        List of chunk dictionaries
    """
    chunks = []
    
    # Split into sentences (rough approximation)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    current_chunk = []
    current_length = 0
    chunk_start = 0
    
    i = 0
    while i < len(sentences):
        sentence = sentences[i].strip()
        if not sentence:
            i += 1
            continue
        
        sentence_length = len(sentence)
        
        # If adding this sentence would exceed max size
        if current_length + sentence_length > MAX_CHUNK_SIZE and current_chunk:
            # Save current chunk
            chunk_content = " ".join(current_chunk)
            chunks.append({
                "content": chunk_content,
                "chunkIndex": start_index + len(chunks),
                "startChar": chunk_start,
                "endChar": chunk_start + len(chunk_content),
                "pageNumber": 0,  # Will be enhanced if page info available
            })
            
            # Start new chunk with overlap
            overlap_text = _get_overlap_text(current_chunk, OVERLAP_SIZE)
            current_chunk = overlap_text.split() + [sentence] if overlap_text else [sentence]
            current_length = len(" ".join(current_chunk))
            chunk_start = chunk_start + len(chunk_content) - len(overlap_text) if overlap_text else chunk_start + len(chunk_content)
        else:
            # Add sentence to current chunk
            if not current_chunk:
                chunk_start = text.find(sentence, chunk_start)
            current_chunk.append(sentence)
            current_length += sentence_length + 1  # +1 for space
        
        i += 1
    
    # Add final chunk
    if current_chunk:
        chunk_content = " ".join(current_chunk)
        chunks.append({
            "content": chunk_content,
            "chunkIndex": start_index + len(chunks),
            "startChar": chunk_start,
            "endChar": chunk_start + len(chunk_content),
            "pageNumber": 0,
        })
    
    return chunks


def _get_overlap_text(sentences: List[str], overlap_size: int) -> str:
    """
    Get overlap text from end of chunk.
    
    Args:
        sentences: List of sentences in current chunk
        overlap_size: Target overlap size in characters
        
    Returns:
        Overlap text
    """
    if not sentences:
        return ""
    
    overlap_sentences = []
    overlap_length = 0
    
    # Take sentences from the end until we reach overlap size
    for sentence in reversed(sentences):
        if overlap_length + len(sentence) <= overlap_size:
            overlap_sentences.insert(0, sentence)
            overlap_length += len(sentence) + 1
        else:
            break
    
    return " ".join(overlap_sentences)

