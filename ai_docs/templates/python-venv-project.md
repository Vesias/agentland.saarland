# Python Virtual Environment Project Template

## Project Structure

```
project_root/
├── .venv/                   # Python virtual environment
├── src/                     # Python source code
│   ├── __init__.py          # Package marker
│   ├── main.py              # Main entry point
│   └── modules/             # Project modules
│       └── __init__.py      # Package marker
├── tests/                   # Test code
│   ├── __init__.py          # Package marker
│   └── test_main.py         # Tests for main module
├── data/                    # Data directory
├── activate_venv.sh         # Helper script to activate environment
├── run.sh                   # Runner script for the project
├── setup.sh                 # Setup script for environment
└── requirements.txt         # Project dependencies
```

## Setup Script

```bash
#!/bin/bash

# Setup script for Python virtual environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required"
    exit 1
fi

# Check for venv module
if ! python3 -c "import venv" &> /dev/null; then
    echo "Error: Python venv module is required"
    echo "Install with: sudo apt install python3-venv"
    exit 1
fi

# Create virtual environment
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Update pip
python -m pip install --upgrade pip

# Install requirements
if [ -f "$SCRIPT_DIR/requirements.txt" ]; then
    echo "Installing dependencies from requirements.txt..."
    pip install -r "$SCRIPT_DIR/requirements.txt"
else
    echo "No requirements.txt found. Installing basic dependencies..."
    pip install pytest
fi

# Create activation script
cat > "$SCRIPT_DIR/activate_venv.sh" << EOF
#!/bin/bash
# Helper script to activate Python virtual environment
source "$VENV_DIR/bin/activate"
echo "Virtual environment activated. Run 'deactivate' to exit."
EOF
chmod +x "$SCRIPT_DIR/activate_venv.sh"

# Create runner script
cat > "$SCRIPT_DIR/run.sh" << EOF
#!/bin/bash
# Runner script for the project

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="\$SCRIPT_DIR/.venv"

if [ ! -f "\$VENV_DIR/bin/activate" ]; then
  echo "Error: Virtual environment not found"
  echo "Run setup.sh first"
  exit 1
fi

# Activate virtual environment
source "\$VENV_DIR/bin/activate"

# Run command or main module
if [ \$# -eq 0 ]; then
  python "\$SCRIPT_DIR/src/main.py"
else
  python "\$@"
fi

# Deactivate virtual environment
deactivate
EOF
chmod +x "$SCRIPT_DIR/run.sh"

# Create directory structure if it doesn't exist
mkdir -p "$SCRIPT_DIR/src/modules"
mkdir -p "$SCRIPT_DIR/tests"
mkdir -p "$SCRIPT_DIR/data"

# Create __init__.py files
touch "$SCRIPT_DIR/src/__init__.py"
touch "$SCRIPT_DIR/src/modules/__init__.py"
touch "$SCRIPT_DIR/tests/__init__.py"

# Create main.py if it doesn't exist
if [ ! -f "$SCRIPT_DIR/src/main.py" ]; then
    cat > "$SCRIPT_DIR/src/main.py" << EOF
#!/usr/bin/env python3
"""
Main module for the project
"""

def main():
    """Main function"""
    print("Hello from virtual environment project")

if __name__ == "__main__":
    main()
EOF
fi

# Create test_main.py if it doesn't exist
if [ ! -f "$SCRIPT_DIR/tests/test_main.py" ]; then
    cat > "$SCRIPT_DIR/tests/test_main.py" << EOF
#!/usr/bin/env python3
"""
Tests for main module
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import main

def test_main():
    """Test main function"""
    # Simple test to ensure the function runs
    main()
    assert True
EOF
fi

# Deactivate virtual environment
deactivate

echo "Setup complete"
echo "- Run './activate_venv.sh' to activate the environment"
echo "- Run './run.sh' to run the main script"
echo "- Run './run.sh src/other_script.py' to run other scripts"
```

## Activation Script

```bash
#!/bin/bash
# Helper script to activate Python virtual environment
source ".venv/bin/activate"
echo "Virtual environment activated. Run 'deactivate' to exit."
```

## Runner Script

```bash
#!/bin/bash
# Runner script for the project

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -f "$VENV_DIR/bin/activate" ]; then
  echo "Error: Virtual environment not found"
  echo "Run setup.sh first"
  exit 1
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Run command or main module
if [ $# -eq 0 ]; then
  python "$SCRIPT_DIR/src/main.py"
else
  python "$@"
fi

# Deactivate virtual environment
deactivate
```

## Main Python Module

```python
#!/usr/bin/env python3
"""
Main module for the project
"""

def main():
    """Main function"""
    print("Hello from virtual environment project")

if __name__ == "__main__":
    main()
```

## Test Module

```python
#!/usr/bin/env python3
"""
Tests for main module
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import main

def test_main():
    """Test main function"""
    # Simple test to ensure the function runs
    main()
    assert True
```

## Requirements File

```
# Core dependencies
pytest>=7.0.0

# Project-specific dependencies
# Add your dependencies here
```

## Usage

1. Run `./setup.sh` to create the virtual environment and install dependencies
2. Run `./activate_venv.sh` to activate the environment manually
3. Run `./run.sh` to execute the main script
4. Run `./run.sh path/to/script.py` to run another script
5. Use `deactivate` to exit the activated environment