#!/bin/bash

# Create About Launcher
# ====================
# Simple launcher for the interactive about profile creation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not found"
    exit 1
fi

# Find the script
ABOUT_SCRIPT=""
for SCRIPT_PATH in \
    "$SCRIPT_DIR/create_about_simple.js" \
    "$WORKSPACE_DIR/libs/workflows/src/saar/scripts/setup/create_about_simple.js" \
    "$SCRIPT_DIR/create_about.js" \
    "$WORKSPACE_DIR/libs/workflows/src/saar/scripts/setup/create_about.js"
do
    if [ -f "$SCRIPT_PATH" ]; then
        ABOUT_SCRIPT="$SCRIPT_PATH"
        break
    fi
done

if [ -z "$ABOUT_SCRIPT" ]; then
    echo "Error: Could not find about profile creation script"
    exit 1
fi

# Set environment variables
export CONFIG_DIR="${CONFIG_DIR:-$WORKSPACE_DIR/configs}"
export WORKSPACE_DIR="${WORKSPACE_DIR}"

# Run the script
echo "Running about profile creator: $ABOUT_SCRIPT"
node "$ABOUT_SCRIPT" "$@"