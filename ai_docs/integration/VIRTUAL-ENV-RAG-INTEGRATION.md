# Virtual Environment RAG Integration

## Overview

This document describes the integration of Retrieval Augmented Generation (RAG) components into the Claude Neural Framework using a dedicated Python virtual environment to avoid "externally-managed-environment" errors in modern Linux distributions.

## Background

Modern Python installations in distributions like Kali Linux implement PEP 668, which prevents installing packages directly to the system Python environment. The solution is to use virtual environments for all Python dependencies.

## Integration Components

The integration consists of the following components:

1. **Virtual Environment Setup**: Isolated Python environment in `.venv/` directory
2. **RAG Component Scripts**: Vector database and query functionality
3. **Integration Scripts**: Helper scripts to manage the virtual environment
4. **Launcher Scripts**: Simplified interfaces to run RAG functionality

## Implementation Details

### Virtual Environment Structure

```
project_root/
├── .venv/                   # Python virtual environment
├── activate_venv.sh         # Helper script to activate the environment
├── run_rag.sh               # Runner script for RAG components
├── setup_rag.sh             # Setup script for RAG environment
└── libs/rag/src/            # RAG implementation scripts
    ├── rag_framework.py     # Core RAG functionality
    ├── query_rag.py         # Query interface
    └── update_vector_db.py  # Vector database updater
```

### Environment Management

The environment is managed through the following scripts:

1. `setup_rag.sh`: Creates and configures the Python virtual environment
2. `activate_venv.sh`: Helper to activate the environment
3. `run_rag.sh`: Runner script that handles environment activation

### Dependencies

The following Python packages are installed in the virtual environment:

- **Core Dependencies**:
  - anthropic
  - requests

- **Advanced RAG Dependencies**:
  - lancedb (vector database)
  - chromadb (optional vector database)
  - voyage (embeddings library)
  - sentence-transformers (embeddings model)

### Usage Guidelines

#### Setting Up the Environment

To set up the RAG virtual environment:

```bash
./setup_rag.sh
```

#### Using RAG Components

To query the RAG system:

```bash
./run_rag.sh query "How does the system work?"
```

To update the vector database with documents:

```bash
./run_rag.sh update docs/
```

To run a custom RAG script:

```bash
./run_rag.sh run libs/rag/src/custom_script.py
```

#### Manually Activating the Environment

To manually work with the environment:

```bash
source ./activate_venv.sh
# Do work...
deactivate
```

## Integration with Framework

The RAG functionality integrates with the broader Claude Neural Framework:

1. SAAR chain script now detects externally-managed environments and uses the virtual environment
2. Neural Framework startup installs packages into the virtual environment
3. All Python-based RAG functionality is executed with the proper environment

## Troubleshooting

If you encounter "externally-managed-environment" errors, ensure:

1. You're using the provided scripts to run Python code
2. The virtual environment exists (run `setup_rag.sh` if not)
3. Your Python version supports virtual environments (install python3-venv if needed)

## Future Enhancements

- Add integration with additional vector databases
- Create specialized embeddings models for different content types
- Implement hybrid search with multiple retrieval strategies
- Add automated testing for RAG components