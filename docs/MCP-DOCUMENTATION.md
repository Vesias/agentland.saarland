# MCP (Model Context Protocol) Documentation

## Overview

The Model Context Protocol (MCP) is a standardized way for LLMs to interact with external tools and services. In agentland.saarland, MCP provides the bridge between Claude and your dashboard, enabling sophisticated interactions and persistent state management.

## Core Concepts

### What is MCP?

MCP is a protocol that allows AI models to:
- Execute complex tools and services
- Maintain persistent state across sessions
- Coordinate with external systems
- Provide structured responses to user requests

### agentland.saarland Implementation

In this project, MCP enables:
- Sequential planning and execution
- Memory persistence across sessions
- Color schema management
- Agent-to-agent communication
- Web searching and image generation
- Daily rewards and game state management

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│    Claude   │────▶│  MCP Server  │────▶│  agentland.saarland  │
└─────────────┘     └──────────────┘     └─────────────────────┘
                           │
                           ├── Sequential Planner
                           ├── Memory Server
                           ├── Color Schema Manager
                           ├── A2A Manager
                           ├── Brave Search
                           ├── Image Generator
                           └── Game State Manager
```

## Available MCP Servers

### 1. Internal agentland.saarland Server

Location: `/home/jan/agentland.saarland/libs/mcp/src/start_server.js`

Features:
- **Sequential Planner**: Break down complex tasks into manageable steps
- **Memory Server**: Persist data between sessions
- **Color Schema Manager**: Dynamic theme management
- **A2A Manager**: Agent-to-agent communication

### 2. External MCP Servers

Configured servers include:
- **Context7**: Documentation and library resolution
- **Sequential Thinking**: Advanced reasoning capabilities
- **Browser Tools**: Web automation and testing
- **21st Magic**: Component generation and logo search
- **GitHub**: Repository management
- **OSP Marketing Tools**: Writing guides
- **Genkit**: Firebase integration

## Usage in Claude

### Basic Commands

```javascript
// Plan a complex task
useSequentialPlanner("Build a new dashboard feature")

// Save memory state
useMemoryServer("save", { 
  key: "user-preferences", 
  value: { theme: "dark", language: "en" } 
})

// Update color schema
useColorSchema("update", { 
  primary: "#2563eb",
  secondary: "#7c3aed"
})

// Agent communication
useA2AManager("send", { 
  to: "git-agent", 
  message: "commit changes"
})
```

### Advanced Examples

```javascript
// Complex task planning
const plan = await useSequentialPlanner({
  task: "Create a new authentication system",
  steps: [
    "Design database schema",
    "Implement JWT tokens",
    "Create login UI",
    "Add registration flow",
    "Test security"
  ]
});

