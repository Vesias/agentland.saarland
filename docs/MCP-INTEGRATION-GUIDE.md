# MCP Integration Guide for AGENT_LAND.SAARLAND

## Overview

Your AGENT_LAND.SAARLAND project is now configured with MCP (Model Context Protocol) integration, allowing Claude to directly interact with your dashboard and AI agents.

## Configuration Complete ✅

The following MCP servers are now configured in your Claude installation:

### 1. External MCP Servers
- **Context7**: Documentation and library resolution
- **Sequential Thinking**: Advanced reasoning capabilities
- **Browser Tools**: Web automation and testing
- **21st Magic**: Component generation and logo search
- **GitHub**: Repository management
- **OSP Marketing Tools**: Writing guides
- **Genkit**: Firebase integration

### 2. AGENT_LAND.SAARLAND MCP Server
- **Server ID**: `agentland-saarland`
- **Location**: `/home/jan/agentland.saarland/libs/mcp/src/start_server.js`
- **Features**:
  - Sequential Planner
  - Memory Server
  - Color Schema Manager
  - A2A Manager (Agent-to-Agent)

## Quick Start

1. **Verify Setup**:
   ```bash
   cd /home/jan/agentland.saarland
   ./scripts/verify-mcp-setup.sh
   ```

2. **Start MCP Server**:
   ```bash
   cd /home/jan/agentland.saarland
   node libs/mcp/src/start_server.js
   ```

3. **Restart Claude**:
   - Close and reopen Claude to load new MCP configuration

4. **Test Connection**:
   In Claude, you can now use:
   - Sequential planning features
   - Agent memory persistence
   - Color schema management
   - Agent-to-agent communication

## Dashboard Integration

Your dashboard already has MCP hooks integrated:

### Available Hooks
- `useSequentialPlanner()` - Complex task planning
- `useSequentialThinking()` - Recursive reasoning
- `useBraveSearch()` - Web search integration
- `useImageGeneration()` - AI image creation
- `useDailyRewards()` - Game state management
- `useGameState()` - User progress tracking

### Example Usage

```jsx
import { useSequentialPlanner } from '@hooks/mcp';

function MyComponent() {
  const { planTask, executeStep, getPlanStatus } = useSequentialPlanner();
  
  const handleComplexTask = async () => {
    const plan = await planTask('Build a new feature');
    const status = await executeStep(plan.steps[0]);
    // ... handle execution
  };
}
```

## MCP Commands in Claude

With the configuration complete, you can now use these commands:

```
// Plan a complex task
useSequentialPlanner("Create a new agent module")

// Save memory state
useMemoryServer("save", { key: "project-state", value: data })

// Manage color schema
useColorSchema("update", { primary: "#2563eb" })

// Agent communication
useA2AManager("send", { to: "git-agent", message: "status" })
```

## Architecture

```
Claude (with MCP) <-> MCP Server <-> AGENT_LAND.SAARLAND
                           |
                           ├── Sequential Planner
                           ├── Memory Server
                           ├── Color Schema Manager
                           └── A2A Manager
```

## Development Workflow

1. **Claude can now**:
   - Execute complex plans through your dashboard
   - Persist data between sessions
   - Update UI themes dynamically
   - Coordinate multiple agents

2. **Dashboard Integration**:
   - Real-time updates from Claude commands
   - Persistent state management
   - Visual feedback for agent activities

## Troubleshooting

If MCP connection fails:

1. Check configuration:
   ```bash
   cat ~/.config/claude/claude_config.json | grep agentland
   ```

2. Verify server is running:
   ```bash
   ps aux | grep start_server.js
   ```

3. Check logs:
   ```bash
   cd /home/jan/agentland.saarland
   tail -f logs/mcp.log
   ```

4. Restart Claude and try again

## Next Steps

1. Test the sequential planner in your dashboard
2. Try saving and retrieving memory states
3. Experiment with color schema updates
4. Set up agent-to-agent communication

Your AGENT_LAND.SAARLAND dashboard is now fully integrated with Claude's MCP capabilities!