#!/bin/bash

# Claude Neural Framework - Local Starter
# This script starts the Neural Framework from the current directory

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
CURRENT_DIR="$(pwd)"
CONFIG_FILE="$CURRENT_DIR/mcp_config.json"
LOG_DIR="$CURRENT_DIR/logs"
PROCESSES_FILE="$CURRENT_DIR/processes.json"

# Create necessary directories
mkdir -p "$LOG_DIR"

# Initialize processes file if it doesn't exist
if [ ! -f "$PROCESSES_FILE" ]; then
  echo '{"processes": []}' > "$PROCESSES_FILE"
fi

# Banner function
show_banner() {
  echo -e "${PURPLE}${BOLD}"
  echo "  █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗     ██████╗ ███████╗"
  echo " ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝    ██╔═══██╗██╔════╝"
  echo " ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║██║         ██║   ██║███████╗"
  echo " ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██║         ██║   ██║╚════██║"
  echo " ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╗    ╚██████╔╝███████║"
  echo " ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝     ╚═════╝ ╚══════╝"                                                           
  echo -e "${NC}"
  echo -e "${CYAN}${BOLD}Claude Neural Framework - Local Mode${NC}"
  echo -e "${BLUE}Working from: ${CURRENT_DIR}${NC}"
  echo "Version: 2.1.0"
  echo
}

# Log function
log() {
  local level=$1
  local message=$2
  
  # Get timestamp
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  
  # Print to console
  case $level in
    INFO)
      echo -e "${GREEN}[INFO]${NC} $message"
      ;;
    WARN)
      echo -e "${YELLOW}[WARN]${NC} $message"
      ;;
    ERROR)
      echo -e "${RED}[ERROR]${NC} $message"
      ;;
    SUCCESS)
      echo -e "${CYAN}[SUCCESS]${NC} $message"
      ;;
    DEBUG)
      echo -e "${BLUE}[DEBUG]${NC} $message"
      ;;
    *)
      echo -e "$message"
      ;;
  esac
  
  # Log to file
  echo "[$timestamp] [$level] $message" >> "$LOG_DIR/neural_framework.log"
}

# Start MCP servers
start_mcp_servers() {
  log "INFO" "Starting MCP servers from local directory..."
  
  # Sequential Thinking MCP Server
  if [ -f "$CURRENT_DIR/mcp_servers/sequential_thinking.js" ]; then
    log "INFO" "Starting Sequential Thinking MCP Server"
    node "$CURRENT_DIR/mcp_servers/sequential_thinking.js" > "$LOG_DIR/sequential_thinking.log" 2>&1 &
    SEQUENTIAL_PID=$!
    log "SUCCESS" "Sequential Thinking MCP Server started with PID: $SEQUENTIAL_PID"
    
    # Add to processes file
    local temp_file=$(mktemp)
    jq ".processes += [{\"name\": \"sequential_thinking\", \"pid\": $SEQUENTIAL_PID, \"type\": \"mcp\"}]" "$PROCESSES_FILE" > "$temp_file"
    mv "$temp_file" "$PROCESSES_FILE"
  else
    log "WARN" "Sequential Thinking MCP Server not found"
  fi
  
  # Context7 MCP Server
  if [ -f "$CURRENT_DIR/mcp_servers/context7.js" ]; then
    log "INFO" "Starting Context7 MCP Server"
    node "$CURRENT_DIR/mcp_servers/context7.js" > "$LOG_DIR/context7.log" 2>&1 &
    CONTEXT_PID=$!
    log "SUCCESS" "Context7 MCP Server started with PID: $CONTEXT_PID"
    
    # Add to processes file
    local temp_file=$(mktemp)
    jq ".processes += [{\"name\": \"context7\", \"pid\": $CONTEXT_PID, \"type\": \"mcp\"}]" "$PROCESSES_FILE" > "$temp_file"
    mv "$temp_file" "$PROCESSES_FILE"
  else
    log "WARN" "Context7 MCP Server not found"
  fi
  
  # Memory Bank MCP Server
  if [ -f "$CURRENT_DIR/mcp_servers/memory_bank.js" ]; then
    log "INFO" "Starting Memory Bank MCP Server"
    node "$CURRENT_DIR/mcp_servers/memory_bank.js" > "$LOG_DIR/memory_bank.log" 2>&1 &
    MEMORY_PID=$!
    log "SUCCESS" "Memory Bank MCP Server started with PID: $MEMORY_PID"
    
    # Add to processes file
    local temp_file=$(mktemp)
    jq ".processes += [{\"name\": \"memory_bank\", \"pid\": $MEMORY_PID, \"type\": \"mcp\"}]" "$PROCESSES_FILE" > "$temp_file"
    mv "$temp_file" "$PROCESSES_FILE"
  else
    log "WARN" "Memory Bank MCP Server not found"
  fi
  
  log "INFO" "MCP servers started"
}

