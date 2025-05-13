# RAG-SAAR Integration Guide

## Overview

This document outlines the integration of the Retrieval Augmented Generation (RAG) system with the SAAR Chain workflow. The integration enables seamless handling of Python virtual environments as required by PEP 668 ("externally-managed-environment") in modern Python distributions.

## Integration Points

### 1. SAAR Chain Script

The main `saar_chain.sh` script has been updated to include RAG-specific commands:

```bash
./saar_chain.sh rag setup     # Set up RAG environment and dependencies
./saar_chain.sh rag run       # Run a RAG script directly
./saar_chain.sh rag update    # Update the vector database with new documents
./saar_chain.sh rag query     # Query the RAG system
```

### 2. Error Handling

The error handling system in `00_common.sh` now automatically detects "externally-managed-environment" errors and:

1. Attempts to use `setup_rag.sh` if available
2. Falls back to creating a virtual environment directly if needed
3. Installs packages in the virtual environment
4. Returns success once packages are installed

### 3. Dependency Checking

The dependency checking system in `01_dependency_check.sh` has been enhanced to:

1. Detect if a virtual environment is needed
2. Use `setup_rag.sh` for environment setup if available
3. Fall back to manual virtual environment creation if needed
4. Create helper scripts for activation and running

## Usage Examples

### Setting Up RAG Environment

```bash
./saar_chain.sh rag setup
```

This command will:
- Create a Python virtual environment in `.venv/`
- Install required packages (anthropic, requests)
- Optionally install vector database packages
- Create helper scripts for environment activation and usage

### Running RAG Commands

```bash
# Query the RAG system
./saar_chain.sh rag query "How does the security framework work?"

# Update the vector database
./saar_chain.sh rag update docs/

# Run a specific RAG script
./saar_chain.sh rag run libs/rag/src/custom_script.py
```

## Implementation Details

### Virtual Environment Detection

The system checks for the existence of `.venv/` and creates it if needed. This avoids the "externally-managed-environment" error in modern Python distributions.

### Command Proxying

RAG commands are proxied through to the `run_rag.sh` script, which:
1. Activates the virtual environment
2. Sets the correct PYTHONPATH
3. Runs the requested command
4. Deactivates the environment

### Error Recovery

If a Python package installation fails due to the externally-managed-environment error, the system:
1. Captures the error
2. Creates a virtual environment
3. Installs the packages there instead
4. Continues execution

## Testing the Integration

To verify the integration is working correctly:

```bash
# Test basic setup
./saar_chain.sh rag setup

# Test querying
./saar_chain.sh rag query "Test query"

# Test running a script
./saar_chain.sh rag run libs/rag/src/rag_framework.py
```

## Troubleshooting

### Common Issues

1. **Missing venv Module**
   ```bash
   sudo apt-get install python3-venv
   ```

2. **Permission Issues**
   ```bash
   chmod -R u+w .venv
   ```

3. **Python Not Found**
   ```bash
   # Check Python installation
   which python3
   python3 --version
   ```

4. **Module Installation Errors**
   If you encounter errors installing specific modules, try installing them manually:
   ```bash
   source .venv/bin/activate
   pip install <package-name>
   deactivate
   ```

## References

1. [PEP 668 - Marking Python base environments as "externally managed"](https://peps.python.org/pep-0668/)
2. [Python venv module documentation](https://docs.python.org/3/library/venv.html)