#!/bin/bash
set -e
# Python Environment Checker Script
# Runs both system Python and virtual environment Python checks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/../scripts/.venv" # Points to the venv created by setup_rag.sh
CHECK_SCRIPT="$SCRIPT_DIR/../src/check_env_status.py" # Points to the script in libs/rag/src

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Show banner
echo -e "${BLUE}${BOLD}Python Environment Checker${NC}"
echo -e "${BLUE}=============================${NC}"
echo ""

# Check if the script exists
if [ ! -f "$CHECK_SCRIPT" ]; then
  echo -e "${RED}Error: Environment checker script not found: $CHECK_SCRIPT${NC}"
  exit 1
fi

# Make the script executable
chmod +x "$CHECK_SCRIPT"

# Check system Python
echo -e "${BOLD}Checking System Python:${NC}"
echo "--------------------------------"
python3 "$CHECK_SCRIPT"

# Check virtual environment Python if it exists
if [ -f "$VENV_DIR/bin/python" ]; then
  echo ""
  echo -e "${BOLD}Checking Virtual Environment Python:${NC}"
  echo "--------------------------------"
  "$VENV_DIR/bin/python" "$CHECK_SCRIPT"
else
  echo ""
  echo -e "${YELLOW}Virtual environment not found at $VENV_DIR${NC}"
  echo "Run './setup_rag.sh' to create the virtual environment"
fi

# Provide instructions
echo ""
echo -e "${BOLD}What to do:${NC}"
echo "1. If system Python is externally managed, use virtual environment for packages"
echo "2. Run './setup_rag.sh' to set up the virtual environment"
echo "3. Use './run_rag.sh' for running Python scripts in the virtual environment"
echo "4. Use './saar_chain.sh rag status' to check the full RAG system status"
echo ""