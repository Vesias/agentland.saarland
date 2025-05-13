#!/bin/bash

# Neural Framework Starter
# ========================
#
# This script is the main entry point for starting the Claude Neural Framework
# It integrates the SAAR chain with all MCP servers and dashboard components

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
FRAMEWORK_ROOT="$(pwd)"
SAAR_PATH="$FRAMEWORK_ROOT/libs/workflows/src/saar"
CONFIG_DIR="$HOME/.claude"
PROCESSES_FILE="$CONFIG_DIR/processes.json"
LOG_DIR="$CONFIG_DIR/logs"

# Create required directories
mkdir -p "$LOG_DIR"

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
  echo -e "${CYAN}${BOLD}Claude Neural Framework - ONE Agentic OS${NC}"
  echo -e "${BLUE}Neural Framework Initialization${NC}"
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
  log "INFO" "Starting MCP servers..."
  
  # Create processes array if it doesn't exist
  if [ ! -f "$PROCESSES_FILE" ]; then
    echo '{"processes": []}' > "$PROCESSES_FILE"
  fi
  
  # Sequential Thinking MCP Server
  if [ -f "$CONFIG_DIR/bin/mcp_servers/sequential_thinking.js" ]; then
    log "INFO" "Starting Sequential Thinking MCP Server"
    node "$CONFIG_DIR/bin/mcp_servers/sequential_thinking.js" > "$LOG_DIR/sequential_thinking.log" 2>&1 &
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
  if [ -f "$CONFIG_DIR/bin/mcp_servers/context7.js" ]; then
    log "INFO" "Starting Context7 MCP Server"
    node "$CONFIG_DIR/bin/mcp_servers/context7.js" > "$LOG_DIR/context7.log" 2>&1 &
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
  if [ -f "$CONFIG_DIR/bin/mcp_servers/memory_bank.js" ]; then
    log "INFO" "Starting Memory Bank MCP Server"
    node "$CONFIG_DIR/bin/mcp_servers/memory_bank.js" > "$LOG_DIR/memory_bank.log" 2>&1 &
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

# Start dashboard
start_dashboard() {
  log "INFO" "Starting Neural Framework Dashboard..."
  
  # Check if dashboard server script exists
  if [ -f "$CONFIG_DIR/bin/start-dashboard.sh" ]; then
    # Run the dashboard in the background
    bash "$CONFIG_DIR/bin/start-dashboard.sh" &
    DASHBOARD_PID=$!
    log "SUCCESS" "Dashboard started with PID: $DASHBOARD_PID"
    
    # Add to processes file
    local temp_file=$(mktemp)
    jq ".processes += [{\"name\": \"dashboard\", \"pid\": $DASHBOARD_PID, \"type\": \"dashboard\"}]" "$PROCESSES_FILE" > "$temp_file"
    mv "$temp_file" "$PROCESSES_FILE"
  else
    log "ERROR" "Dashboard server script not found: $CONFIG_DIR/bin/start-dashboard.sh"
  fi
}

# Start SAAR chain
start_saar_chain() {
  log "INFO" "Starting SAAR chain..."
  
  # Check if SAAR chain exists
  if [ -f "$SAAR_PATH/saar_chain.sh" ]; then
    # Run status check to verify setup
    bash "$SAAR_PATH/saar_chain.sh" status
    
    log "SUCCESS" "SAAR chain verified"
  else
    log "ERROR" "SAAR chain not found: $SAAR_PATH/saar_chain.sh"
    return 1
  fi
  
  return 0
}

# Start vector database
start_vector_db() {
  log "INFO" "Starting Vector Database initialization check..."
  
  # Check if vector database is initialized
  if [ -f "$CONFIG_DIR/vectordb/metadata.json" ]; then
    log "SUCCESS" "Vector database already initialized"
  else
    log "INFO" "Initializing vector database..."
    
    # Check if initialization script exists
    if [ -f "$CONFIG_DIR/bin/init_vectordb.js" ]; then
      node "$CONFIG_DIR/bin/init_vectordb.js"
      
      if [ $? -eq 0 ]; then
        log "SUCCESS" "Vector database initialized successfully"
      else
        log "ERROR" "Failed to initialize vector database"
      fi
    else
      log "ERROR" "Vector database initialization script not found: $CONFIG_DIR/bin/init_vectordb.js"
    fi
  fi
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

# Check status
check_status() {
  log "INFO" "Checking system status..."
  
  # MCP servers
  local mcp_count=$(jq '.processes | map(select(.type == "mcp")) | length' "$PROCESSES_FILE" 2>/dev/null || echo "0")
  
  log "INFO" "MCP servers running: $mcp_count"
  
  # Dashboard
  local dashboard_running=$(jq '.processes | map(select(.type == "dashboard")) | length' "$PROCESSES_FILE" 2>/dev/null || echo "0")
  
  if [ "$dashboard_running" -gt 0 ]; then
    log "INFO" "Dashboard is running"
  else
    log "WARN" "Dashboard is not running"
  fi
  
  # Vector database
  if [ -f "$CONFIG_DIR/vectordb/metadata.json" ]; then
    log "INFO" "Vector database is initialized"
  else
    log "WARN" "Vector database is not initialized"
  fi
  
  # SAAR chain
  if [ -f "$SAAR_PATH/saar_chain.sh" ]; then
    log "INFO" "SAAR chain is available"
    bash "$SAAR_PATH/saar_chain.sh" status
  else
    log "WARN" "SAAR chain is not available"
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
      
      # Start all components
      start_vector_db
      start_mcp_servers
      start_dashboard
      start_saar_chain
      
      log "SUCCESS" "Neural Framework started successfully"
      log "INFO" "Use 'start_neural_framework.sh status' to check status"
      log "INFO" "Press Ctrl+C to stop all components"
      
      # Keep script running
      while true; do
        sleep 1
      done
      ;;
      
    stop)
      show_banner
      
      # Stop all components
      stop_processes
      
      log "SUCCESS" "Neural Framework stopped successfully"
      ;;
      
    restart)
      show_banner
      
      # Stop all components
      stop_processes
      
      # Start all components
      start_vector_db
      start_mcp_servers
      start_dashboard
      start_saar_chain
      
      log "SUCCESS" "Neural Framework restarted successfully"
      log "INFO" "Use 'start_neural_framework.sh status' to check status"
      log "INFO" "Press Ctrl+C to stop all components"
      
      # Keep script running
      while true; do
        sleep 1
      done
      ;;
      
    status)
      show_banner
      
      # Check status
      check_status
      ;;
      
    help|*)
      show_banner
      
      echo "Usage: $0 [command]"
      echo
      echo "Commands:"
      echo "  start    Start all components"
      echo "  stop     Stop all components"
      echo "  restart  Restart all components"
      echo "  status   Check system status"
      echo "  help     Show this help message"
      echo
      ;;
  esac
}

# Execute main function
main "$@"