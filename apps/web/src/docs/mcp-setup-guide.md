# MCP Setup Guide for agentland.saarland

## Setting up MCP Servers

MCP (Model Context Protocol) servers extend Claude's capabilities by providing access to external tools and services.

### 1. Configure MCP Servers

Create or edit your Claude configuration file:

```bash
# For macOS/Linux
~/.config/claude/claude_config.json

# For Windows
%APPDATA%\claude\claude_config.json
```

### 2. Example Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-filesystem",
      "args": ["--root", "/home/jan/agentland.saarland"]
    },
    "git": {
      "command": "mcp-git", 
      "args": ["--repo", "/home/jan/agentland.saarland"]
    },
    "sequential-thinking": {
      "command": "mcp-sequential-thinking"
    },
    "brave-search": {
      "command": "mcp-brave-search",
      "env": {
        "BRAVE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Your Project's MCP Integration

Your agentland.saarland project already has MCP integration built-in:

- **MCP Client**: `/apps/web/src/core/mcp/claude_mcp_client.js`
- **MCP Hooks**: `/apps/web/src/hooks/mcp/`
- **MCP Configuration**: `/configs/mcp/config.json`

### 4. Add MCP Servers

To add MCP servers to Claude:

```bash
# Install MCP servers globally
npm install -g @anthropic/mcp-filesystem
npm install -g @anthropic/mcp-git
npm install -g @anthropic/mcp-sequential-thinking

# Or use your project's MCP servers
cd /home/jan/agentland.saarland
npm run mcp:setup
```

### 5. Project-Specific MCP Servers

Your project includes custom MCP servers:

1. **Sequential Planner**: For complex task planning
2. **Memory Server**: For context persistence
3. **A2A Manager**: For agent-to-agent communication
4. **Color Schema Manager**: For theme management

### 6. Start MCP Server

```bash
# From your project directory
cd /home/jan/agentland.saarland
npm run mcp:start
```

### 7. Verify Configuration

After configuring, restart Claude and check:

```bash
claude mcp list
```

### 8. Using MCP in the Dashboard

Your dashboard already has MCP integration:

1. **Sequential Planner**: Available in the dashboard
2. **Brave Search**: Search functionality
3. **Image Generation**: AI image creation
4. **Daily Rewards**: Game state management

### Example: Adding Your Project's MCP Server

```json
{
  "mcpServers": {
    "agentland": {
      "command": "node",
      "args": ["/home/jan/agentland.saarland/libs/mcp/src/start_server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 9. Quick Setup Script

```bash
#!/bin/bash
# setup-mcp.sh

# Create config directory
mkdir -p ~/.config/claude

# Create MCP config
cat > ~/.config/claude/claude_config.json << EOF
{
  "mcpServers": {
    "agentland": {
      "command": "node",
      "args": ["$HOME/agentland.saarland/libs/mcp/src/start_server.js"]
    }
  }
}
EOF

echo "MCP configuration created successfully!"
```

### 10. Test MCP Connection

Once configured, test the connection:

```bash
# In Claude
mcp status
mcp test agentland
```

## Next Steps

1. Configure MCP servers based on your needs
2. Use the dashboard's built-in MCP features
3. Develop custom MCP servers for specific functionality