#!/bin/bash
set -e

# RAG Setup Script
# ================
# This script sets up the RAG (Retrieval Augmented Generation) system
# in an isolated virtual environment to avoid the externally-managed-environment error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAG_BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)" # Should resolve to libs/rag
VENV_DIR="$RAG_BASE_DIR/scripts/.venv"

# Show banner
show_banner() {
  echo -e "\033[0;35m\033[1m
  █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗     ██████╗ ███████╗
 ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝    ██╔═══██╗██╔════╝
 ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║██║         ██║   ██║███████╗
 ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██║         ██║   ██║╚════██║
 ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╗    ╚██████╔╝███████║
 ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝     ╚═════╝ ╚══════╝
\033[0m"
  echo -e "\033[0;36m\033[1mClaude Neural Framework - RAG Setup\033[0m"
  echo -e "\033[0;34mRAG - Retrieval Augmented Generation System\033[0m"
  echo "Version: 1.0.0"
  echo ""
}

# Function to create a Python virtual environment
setup_venv() {
  # Check if Python 3 is available
  if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found"
    exit 1
  fi
  
  # Check if venv module is available
  if ! python3 -c "import venv" &> /dev/null; then
    echo "Error: Python venv module is required"
    echo "Installing python3-venv..."
    sudo apt-get update && sudo apt-get install -y python3-venv || {
      echo "Failed to install python3-venv. Please install it manually."
      exit 1
    }
  fi
  
  # Create virtual environment if it doesn't exist
  if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment at $VENV_DIR..."
    python3 -m venv "$VENV_DIR" || {
      echo "Failed to create virtual environment"
      exit 1
    }
  fi
  
  # Activate virtual environment
  source "$VENV_DIR/bin/activate" || {
    echo "Failed to activate virtual environment"
    exit 1
  }
  
  # Update pip
  echo "Updating pip..."
  python -m pip install --upgrade pip
  
  # Install basic packages
  echo "Installing required packages..."
  pip install anthropic requests
  
  echo "Virtual environment setup complete"
}

# Function to install advanced RAG packages
install_advanced_packages() {
  # Must be run after setup_venv
  if [ ! -f "$VENV_DIR/bin/activate" ]; then
    echo "Error: Virtual environment not found. Run setup_venv first."
    return 1
  fi
  
  # Make sure we're in the virtual environment
  source "$VENV_DIR/bin/activate"
  
  echo "Installing advanced RAG packages..."
  pip install lancedb chromadb voyage sentence-transformers
  
  echo "Advanced packages installed"
}

# Function to create minimal RAG scripts if they don't exist
create_rag_scripts() {
  # Python scripts will be created in SCRIPT_DIR (libs/rag/scripts)
  
  # Create indexing script
  if [ ! -f "$SCRIPT_DIR/update_vector_db.py" ]; then
    echo "Creating indexing script..."
    cat > "$SCRIPT_DIR/update_vector_db.py" << 'EOL'
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
EOL

    chmod +x "$SCRIPT_DIR/update_vector_db.py"
  fi
  
  # Create query script
  if [ ! -f "$SCRIPT_DIR/query_rag.py" ]; then
    echo "Creating query script..."
    cat > "$SCRIPT_DIR/query_rag.py" << 'EOL'
#!/usr/bin/env python3
"""
RAG Query Script

This script allows querying the RAG system with natural language
and returns augmented responses using the vector database.
"""
import os
import sys
import argparse

def main():
    """Main function to run the query"""
    parser = argparse.ArgumentParser(description='Query the RAG system')
    parser.add_argument('query', nargs='*', help='The query text')
    parser.add_argument('--db', default='lancedb',
                        help='Database type to use (default: lancedb)')
    parser.add_argument('--model', default='claude',
                        help='LLM to use (default: claude)')
    parser.add_argument('--results', type=int, default=3,
                        help='Number of results to retrieve (default: 3)')
    
    args = parser.parse_args()
    
    # If no query provided, use input
    if not args.query:
        query = input("Enter your query: ")
    else:
        query = ' '.join(args.query)
    
    print(f"Query: {query}")
    print(f"Using database: {args.db}")
    print(f"Using model: {args.model}")
    print(f"Retrieving {args.results} results")
    
    try:
        # Try to import advanced packages
        try:
            import anthropic
            print("Anthropic SDK loaded successfully")
        except ImportError:
            print("Anthropic SDK not installed. Install with: pip install anthropic")
            return
        
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
        
        # Check for API key
        api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not api_key:
            print("ANTHROPIC_API_KEY environment variable not found")
            api_key = input("Enter your Anthropic API key: ")
            if not api_key:
                print("No API key provided. Exiting.")
                return
        
        print("Basic test successful - all required components loaded")
        print("To implement full RAG querying, extend this script with document retrieval and LLM integration")
        
    except Exception as e:
        print(f"Error during query: {e}")

if __name__ == "__main__":
    main()
EOL

    chmod +x "$SCRIPT_DIR/query_rag.py"
  fi
  
  # Create rag_framework.py
  if [ ! -f "$SCRIPT_DIR/rag_framework.py" ]; then
    echo "Creating RAG framework script..."
    cat > "$SCRIPT_DIR/rag_framework.py" << 'EOL'
#!/usr/bin/env python3
"""
RAG Framework

This module provides the core functionality for the
Retrieval Augmented Generation (RAG) system.
"""

import os
import sys
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        # Log file will be in libs/rag/logs/rag.log
        logging.FileHandler(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs', 'rag.log'))
    ]
)

logger = logging.getLogger('rag_framework')

class RAGFramework:
    """Main RAG Framework Class"""
    
    def __init__(self, db_type='lancedb', embed_model='openai', llm_model='claude'):
        """Initialize the RAG Framework"""
        self.db_type = db_type
        self.embed_model = embed_model
        self.llm_model = llm_model
        logger.info(f"Initializing RAG Framework with {db_type}, {embed_model}, {llm_model}")
        
        # Try to load components
        self._load_components()
    
    def _load_components(self):
        """Load all required components"""
        try:
            # Try to import required packages
            try:
                import anthropic
                self.anthropic = anthropic
                logger.info("Anthropic SDK loaded successfully")
            except ImportError:
                logger.error("Anthropic SDK not installed. Install with: pip install anthropic")
                self.anthropic = None
            
            # Vector database - choose based on db_type
            if self.db_type == 'lancedb':
                try:
                    import lancedb
                    self.db_module = lancedb
                    logger.info("LanceDB loaded successfully")
                except ImportError:
                    logger.error("LanceDB not installed. Install with: pip install lancedb")
                    self.db_module = None
            elif self.db_type == 'chromadb':
                try:
                    import chromadb
                    self.db_module = chromadb
                    logger.info("ChromaDB loaded successfully")
                except ImportError:
                    logger.error("ChromaDB not installed. Install with: pip install chromadb")
                    self.db_module = None
            
            # Embeddings model
            try:
                from sentence_transformers import SentenceTransformer
                self.embeddings_module = SentenceTransformer
                logger.info("SentenceTransformer loaded successfully")
            except ImportError:
                logger.error("SentenceTransformer not installed. Install with: pip install sentence-transformers")
                self.embeddings_module = None
                
        except Exception as e:
            logger.error(f"Error during component loading: {e}")
    
    def check_status(self):
        """Check the status of all components"""
        components = {
            "LLM": self.anthropic is not None,
            "Vector DB": self.db_module is not None,
            "Embeddings": self.embeddings_module is not None
        }
        
        all_ok = all(components.values())
        status = "✅ All components available" if all_ok else "❌ Some components missing"
        
        return {
            "status": "ready" if all_ok else "not_ready",
            "components": components,
            "message": status
        }
    
    def query(self, query_text, max_results=3):
        """Query the RAG system"""
        logger.info(f"Processing query: {query_text}")
        
        # Check if all components are available
        status = self.check_status()
        if status["status"] != "ready":
            return {
                "success": False,
                "error": "Not all components are available",
                "missing": [k for k, v in status["components"].items() if not v]
            }
        
        # This is a demo implementation - extend with actual retrieval and generation
        return {
            "success": True,
            "query": query_text,
            "results": {
                "response": f"This is a test response for: {query_text}",
                "sources": [
                    {"title": "Example Document 1", "content": "Example content 1"},
                    {"title": "Example Document 2", "content": "Example content 2"}
                ]
            }
        }
    
    def index_directory(self, directory, rebuild=False):
        """Index all documents in a directory"""
        logger.info(f"Indexing directory: {directory}")
        
        # Check if all components are available
        status = self.check_status()
        if status["status"] != "ready":
            return {
                "success": False,
                "error": "Not all components are available",
                "missing": [k for k, v in status["components"].items() if not v]
            }
        
        # Count documents
        document_count = 0
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(('.md', '.txt', '.py', '.js', '.html', '.css', '.json')):
                    document_count += 1
        
        # This is a demo implementation - extend with actual indexing
        return {
            "success": True,
            "directory": directory,
            "documents_found": document_count,
            "documents_indexed": 0,  # In a real implementation, this would be the actual count
            "rebuild": rebuild
        }

# Simple test function
def main():
    """Main function for testing"""
    rag = RAGFramework()
    print("RAG Framework Initialized")
    print(f"Status: {rag.check_status()}")
    
    # Try to query
    if rag.check_status()["status"] == "ready":
        result = rag.query("How does the RAG system work?")
        print(f"Query result: {result}")

if __name__ == "__main__":
    main()
EOL

    chmod +x "$SCRIPT_DIR/rag_framework.py"
  fi
  
  echo "RAG scripts created in $SCRIPT_DIR"
}

