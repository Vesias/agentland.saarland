# Virtual Environment Commands

## Setup Commands

- `./setup_rag.sh` - Create and set up the virtual environment with required packages
- `source ./activate_venv.sh` - Activate the virtual environment manually
- `deactivate` - Deactivate an active virtual environment

## RAG Commands

- `./run_rag.sh query "Your question here"` - Query the RAG system
- `./run_rag.sh update docs/` - Update the vector database with documents
- `./run_rag.sh run script.py` - Run a Python script with the virtual environment
- `./run_rag.sh shell` - Start a Python shell with the virtual environment

## Package Management

- `source ./activate_venv.sh && pip install package-name && deactivate` - Install a new package
- `source ./activate_venv.sh && pip list && deactivate` - List installed packages
- `source ./activate_venv.sh && pip freeze > requirements.txt && deactivate` - Export requirements

## Troubleshooting

- `python3 -m venv .venv --clear` - Recreate the virtual environment from scratch
- `sudo apt install python3-venv` - Install virtual environment support if missing
- `sudo apt install python3-pip` - Install pip if missing