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

## Handling Externally-Managed Environment

The system automatically handles "externally-managed-environment" errors by using the virtual environment. This occurs when pip tries to install packages directly into the system Python environment, which is prevented in modern Python distributions for security.

When this error is detected:

1. The system will automatically fall back to using the virtual environment
2. Required packages will be installed in the virtual environment
3. The script will continue execution using the virtual environment

Example scenario:

```bash
# This command would normally fail with "externally-managed-environment" error
./libs/workflows/src/saar/startup/01_dependency_check.sh

# But the script detects the error and uses the virtual environment instead
# Output will show something like:
# [WARN] Detected externally-managed-environment error in Python
# [INFO] Using setup_rag.sh for Python package installation
# [SUCCESS] Successfully installed packages in virtual environment
```

## Troubleshooting

### Common Issues

1. **Virtual Environment Not Found**
   
   ```bash
   # Re-create the virtual environment
   ./setup_rag.sh --force
   ```

2. **Missing Python Packages**
   
   ```bash
   # Install required packages
   source ./activate_venv.sh
   pip install anthropic requests
   deactivate
   ```

3. **Permission Issues**
   
   ```bash
   # Fix permissions
   chmod +x ./setup_rag.sh ./run_rag.sh ./activate_venv.sh
   ```

4. **Path Issues**
   
   ```bash
   # Ensure you're in the project root directory
   cd /path/to/project/root
   ./saar_chain.sh rag setup
   ```

5. **Package Installation Errors**

   ```bash
   # Update pip in the virtual environment
   source ./activate_venv.sh
   pip install --upgrade pip
   pip install --upgrade setuptools wheel
   deactivate

   # Try installation again
   ./run_rag.sh run -c "import pip; pip.main(['install', 'problematic-package'])"
   ```