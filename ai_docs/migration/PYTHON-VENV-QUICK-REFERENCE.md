# Python Virtual Environment Quick Reference Guide

## Detecting Externally-Managed Environment

```bash
# Install a test package directly to see if it fails
python3 -m pip install --dry-run pytest

# If you see an error message about "externally-managed-environment", 
# your system Python is managed by the package manager
```

## Creating a Virtual Environment

```bash
# Create a virtual environment in the current directory
python3 -m venv .venv

# Create a virtual environment at a specific path
python3 -m venv /path/to/venv
```

## Activating a Virtual Environment

```bash
# Activate on Linux/macOS
source .venv/bin/activate

# Activate on Windows
.venv\Scripts\activate.bat
```

## Installing Packages in a Virtual Environment

```bash
# Upgrade pip first
pip install --upgrade pip

# Install packages
pip install anthropic requests

# Install from requirements file
pip install -r requirements.txt
```

## SAAR Chain Integration

```bash
# Setup RAG environment with virtual environment
./saar_chain.sh rag setup

# Check environment status
./saar_chain.sh rag check-env

# Run Python script in virtual environment
./saar_chain.sh rag run libs/rag/src/rag_test.py

# Query the RAG system
./saar_chain.sh rag query "What is PEP 668?"
```

## Handling Externally-Managed Environment

The Claude Neural Framework automatically handles externally-managed-environment errors by:

1. Detecting the error when it occurs in Python commands
2. Creating a virtual environment if needed
3. Installing required packages in the virtual environment
4. Running the command again in the virtual environment

For example, when running:

```bash
python3 -m pip install anthropic
```

If this fails with an externally-managed-environment error, the system:

```bash
# Creates a virtual environment
python3 -m venv .venv

# Installs packages there
.venv/bin/pip install anthropic

# Uses the virtual environment for all Python operations
```

## Common Issues and Solutions

### Missing venv Module

```bash
# Install on Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y python3-venv

# Install on RHEL/CentOS
sudo yum install -y python3-venv
```

### Permission Errors

```bash
# Fix permissions on scripts
chmod +x setup_rag.sh run_rag.sh activate_venv.sh

# Fix permissions on virtual environment
chmod -R u+w .venv
```

### Path Issues

```bash
# Always use absolute paths
VENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.venv"
```

### Package Conflicts

```bash
# Create a clean environment
rm -rf .venv
python3 -m venv .venv

# Install only necessary packages
.venv/bin/pip install anthropic requests
```