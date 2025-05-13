# Python Virtual Environment Requirements

## Overview

This document outlines the requirements and configuration for Python virtual environments in the Claude Neural Framework, with a specific focus on ensuring compatibility with PEP 668 (externally-managed-environment).

## Requirements

### Basic Requirements

1. **Python Version**: Minimum Python 3.8+
2. **Virtual Environment**: Created using the `venv` module
3. **Location**: `.venv/` in the project root directory

### Package Requirements

#### Required Packages

These packages are essential for core functionality:

```json
[
  "anthropic",
  "requests"
]
```

#### Optional Packages (by category)

Vector Database:
```json
[
  "lancedb",
  "chromadb"
]
```

Embeddings:
```json
[
  "sentence-transformers"
]
```

Data Processing:
```json
[
  "voyage",
  "numpy",
  "pandas"
]
```

#### Development Packages

```json
[
  "pytest",
  "pylint",
  "black"
]
```

### Environment Scripts

The following scripts must be available for managing the virtual environment:

1. `setup_rag.sh`: Creates and configures the virtual environment
2. `activate_venv.sh`: Activates the virtual environment for interactive use
3. `run_rag.sh`: Executes Python commands in the virtual environment context

## Integration Requirements

### SAAR Chain Integration

1. The `saar_chain.sh` script must provide the following RAG commands:
   - `rag setup`: Set up the RAG environment
   - `rag run`: Run a Python script within the RAG environment
   - `rag update`: Update the vector database
   - `rag query`: Query the RAG system

### Error Handling

1. The system must detect "externally-managed-environment" errors and automatically switch to using the virtual environment
2. Graceful handling of missing packages with clear installation instructions
3. Fallback mechanisms when required components are unavailable

### Directory Structure

```
project_root/
├── .venv/                   # Python virtual environment
├── configs/
│   └── python/
│       └── venv_config.json # Virtual environment configuration
├── libs/
│   └── rag/
│       ├── src/             # RAG implementation
│       └── test/            # RAG tests
├── activate_venv.sh         # Helper script to activate environment
├── run_rag.sh               # Helper script to run Python in environment
└── setup_rag.sh             # Setup script for environment
```

## Configuration

The virtual environment configuration is stored in `configs/python/venv_config.json` and follows this schema:

```json
{
  "version": "1.0.0",
  "venv_dir": ".venv",
  "python_version_min": "3.8.0",
  "required_packages": [...],
  "optional_packages": {
    "vector_db": [...],
    "embeddings": [...],
    "data_processing": [...]
  },
  "development_packages": [...],
  "scripts": {
    "activate": "activate_venv.sh",
    "runner": "run_rag.sh",
    "setup": "setup_rag.sh"
  },
  "environment_variables": {
    "PYTHONPATH": "${WORKSPACE_DIR}"
  },
  "paths": {
    "logs": "logs",
    "data": "data/vector_store",
    "configs": "configs/python"
  }
}
```

## Testing Verification

To verify the virtual environment is correctly set up and integrated:

1. Run `./saar_chain.sh rag setup` to setup the environment
2. Run `./saar_chain.sh rag query "Test question"` to test querying
3. Run `source ./activate_venv.sh` followed by `python -c "import anthropic; print('Success')"` to verify package installation
4. Run `pip install invalid-package-name` outside the virtual environment to verify it fails with "externally-managed-environment" error
