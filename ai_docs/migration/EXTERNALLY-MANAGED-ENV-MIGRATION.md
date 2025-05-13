# Externally-Managed Environment Migration Guide

## Overview

This document outlines the migration process from direct system Python package installation to using virtual environments in accordance with PEP 668, which defines the "externally-managed-environment" feature in modern Python distributions.

## Background

Python 3.11+ in many Linux distributions (including Kali Linux, Debian 12+, Ubuntu 22.04+) implements PEP 668, which prevents pip from installing packages directly into the system Python environment. This is a security feature to prevent conflicts with packages managed by the system package manager.

## Migration Steps

### 1. Detect Environment Status

Before migration, determine if your environment is externally managed:

```bash
python3 -m pip install --user some-package
```

If you see an error containing "externally-managed-environment", migration is required.

### 2. Create Virtual Environment Structure

```bash
# Create .venv directory in project root
python3 -m venv .venv

# Create activation helper script
cat > activate_venv.sh << 'EOF'
#!/bin/bash
source .venv/bin/activate
echo "Virtual environment activated. Run 'deactivate' to exit."
EOF
chmod +x activate_venv.sh
```

### 3. Migrate Package Requirements

```bash
# Activate environment
source .venv/bin/activate

# Install required packages
pip install anthropic requests

# Install optional RAG packages if needed
pip install lancedb chromadb sentence-transformers voyage

# Deactivate environment
deactivate
```

### 4. Update Scripts to Use Virtual Environment

For each script that uses Python packages:

1. **Method 1: Source Activation at Beginning**

   ```bash
   #!/bin/bash
   source .venv/bin/activate
   python script.py
   deactivate
   ```

2. **Method 2: Use Python Path Directly**

   ```bash
   #!/bin/bash
   .venv/bin/python script.py
   ```

3. **Method 3: Use Runner Script**

   ```bash
   ./run_rag.sh run script.py
   ```

### 5. Update Framework Components

The following components need updates to use the virtual environment:

1. **SAAR Setup Chain**: Modified to detect and handle virtual environment creation
2. **Dependency Check Script**: Updated to check packages in virtual environment
3. **Run Command**: Enhanced to use virtual environment for Python scripts
4. **Error Handling**: Improved to provide guidance for environment-related errors

### 6. Test Migration

Test all Python-dependent functionality to ensure it works with the virtual environment:

1. RAG functionality
2. Document indexing
3. API calls
4. Any scripts using Python packages

## Troubleshooting

### Common Issues

1. **Missing venv Module**

   ```bash
   sudo apt-get install python3-venv
   ```

2. **Permission Issues**

   ```bash
   # Check directory permissions
   ls -la .venv
   
   # Fix if needed
   chmod -R u+w .venv
   ```

3. **Path Issues**

   If scripts can't find the virtual environment, ensure they use absolute paths:

   ```bash
   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   VENV_DIR="$SCRIPT_DIR/.venv"
   source "$VENV_DIR/bin/activate"
   ```

## Verifying Migration Success

After migration, run the migration verification test:

```bash
./setup_rag.sh && ./run_rag.sh query "Test query"
```

The command should complete without any "externally-managed-environment" errors.

## Reverting Changes (if necessary)

In case the migration needs to be reverted:

1. Remove the virtual environment: `rm -rf .venv`
2. Restore original scripts from backup
3. Use system packages with the `--break-system-packages` flag (not recommended)

## References

1. [PEP 668 - Marking Python base environments as "externally managed"](https://peps.python.org/pep-0668/)
2. [Kali Linux Python External Packages Documentation](https://www.kali.org/docs/general-use/python3-external-packages/)
3. [Python venv module documentation](https://docs.python.org/3/library/venv.html)