// Coordinated agent execution
await useA2AManager("coordinate", {
  agents: ["git-agent", "doc-agent", "test-agent"],
  workflow: "feature-release"
});
```

## Dashboard Integration

### Available React Hooks

```javascript
import { 
  useSequentialPlanner,
  useSequentialThinking,
  useBraveSearch,
  useImageGeneration,
  useDailyRewards,
  useGameState
} from '@hooks/mcp';
```

### Hook Usage Examples

#### Sequential Planner
```jsx
function TaskManager() {
  const { planTask, executeStep, getPlanStatus } = useSequentialPlanner();
  
  const handleComplexTask = async (taskDescription) => {
    const plan = await planTask(taskDescription);
    
    for (const step of plan.steps) {
      const result = await executeStep(step);
      console.log(`Step ${step.id}: ${result.status}`);
    }
    
    const finalStatus = await getPlanStatus(plan.id);
    return finalStatus;
  };
}
```

#### Memory Persistence
```jsx
function UserSettings() {
  const { save, load } = useMemoryServer();
  
  const savePreferences = async (preferences) => {
    await save('user-prefs', preferences);
  };
  
  const loadPreferences = async () => {
    return await load('user-prefs');
  };
}
```

#### Web Search Integration
```jsx
function SearchComponent() {
  const { search, getResults } = useBraveSearch();
  
  const handleSearch = async (query) => {
    const searchId = await search(query);
    const results = await getResults(searchId);
    return results;
  };
}
```

## Configuration

### Server Configuration

Located at `/home/jan/agentland.saarland/configs/mcp/config.json`:

```json
{
  "servers": {
    "agentland-saarland": {
      "command": ["node", "libs/mcp/src/start_server.js"],
      "persistState": true,
      "features": [
        "sequential-planner",
        "memory-server",
        "color-schema",
        "a2a-manager"
      ]
    }
  }
}
```

### Claude Integration

The MCP configuration is automatically added to Claude's config at:
`~/.config/claude/claude_config.json`

### Environment Setup

Required environment variables:
```bash
export MCP_SERVER_PORT=8080
export MCP_AUTH_TOKEN=your-secure-token
export MCP_PERSISTENCE_PATH=/path/to/storage
```

## API Reference

### Sequential Planner

```typescript
interface SequentialPlanner {
  planTask(description: string): Promise<TaskPlan>;
  executeStep(step: TaskStep): Promise<StepResult>;
  getPlanStatus(planId: string): Promise<PlanStatus>;
  cancelPlan(planId: string): Promise<void>;
}
```

### Memory Server

```typescript
interface MemoryServer {
  save(key: string, value: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}
```

### Color Schema Manager

```typescript
interface ColorSchemaManager {
  update(colors: ColorSchema): Promise<void>;
  get(): Promise<ColorSchema>;
  reset(): Promise<void>;
  getPresets(): Promise<ColorPreset[]>;
}
```

### A2A Manager

```typescript
interface A2AManager {
  send(message: A2AMessage): Promise<MessageResult>;
  broadcast(message: A2AMessage): Promise<BroadcastResult>;
  coordinate(workflow: WorkflowConfig): Promise<WorkflowResult>;
  getAgentStatus(agentId: string): Promise<AgentStatus>;
}
```

## Best Practices

### 1. Error Handling

Always wrap MCP calls in try-catch blocks:

```javascript
try {
  const result = await useSequentialPlanner("complex task");
  // Handle success
} catch (error) {
  console.error("MCP operation failed:", error);
  // Fallback behavior
}
```

### 2. State Management

Use the Memory Server for persistent state:

```javascript
// Save application state
await useMemoryServer("save", {
  key: "app-state",
  value: {
    user: currentUser,
    preferences: userPrefs,
    session: sessionData
  }
});

// Restore on app initialization
const savedState = await useMemoryServer("load", { key: "app-state" });
```

### 3. Agent Coordination

For complex workflows, use the A2A Manager:

```javascript
// Coordinate multiple agents
const workflow = await useA2AManager("coordinate", {
  agents: ["git-agent", "test-agent", "deploy-agent"],
  workflow: {
    name: "release-pipeline",
    steps: [
      { agent: "git-agent", action: "create-release-branch" },
      { agent: "test-agent", action: "run-full-suite" },
      { agent: "deploy-agent", action: "deploy-to-staging" }
    ]
  }
});
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Responding**
   ```bash
   # Check if server is running
   ps aux | grep start_server.js
   
   # Restart server
   cd /home/jan/agentland.saarland
   node libs/mcp/src/start_server.js
   ```

2. **Claude Not Finding MCP Tools**
   - Restart Claude to reload configuration
   - Verify configuration in `~/.config/claude/claude_config.json`

3. **Permission Errors**
   ```bash
   # Check permissions
   ls -la ~/.config/claude/
   
   # Fix permissions if needed
   chmod 600 ~/.config/claude/claude_config.json
   ```

### Debug Mode

Enable debug logging:

```javascript
// In your MCP server
process.env.MCP_DEBUG = "true";
```

### Logs

Check logs for issues:
```bash
# MCP server logs
tail -f /home/jan/agentland.saarland/logs/mcp.log

# Claude logs
tail -f ~/.claude/logs/claude.log
```

## Advanced Features

### Custom MCP Tools

Create custom tools in `/home/jan/agentland.saarland/libs/mcp/src/tools/`:

```javascript
// custom-tool.js
export default {
  name: "custom-tool",
  description: "My custom MCP tool",
  parameters: {
    type: "object",
    properties: {
      action: { type: "string" },
      data: { type: "object" }
    },
    required: ["action"]
  },
  async execute({ action, data }) {
    // Tool implementation
    return { success: true, result: data };
  }
};
```

### Webhooks and Events

Set up event handlers for MCP operations:

```javascript
// In your dashboard
mcpClient.on('task:completed', (event) => {
  console.log('Task completed:', event.taskId);
  updateDashboard(event.result);
});

mcpClient.on('agent:message', (event) => {
  console.log('Agent message:', event.from, event.message);
  handleAgentMessage(event);
});
```

### Performance Optimization

1. **Batch Operations**
   ```javascript
   // Instead of multiple calls
   await useMemoryServer("save", { key: "key1", value: value1 });
   await useMemoryServer("save", { key: "key2", value: value2 });
   
   // Use batch operations
   await useMemoryServer("saveBatch", {
     items: [
       { key: "key1", value: value1 },
       { key: "key2", value: value2 }
     ]
   });
   ```

2. **Caching**
   ```javascript
   const cachedPlanner = withCache(useSequentialPlanner, {
     ttl: 300000, // 5 minutes
     key: (task) => `plan:${task}`
   });
   ```

## Future Enhancements

Planned features for MCP integration:

1. **Real-time Collaboration**
   - Multi-user agent coordination
   - Shared memory states
   - Collaborative planning

2. **Advanced Analytics**
   - Task execution metrics
   - Agent performance monitoring
   - Usage patterns analysis

3. **Extended Tool Library**
   - Database operations
   - File system management
   - Network operations
   - Third-party API integrations

4. **Security Enhancements**
   - End-to-end encryption
   - Role-based access control
   - Audit logging

## Resources

- [MCP Specification](https://modelcontextprotocol.com)
- [Claude Documentation](https://docs.anthropic.com)
- [agentland.saarland Repository](https://github.com/agentland/saarland)
- [Examples and Tutorials](/ai_docs/examples/)

## Support

For issues and questions:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review [examples](/ai_docs/examples/mcp_hooks_comprehensive_example.md)
3. Open an issue on GitHub
4. Contact the development team

---

*This documentation is part of the agentland.saarland project. For updates and contributions, please refer to the main repository.*