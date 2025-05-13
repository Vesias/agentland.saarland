# Python Modules Organization

## Overview

This document outlines the organization of Python modules within the Claude Neural Framework, with a focus on ensuring consistent structure and virtual environment integration.

## Directory Structure

All Python code is organized according to the following structure:

```
project_root/
├── .venv/                   # Python virtual environment
├── libs/                    # Libraries and core components
│   ├── rag/                 # Retrieval Augmented Generation
│   │   ├── src/             # Source code
│   │   │   ├── __init__.py  # Package marker
│   │   │   ├── rag_framework.py
│   │   │   ├── query_rag.py
│   │   │   └── update_vector_db.py
│   │   └── test/            # Test code
│   │       └── __init__.py  # Package marker
│   ├── core/                # Core functionality
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   └── ...
│   │   └── test/
│   └── ...
├── apps/                    # Applications
│   ├── api/                 # API application
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   └── ...
│   │   └── test/
│   └── ...
├── configs/                 # Configuration
│   ├── python/              # Python-specific configuration
│   │   └── venv_config.json # Virtual environment configuration
│   └── ...
└── scripts/                 # Helper scripts
    ├── setup_rag.sh         # Setup script for RAG
    ├── run_rag.sh           # Runner script for RAG
    └── ...
```

## Module Organization Guidelines

### 1. Package Structure

All Python code should be organized as proper packages with `__init__.py` files:

```python
"""
Package/module docstring describing the purpose
"""

__version__ = "x.y.z"  # Optional version information
```

### 2. Code Location

- **Library Code**: Store in `libs/<module>/src/`
- **Application Code**: Store in `apps/<app>/src/`
- **Test Code**: Store in `*/test/` parallel to `src/`
- **Configuration**: Store in `configs/python/`

### 3. Import Conventions

Use absolute imports with the package name:

```python
# Good
from libs.rag.src import rag_framework

# Avoid
import rag_framework  # Unclear source
```

### 4. Module Naming

- Use lowercase names with underscores for modules
- Use descriptive names that indicate functionality
- Avoid generic names like `utils.py` without qualification

### 5. Package Documentation

Each package should include:

- Docstring in `__init__.py` describing the package
- Version information
- List of public interfaces (optional)

## Virtual Environment Integration

### 1. Package Installation

All Python packages should be installed into the virtual environment:

```bash
# Activate environment
source .venv/bin/activate

# Install package
pip install package-name

# Deactivate when done
deactivate
```

### 2. Development Mode Installation

For development, install packages in editable mode:

```bash
# Activate environment
source .venv/bin/activate

# Install in development mode
pip install -e .

# Deactivate when done
deactivate
```

### 3. Script Integration

All scripts that invoke Python should use the virtual environment:

```bash
#!/bin/bash
source .venv/bin/activate
python libs/rag/src/query_rag.py "$@"
deactivate
```

or use the runner script:

```bash
./run_rag.sh query "How does it work?"
```

## Migration Process

When migrating existing Python code:

1. Organize into proper package structure with `__init__.py` files
2. Move to correct location within `libs/<module>/src/`
3. Update imports to use absolute paths
4. Add proper docstrings and package information
5. Update any scripts to use the virtual environment

## Verification Checklist

- [ ] Code is organized in proper package structure
- [ ] `__init__.py` files exist with docstrings
- [ ] Imports use proper absolute paths
- [ ] Scripts correctly use the virtual environment
- [ ] Configuration is properly separated
- [ ] Tests are in separate directories
- [ ] No circular imports
- [ ] No duplicate functionality across packages