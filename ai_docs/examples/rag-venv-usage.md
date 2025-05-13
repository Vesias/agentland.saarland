# RAG Virtual Environment Usage Examples

This document provides examples of how to use the RAG (Retrieval Augmented Generation) system with Python virtual environments in the Claude Neural Framework.

## Basic Usage

### Setting Up the Environment

```bash
# Using the SAAR chain script
./saar_chain.sh rag setup

# Direct approach
./setup_rag.sh
```

### Activating the Environment

```bash
# For interactive use
source ./activate_venv.sh

# Verify activation
which python
# Should output: /path/to/project/.venv/bin/python
```

### Running RAG Queries

```bash
# Using the SAAR chain script (recommended)
./saar_chain.sh rag query "What is PEP 668?"

# Direct approach
./run_rag.sh query "What is PEP 668?"

# With additional parameters
./run_rag.sh query "What is PEP 668?" --model claude --results 5
```

This passes additional options to the query script:
- `--model`: Specifies which language model to use
- `--results`: Number of relevant documents to retrieve

### Running Custom Scripts

```bash
# Using the SAAR chain script
./saar_chain.sh rag run libs/rag/src/custom_script.py

# Direct approach
./run_rag.sh run libs/rag/src/custom_script.py
```

## Advanced Usage

### Updating the Vector Database

```bash
# Using the SAAR chain script
./saar_chain.sh rag update docs/

# Index all documents in the docs directory
./run_rag.sh update docs/

# Index specific directories
./run_rag.sh update ai_docs/templates/ specs/

# Force rebuild of the database
./run_rag.sh update docs/ --rebuild
```

### Checking Database Status

```bash
# Using the SAAR chain script
./saar_chain.sh rag run libs/rag/src/rag_framework.py

# Direct approach
./run_rag.sh run libs/rag/src/rag_framework.py
```

This runs the main RAG framework module which displays the status of all components.

### Installing Additional Packages

To install additional packages into the virtual environment:

```bash
# Activate the environment first
source ./activate_venv.sh

# Install package
pip install numpy pandas matplotlib

# Deactivate when done
deactivate

# Alternative with one-liner
./run_rag.sh run -c "import pip; pip.main(['install', 'new-package'])"
```

### Using the Python Shell

To start an interactive Python shell with the virtual environment activated:

```bash
# Using the SAAR chain script
./saar_chain.sh rag run

# Direct approach
./run_rag.sh shell
```

This gives you an interactive Python session with access to all installed packages.

## Integration Examples

### Integrating with SAAR Chain

The SAAR chain automatically uses the virtual environment for Python operations:

```bash
# Run setup with virtual environment support
./saar.sh setup

# Start all services including RAG components
./saar.sh start
```

### Integrating with Neural Framework

The Neural Framework uses RAG components via the virtual environment:

```bash
# Start the Neural Framework
./start_neural_framework.sh

# This automatically sets up and uses the virtual environment
```

## Troubleshooting

### Resetting the Environment

If you encounter issues with the virtual environment:

```bash
# Remove the virtual environment
rm -rf .venv

# Run setup again
./setup_rag.sh
```

### Environment Path Issues

If scripts can't find the virtual environment:

```bash
# Check the environment location
ls -la .venv

# Run with explicit path
VENV_DIR="$(pwd)/.venv" ./run_rag.sh query "Test query"
```

### Package Installation Errors

If you see errors when installing packages:

```bash
# Update pip in the virtual environment
source ./activate_venv.sh
pip install --upgrade pip
pip install --upgrade setuptools wheel
deactivate

# Try installation again
./run_rag.sh run -c "import pip; pip.main(['install', 'problematic-package'])"
```