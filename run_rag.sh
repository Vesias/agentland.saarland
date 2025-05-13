#!/bin/bash
# Runner script for RAG functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -f "$VENV_DIR/bin/activate" ]; then
  echo "Error: Python virtual environment not found. Please run setup first."
  exit 1
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Set PYTHONPATH
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

# Run command or show help
if [ $# -eq 0 ]; then
  echo "RAG Runner - Run RAG components with correct Python environment"
  echo ""
  echo "Usage: $0 <command> [arguments]"
  echo ""
  echo "Available commands:"
  echo "  run           Run a Python RAG script"
  echo "  update        Update the vector database"
  echo "  query         Query the RAG system"
  echo "  shell         Start Python shell with virtual environment"
  echo ""
  echo "Examples:"
  echo "  $0 run libs/rag/src/rag_framework.py"
  echo "  $0 update docs/"
  echo "  $0 query 'How does the RAG system work?'"
else
  case "$1" in
    run)
      shift
      python "$@"
      ;;
    update)
      shift
      python "$SCRIPT_DIR/libs/rag/src/update_vector_db.py" "$@"
      ;;
    query)
      shift
      python "$SCRIPT_DIR/libs/rag/src/query_rag.py" "$@"
      ;;
    shell)
      python
      ;;
    *)
      python "$@"
      ;;
  esac
fi

# Deactivate virtual environment
deactivate
