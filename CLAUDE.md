# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Claude Neural Framework (agentland.saarland) is a comprehensive platform for integrating Claude AI capabilities with development workflows. It combines agent-based architecture, Model Context Protocol (MCP) integration, and Retrieval Augmented Generation (RAG) in a consistent environment.

Key features include:
- System of specialized AI agents for different tasks
- MCP integration for extended AI functionality  
- RAG framework for context-aware information retrieval
- Recursive debugging tools
- Automated documentation generation
- Comprehensive security framework with TypeScript typing
- SAAR workflow for simplified configuration and usage

## Architecture

The framework follows a monorepo structure with clear modularization:

1. **Core** (`libs/core`): Core functionality including MCP integration and configuration
2. **Agents** (`libs/agents`): Agent-to-agent communication framework and specialized agents
3. **MCP** (`libs/mcp`): Integration with various MCP servers for extended functionality
4. **RAG** (`libs/rag`): Retrieval Augmented Generation framework for context-aware responses
5. **Workflows** (`libs/workflows`): Sequential planning and execution engines
6. **Apps** (`apps/`): Applications including CLI, API, and web interface
   - **Web** (`apps/web`): React-based dashboard for agentland.saarland
   - **CLI** (`apps/cli`): Command-line interface for framework operations

## Development Commands

### Quick Start

```bash
# Start the agentland.saarland dashboard (recommended)
./start-dashboard.sh
```

This will automatically:
- Install dependencies if needed
- Ensure port 5000 is available
- Start the dashboard at http://localhost:5000

### Basic Commands

```bash
# Install dependencies
npm install

# Start development server (runs up to 3 services in parallel)
npm run dev

# Run all tests
npm test

# Run Jest tests specifically  
npm run test:jest
npm run test:jest:watch  # Watch mode

# Lint all projects
npm run lint

# Build all projects
npm run build

# Validate Claude rules
npm run validate:clauderules

# A2A Security administration
npm run a2a:security
```

### Web Application

To start the web application specifically:

```bash
# Navigate to the web application directory
cd apps/web

# Start web development server (uses Vite)
npm run dev
```

The web application will be available at http://localhost:5000 with hot reload enabled.

### Nx-specific Commands

```bash
# Run the web app specifically
nx serve web

# Test a specific project
nx test [project-name]

# Lint a specific project
nx lint [project-name]

# Build a specific project
nx build [project-name]

# Create a new library
nx g @nx/js:lib my-lib

# Create a new application
nx g @nx/node:app my-app

# View dependency graph
nx graph
```

### Running Individual Tests

```bash
# Run specific test file
nx test [project-name] --testFile=path/to/test-file.spec.ts

# Run tests in watch mode
nx test [project-name] --watch

# Run tests with coverage
nx test [project-name] --coverage
```

## Troubleshooting Web Dashboard

If you encounter issues with the web dashboard:

1. Ensure port 5000 is not used by another service
2. Use `./start-dashboard.sh` which automatically resolves common issues
3. Verify that Node.js v18+ and all dependencies are correctly installed
4. If problems persist, try starting the server with: `npm run dev -- --host 0.0.0.0 --port 5000`

## Key Technologies

- **Frontend**: React 18 with Vite for fast development
- **Backend**: Node.js with Express
- **Testing**: Jest for unit testing
- **Build System**: Nx for monorepo management
- **Type System**: TypeScript with strict typing
- **Package Manager**: npm with workspaces
- **Web Server**: Vite dev server for the dashboard

## MCP Integration

The framework integrates with various MCP servers:

- **sequentialthinking**: Recursive thought generation
- **context7**: Context awareness and documentation access
- **desktop-commander**: Filesystem integration and shell execution
- **brave-search**: External knowledge acquisition
- **think-mcp**: Meta-cognitive reflection
- **memory-bank-mcp**: Long-term pattern persistence
- **imagen-3-0-generate**: Image generation
- **mcp-taskmanager**: Task management
- **mcp-veo2**: Visualization server

MCP configuration is located in `configs/mcp/config.json`. The MCP servers use environment variables like `${MCP_API_KEY}` and `${MCP_PROFILE}` for authentication.

## Agent System

The agent system is based on specialized agents that communicate with each other through a standardized protocol. Key components include:

- **Debug Agents**: For recursive debugging and bug hunting
- **Documentation Agents**: For generating documentation from code
- **Git Agents**: For integrating with Git workflows
- **Orchestrator**: For coordinating agent activities

Agent architecture follows the A2A (Agent-to-Agent) protocol, with security features including:
- DNS verification
- Message validation
- Priority management
- Authentication providers

A2A security configuration is stored in `configs/security/dns-security.json`.

## RAG Framework

The RAG framework provides context-aware responses by:

1. Indexing code and documentation
2. Generating embeddings for efficient retrieval
3. Retrieving relevant context for a given query
4. Generating responses augmented with retrieved information

RAG configuration is located in `configs/rag/`. The Python-based RAG components use virtual environments for isolation.

## Sequential Thinking and Planning

The framework implements sequential thinking and planning through:

1. Breaking down complex problems into steps
2. Generating plans for achieving goals
3. Executing plans step by step
4. Monitoring and adapting to changes during execution

Sequential execution tools are available in `tools/mcp/integration/` and `libs/workflows/src/sequential/`.

## Web Dashboard Features

The web dashboard provides:

- **Modular Dashboard** with configurable widgets
- **Real-Life Agent Cockpit** with mission authorization
- **KI-Workspace** access with status display
- **A2A Security System** for mission authorization
- **Regional Identity** with Saarland elements
- **Multilingual Support** (German, English, French)
- **Responsive Design** for all devices
- **Theme Support** with Light/Dark mode

## Security Considerations

The framework includes comprehensive security features:

- JWT-based authentication
- Session management
- Security constraints configuration
- DNS security verification
- A2A message validation

Security configuration is located in `configs/security/`.

## SAAR Workflow

SAAR (Simplified Agent Architecture and Routing) provides a streamlined workflow for configuring and using the framework. Key scripts and configurations are located in:

- `tools/scripts/saar/`: Administrative scripts
- `configs/saar/`: SAAR configuration

## Key Configuration Files

- **Global config**: `configs/global.json`
- **Process definitions**: `configs/processes.json`
- **Enterprise workflows**: `configs/enterprise/workflow.json`
- **Color schema**: `configs/color-schema/config.json`
- **i18n settings**: `configs/i18n/config.json`
- **MCP server config**: `configs/mcp/config.json`
- **A2A security config**: `configs/security/dns-security.json`

## Multilingual Support

The framework has built-in support for multiple languages:
- German (primary)
- English
- French

Localization files are stored in `libs/core/src/i18n/locales/`.

## Namespace Consistency Guidance

✅ **Global Spelling Update**: From this point forward, **all references** — in **code**, **docs**, **folder names**, **file names**, **environment variables**, and **comments** — will **consistently use the spelling**:

```
agentland.saarland
```

### Spelling Transformation Matrix

| From                        | To                   |
| --------------------------- | -------------------- |
| `AGENT_LAND_SAARLAND`       | `agentland.saarland` |
| `AGENT_LAND.SAARLAND`       | `agentland.saarland` |
| `AGENTLAND` or `agent_land` | `agentland.saarland` |

### Consistent Reference Scope

All future instances will reference `agentland.saarland` as the canonical namespace:

* 🧩 Components
* 📝 `progress.md` log entries
* 📄 Template updates
* 🐙 GitHub Issues / Commits
* 📁 Folder/file references