# Stop all processes
stop_processes() {
  log "INFO" "Stopping all processes..."
  
  # Check if processes file exists
  if [ -f "$PROCESSES_FILE" ]; then
    # Read each process and kill it
    for pid in $(jq -r '.processes[].pid' "$PROCESSES_FILE"); do
      local name=$(jq -r ".processes[] | select(.pid == $pid) | .name" "$PROCESSES_FILE")
      
      log "INFO" "Stopping $name (PID: $pid)..."
      kill -9 $pid 2>/dev/null
      
      if [ $? -eq 0 ]; then
        log "SUCCESS" "Process $name (PID: $pid) stopped"
      else
        log "WARN" "Failed to stop process $name (PID: $pid)"
      fi
    done
    
    # Clear processes file
    echo '{"processes": []}' > "$PROCESSES_FILE"
    
    log "SUCCESS" "All processes stopped"
  else
    log "WARN" "No processes file found: $PROCESSES_FILE"
  fi
}

# Create cleanup function
cleanup() {
  log "INFO" "Neural Framework shutting down..."
  
  # Stop all processes
  stop_processes
  
  log "SUCCESS" "Neural Framework shutdown complete"
  exit 0
}

# Register signal handler
trap cleanup SIGINT SIGTERM

# Main function
main() {
  # Parse command line arguments
  local command=${1:-"start"}
  
  case "$command" in
    start)
      show_banner
      
      # Start MCP servers
      start_mcp_servers
      
      log "SUCCESS" "Local MCP servers started successfully"
      log "INFO" "MCP Servers are now available at:"
      log "INFO" "- Sequential Thinking: http://localhost:3020"
      log "INFO" "- Context7: http://localhost:3021"
      log "INFO" "- Memory Bank: http://localhost:3022"
      log "INFO" "Press Ctrl+C to stop all servers"
      
      # Keep script running
      while true; do
        sleep 1
      done
      ;;
      
    stop)
      show_banner
      
      # Stop all processes
      stop_processes
      
      log "SUCCESS" "Local MCP servers stopped successfully"
      ;;
      
    restart)
      show_banner
      
      # Stop all processes
      stop_processes
      
      # Start MCP servers
      start_mcp_servers
      
      log "SUCCESS" "Local MCP servers restarted successfully"
      log "INFO" "MCP Servers are now available at:"
      log "INFO" "- Sequential Thinking: http://localhost:3020"
      log "INFO" "- Context7: http://localhost:3021"
      log "INFO" "- Memory Bank: http://localhost:3022"
      log "INFO" "Press Ctrl+C to stop all servers"
      
      # Keep script running
      while true; do
        sleep 1
      done
      ;;
      
    status)
      show_banner
      
      # Check MCP server processes
      local mcp_count=$(jq '.processes | map(select(.type == "mcp")) | length' "$PROCESSES_FILE" 2>/dev/null || echo "0")
      
      log "INFO" "Local MCP servers status:"
      log "INFO" "- MCP servers running: $mcp_count"
      
      # Check individual servers
      if jq -e '.processes[] | select(.name == "sequential_thinking")' "$PROCESSES_FILE" > /dev/null; then
        local sequential_pid=$(jq -r '.processes[] | select(.name == "sequential_thinking") | .pid' "$PROCESSES_FILE")
        if ps -p $sequential_pid > /dev/null; then
          log "SUCCESS" "Sequential Thinking server is running (PID: $sequential_pid)"
        else
          log "WARN" "Sequential Thinking server is not running"
        fi
      else
        log "WARN" "Sequential Thinking server is not configured"
      fi
      
      if jq -e '.processes[] | select(.name == "context7")' "$PROCESSES_FILE" > /dev/null; then
        local context_pid=$(jq -r '.processes[] | select(.name == "context7") | .pid' "$PROCESSES_FILE")
        if ps -p $context_pid > /dev/null; then
          log "SUCCESS" "Context7 server is running (PID: $context_pid)"
        else
          log "WARN" "Context7 server is not running"
        fi
      else
        log "WARN" "Context7 server is not configured"
      fi
      
      if jq -e '.processes[] | select(.name == "memory_bank")' "$PROCESSES_FILE" > /dev/null; then
        local memory_pid=$(jq -r '.processes[] | select(.name == "memory_bank") | .pid' "$PROCESSES_FILE")
        if ps -p $memory_pid > /dev/null; then
          log "SUCCESS" "Memory Bank server is running (PID: $memory_pid)"
        else
          log "WARN" "Memory Bank server is not running"
        fi
      else
        log "WARN" "Memory Bank server is not configured"
      fi
      ;;
      
    help|*)
      show_banner
      
      echo "Usage: $0 [command]"
      echo
      echo "Commands:"
      echo "  start    Start all MCP servers"
      echo "  stop     Stop all MCP servers"
      echo "  restart  Restart all MCP servers"
      echo "  status   Check MCP servers status"
      echo "  help     Show this help message"
      echo
      ;;
  esac
}

# Execute main function
main "$@"