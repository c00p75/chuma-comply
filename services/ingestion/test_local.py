#!/usr/bin/env python3
"""
Local test script for the ingestion pipeline.
Run this to test PDF processing locally before deploying.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent))

from main import process_pdf

# Set environment variables
os.environ['GCP_PROJECT_ID'] = os.getenv('GCP_PROJECT_ID', 'your-project-id')
os.environ['GCP_LOCATION'] = os.getenv('GCP_LOCATION', 'us-central1')

# Corpus path relative to this script
SCRIPT_DIR = Path(__file__).parent
CORPUS_DIR = SCRIPT_DIR.parent.parent / 'corpus'
os.environ['CORPUS_PATH'] = str(CORPUS_DIR)

def test_single_pdf():
    """Test processing a single PDF."""
    pdf_filename = "Companies Act, 2017.pdf"
    pdf_path = CORPUS_DIR / pdf_filename
    
    if not pdf_path.exists():
        print(f"ERROR: PDF not found at {pdf_path}")
        print(f"Available PDFs in corpus:")
        for f in CORPUS_DIR.glob("*.pdf"):
            print(f"  - {f.name}")
        return
    
    print(f"Processing {pdf_filename}...")
    print(f"Path: {pdf_path}")
    print("-" * 50)
    
    result = process_pdf(str(pdf_path), pdf_filename)
    
    print("\n" + "=" * 50)
    print("RESULT:")
    print("=" * 50)
    print(result)
    
    if result.get("success"):
        print(f"\n✅ Success! Created {result.get('chunks_created')} chunks")
    else:
        print(f"\n❌ Failed: {result.get('error')}")

if __name__ == "__main__":
    print("Chuma Comply - Local Ingestion Test")
    print("=" * 50)
    print(f"GCP Project: {os.getenv('GCP_PROJECT_ID')}")
    print(f"Corpus Directory: {CORPUS_DIR}")
    print("=" * 50)
    print()
    
    if not CORPUS_DIR.exists():
        print(f"ERROR: Corpus directory not found at {CORPUS_DIR}")
        sys.exit(1)
    
    test_single_pdf()

