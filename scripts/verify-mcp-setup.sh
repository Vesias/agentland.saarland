#!/bin/bash

echo "🔍 Verifying agentland.saarland MCP Setup..."
echo ""

# Check if MCP config exists
if [ -f ~/.config/claude/claude_config.json ]; then
    echo "✅ Claude MCP configuration found"
    echo "   Location: ~/.config/claude/claude_config.json"
    
    # Check if agentland-saarland server is configured
    if grep -q "agentland-saarland" ~/.config/claude/claude_config.json; then
        echo "✅ agentland.saarland MCP server is configured"
    else
        echo "❌ agentland.saarland MCP server not found in configuration"
    fi
else
    echo "❌ Claude MCP configuration not found"
    echo "   Expected location: ~/.config/claude/claude_config.json"
fi

echo ""

# Check if MCP server files exist
if [ -f "/home/jan/agentland.saarland/libs/mcp/src/start_server.js" ]; then
    echo "✅ MCP server script exists"
else
    echo "❌ MCP server script not found"
fi

echo ""

# Check other MCP files
MCP_FILES=(
    "libs/mcp/src/api.js"
    "libs/mcp/src/a2a_manager.js"
    "libs/mcp/src/git_agent.js"
    "libs/mcp/src/memory_server.js"
    "libs/mcp/src/color_schema_manager.js"
)

echo "MCP Server Components:"
for file in "${MCP_FILES[@]}"; do
    if [ -f "/home/jan/agentland.saarland/$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file"
    fi
done

echo ""
echo "To start the MCP server for agentland.saarland, run:"
echo "  cd /home/jan/agentland.saarland"
echo "  node libs/mcp/src/start_server.js"
echo ""
echo "Restart Claude to load the new MCP configuration."