# Create logs directory if it doesn't exist
ensure_logs_directory() {
  # This will create logs directory at libs/rag/logs
  mkdir -p "$RAG_BASE_DIR/logs"
  echo "Logs directory created at $RAG_BASE_DIR/logs"
}

# Main function
main() {
  show_banner
  
  # Setup virtual environment
  setup_venv
  
  # Ask about advanced packages
  read -p "Install advanced RAG packages (lancedb, chromadb, sentence-transformers)? (y/N): " install_advanced
  if [[ "$install_advanced" =~ ^[Yy]$ ]]; then
    install_advanced_packages
  fi
  
  # Create RAG scripts
  create_rag_scripts
  
  # Ensure logs directory exists
  ensure_logs_directory
  
  # Create activation script if it doesn't exist
  if [ ! -f "$SCRIPT_DIR/activate_venv.sh" ]; then
    echo "Creating virtual environment activation script..."
    cat > "$SCRIPT_DIR/activate_venv.sh" << EOF
#!/bin/bash
# Helper script to activate Python virtual environment
source "$VENV_DIR/bin/activate"
echo "Python virtual environment activated. Run 'deactivate' to exit."
EOF
    chmod +x "$SCRIPT_DIR/activate_venv.sh"
  fi
  
  # Create run_rag.sh if it doesn't exist or needs updating
  if [ ! -f "$SCRIPT_DIR/run_rag.sh" ]; then
    echo "Creating RAG runner script..."
    cat > "$SCRIPT_DIR/run_rag.sh" << EOF
#!/bin/bash
set -e
# Runner script for RAG functionality

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
RAG_BASE_DIR="\$(cd "\$SCRIPT_DIR/.." && pwd)" # Should resolve to libs/rag
VENV_DIR="\$RAG_BASE_DIR/scripts/.venv" # This is libs/rag/scripts/.venv

if [ ! -f "\$VENV_DIR/bin/activate" ]; then
  echo "Error: Python virtual environment not found. Please run setup_rag.sh first."
  exit 1
fi

# Activate virtual environment
source "\$VENV_DIR/bin/activate"

# Set PYTHONPATH
# This will point to SCRIPT_DIR (libs/rag/scripts), allowing Python to find modules there
export PYTHONPATH="\$SCRIPT_DIR:\$PYTHONPATH"

# Run command or show help
if [ \$# -eq 0 ]; then
  echo "RAG Runner - Run RAG components with correct Python environment"
  echo ""
  echo "Usage: \$0 <command> [arguments]"
  echo ""
  echo "Available commands:"
  echo "  run           Run a Python RAG script"
  echo "  update        Update the vector database"
  echo "  query         Query the RAG system"
  echo "  shell         Start Python shell with virtual environment"
  echo ""
  echo "Examples:"
  echo "  \$0 run ./rag_framework.py" # Assuming rag_framework.py is in SCRIPT_DIR
  echo "  \$0 update docs/"
  echo "  \$0 query 'How does the RAG system work?'"
else
  case "\$1" in
    run)
      shift
      # If a path is given, use it, otherwise assume script is in SCRIPT_DIR
      if [[ "\$1" == */* ]]; then
        python "\$@"
      else
        python "\$SCRIPT_DIR/\$@"
      fi
      ;;
    update)
      shift
      python "\$SCRIPT_DIR/update_vector_db.py" "\$@"
      ;;
    query)
      shift
      python "\$SCRIPT_DIR/query_rag.py" "\$@"
      ;;
    shell)
      python
      ;;
    *)
      python "\$@"
      ;;
  esac
fi

# Deactivate virtual environment
deactivate
EOF
    chmod +x "$SCRIPT_DIR/run_rag.sh"
  fi
  
  # Deactivate virtual environment
  deactivate
  
  echo ""
  echo "RAG setup complete!"
  echo ""
  echo "To activate the virtual environment:"
  echo "  source ./activate_venv.sh"
  echo ""
  echo "To run RAG commands:"
  echo "  ./run_rag.sh query 'How does the system work?'"
  echo "  ./run_rag.sh update docs/"
  echo "  ./run_rag.sh run ./rag_framework.py" # Script is now in the same directory as run_rag.sh
  echo ""
  echo "To install additional packages:"
  echo "  source ./activate_venv.sh"
  echo "  pip install <package-name>"
  echo "  deactivate"
}

# Run main function
main