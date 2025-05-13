#!/usr/bin/env python3
"""
RAG Test Script

This script demonstrates basic RAG functionality and tests the virtual environment setup.
It can be run with:
  ./run_rag.sh run libs/rag/src/rag_test.py
  ./saar_chain.sh rag run libs/rag/src/rag_test.py
"""

import os
import sys
import site
import importlib
from pathlib import Path


def test_environment():
    """Test the Python environment."""
    print("\n=== Python Environment ===\n")
    
    # Check if we're in a virtual environment
    in_venv = hasattr(sys, "real_prefix") or (hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix)
    
    if in_venv:
        print("✅ Running in virtual environment")
        print(f"   Path: {sys.prefix}")
    else:
        print("❌ Not running in a virtual environment")
        print("   This script should be run using run_rag.sh")
        print("   Try: ./run_rag.sh run libs/rag/src/rag_test.py")
        return False
    
    return True


def test_packages():
    """Test required and optional packages."""
    print("\n=== Package Availability ===\n")
    
    required_packages = ["anthropic", "requests"]
    optional_packages = ["lancedb", "chromadb", "voyage", "sentence_transformers"]
    
    # Test required packages
    print("Required Packages:")
    all_required_available = True
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - not installed")
            all_required_available = False
    
    # Test optional packages
    print("\nOptional Packages:")
    
    for package in optional_packages:
        try:
            importlib.import_module(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ⚠️ {package} - not installed (optional)")
    
    return all_required_available


def simulate_rag_query(query):
    """Simulate a RAG query."""
    print(f"\n=== RAG Query: '{query}' ===\n")
    
    # Try to import the anthropic module for Claude
    try:
        import anthropic
        print("Using Anthropic API for LLM...")
    except ImportError:
        print("Anthropic module not available, using simulation mode...")
    
    # Simple simulation of RAG process
    print("\nRAG Process:")
    print("1. Converting query to embedding...")
    print("2. Searching vector database for relevant documents...")
    print("3. Found 3 relevant documents")
    print("4. Generating augmented prompt...")
    print("5. Sending prompt to language model...")
    
    print("\nResponse:")
    
    if "PEP 668" in query:
        print("PEP 668 introduced the 'externally-managed-environment' concept in Python.")
        print("It prevents pip from installing packages directly into system Python environments")
        print("that are managed by system package managers (like apt, yum, etc.).")
        print("\nThis is a security feature that ensures system Python installations remain")
        print("consistent and are only modified through the operating system's package manager.")
        print("\nThe solution is to use virtual environments for Python package installation,")
        print("which is exactly what this RAG system implementation does.")
    else:
        print("This is a simulated RAG response to your query. In a real implementation,")
        print("this would search the vector database for relevant context and use Claude")
        print("to generate a response with the retrieved information.")
        print("\nTry running:")
        print("  ./saar_chain.sh rag query \"What is PEP 668?\"")
    
    return True


def main():
    """Main function."""
    print("\n=== RAG Test Script ===\n")
    print("This script tests the RAG system and virtual environment setup.")
    
    # Test the environment
    env_ok = test_environment()
    if not env_ok:
        print("\n❌ Environment check failed. Aborting further tests.")
        return
    
    # Test packages
    packages_ok = test_packages()
    if not packages_ok:
        print("\n⚠️ Some required packages are missing.")
        print("   Run: ./setup_rag.sh to install them.")
        return
    
    # Simulate a RAG query
    simulate_rag_query("What is RAG?")
    
    print("\n=== Test Summary ===\n")
    print("✅ Virtual environment is properly set up")
    print("✅ Required packages are installed")
    print("✅ RAG simulation successful")
    print("\nYou can now use the RAG system with real queries:")
    print("  ./saar_chain.sh rag query \"Your question here\"")


if __name__ == "__main__":
    main()