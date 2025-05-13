#!/usr/bin/env python3
"""
Vector Database Updater Script

This script indexes documents from a directory into a vector database
for use with the RAG (Retrieval Augmented Generation) system.
"""
import os
import sys
import argparse

def main():
    """Main function to run the indexer"""
    parser = argparse.ArgumentParser(description='Index documents into vector database')
    parser.add_argument('directory', nargs='?', default='docs',
                        help='Directory to index (default: docs)')
    parser.add_argument('--db', default='lancedb',
                        help='Database type to use (default: lancedb)')
    parser.add_argument('--embed', default='openai',
                        help='Embedding model to use (default: openai)')
    parser.add_argument('--rebuild', action='store_true',
                        help='Rebuild the entire database')
    
    args = parser.parse_args()
    
    print(f"Indexing directory: {args.directory}")
    print(f"Using database: {args.db}")
    print(f"Using embedding model: {args.embed}")
    
    try:
        # Try to import advanced packages
        try:
            import lancedb
            print("LanceDB loaded successfully")
        except ImportError:
            print("LanceDB not installed. Install with: pip install lancedb")
            return
        
        try:
            from sentence_transformers import SentenceTransformer
            print("SentenceTransformer loaded successfully")
        except ImportError:
            print("SentenceTransformer not installed. Install with: pip install sentence-transformers")
            return
        
        # Create an embeddings function
        model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Count documents
        document_count = 0
        for root, _, files in os.walk(args.directory):
            for file in files:
                if file.endswith(('.md', '.txt', '.py', '.js', '.html', '.css', '.json')):
                    document_count += 1
        
        print(f"Found {document_count} documents to index")
        
        # To implement full indexing, install required packages and extend this script
        print("Basic test successful - database and embedding model loaded")
        print("To implement full indexing, extend this script with document chunking and storage")
        
    except Exception as e:
        print(f"Error during indexing: {e}")

if __name__ == "__main__":
    main()
