#!/bin/bash

# AGENT_LAND.SAARLAND MCP Server Startup Script

echo "🚀 Starting AGENT_LAND.SAARLAND MCP Servers..."

# Set project root
export PROJECT_ROOT="/home/jan/agentland.saarland"
cd $PROJECT_ROOT

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start MCP servers
echo "Starting main MCP server..."
node libs/mcp/src/start_server.js &
MCP_MAIN_PID=$!

echo "Starting Git Agent..."
node libs/mcp/src/git_agent.js &
GIT_AGENT_PID=$!

echo "Starting A2A Manager..."
A2A_PORT=8888 A2A_HOST=localhost node libs/mcp/src/a2a_manager.js &
A2A_PID=$!

echo "Starting Memory Server..."
node libs/mcp/src/memory_server.js &
MEMORY_PID=$!

echo "✅ MCP Servers started successfully!"
echo "Main MCP: PID $MCP_MAIN_PID"
echo "Git Agent: PID $GIT_AGENT_PID"
echo "A2A Manager: PID $A2A_PID"
echo "Memory Server: PID $MEMORY_PID"

# Save PIDs for shutdown
echo $MCP_MAIN_PID > /tmp/mcp-main.pid
echo $GIT_AGENT_PID > /tmp/mcp-git.pid
echo $A2A_PID > /tmp/mcp-a2a.pid
echo $MEMORY_PID > /tmp/mcp-memory.pid

echo ""
echo "To stop all servers, run: ./scripts/stop-mcp-servers.sh"
echo ""

# Keep script running
wait