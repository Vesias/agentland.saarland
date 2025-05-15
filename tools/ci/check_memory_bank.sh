#!/bin/bash
MEMORY_BANK_DIR=$1

if [ -z "$MEMORY_BANK_DIR" ]; then
  echo "Usage: $0 <memory_bank_directory>"
  exit 1
fi

echo "Memory Bank Completeness Check for $MEMORY_BANK_DIR (Placeholder)"

CORE_FILES=(
  "projectbrief.md"
  "productContext.md"
  "systemPatterns.md"
  "techContext.md"
  "activeContext.md"
  "progress.md"
)
ERROR_FOUND=0

for core_file in "${CORE_FILES[@]}"; do
  file_path="$MEMORY_BANK_DIR/$core_file"
  if [ ! -f "$file_path" ]; then
    echo "ERROR: Core Memory Bank file '$file_path' is missing."
    ERROR_FOUND=1
  elif [ ! -s "$file_path" ]; then # Check if file is not empty (-s)
    echo "WARNING: Core Memory Bank file '$file_path' is empty."
    # Depending on policy, this could also be an error.
    # ERROR_FOUND=1 
  fi
done

if [ "$ERROR_FOUND" -eq 1 ]; then
  echo "Memory Bank Completeness Check FAILED."
  exit 1
else
  echo "Memory Bank Completeness Check (Placeholder) PASSED for $MEMORY_BANK_DIR"
  exit 0
fi
