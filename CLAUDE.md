# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the project
npm run build

# Run tests
npm test
npm run test:jest            # Run Jest tests
npm run test:jest:watch      # Run Jest tests in watch mode

# Linting
npm run lint

# Validate clauderules
npm run validate:clauderules

# Run specific projects with Nx
nx serve [project]           # Start development server for specific project
nx test [project]            # Run tests for specific project
nx lint [project]            # Run linting for specific project
nx build [project]           # Build specific project
```

## Project Architecture

The Claude Neural Framework follows a pentagonal architecture pattern that extends the traditional hexagonal (ports and adapters) architecture with specialized layers for AI operations:

1. **Domain Layer**: Core business logic, entities, value objects
2. **Application Layer**: Orchestrates domain objects for specific use cases
3. **Neural Layer**: AI-related operations, model interactions, ML workflows
4. **Ports Layer**: Interfaces for communication with external systems
5. **Adapters Layer**: Implementation of ports for specific external technologies

The codebase is organized as a monorepo with the following structure:

- `libs/`: Core framework libraries
  - `core/`: Configuration, logging, i18n, security modules
  - `agents/`: Agent-to-agent communication and specialized agents
  - `mcp/`: Integration with Model Context Protocol servers
  - `rag/`: Retrieval Augmented Generation framework
  - `workflows/`: Sequential planning and execution engines
- `apps/`: CLI, web interface, and API applications
- `configs/`: Central configuration files
- `tools/`: Development scripts and utilities
- `ai_docs/`: Documentation organized by topic

## Key Components

### Sequential Execution Manager

The Sequential Execution Manager (`libs/workflows/src/sequential/services/sequential-planner.ts`) provides a powerful interface for sequential planning and execution across different domains with features like:

- Domain-specific planning and execution
- Custom step handlers for different action types
- Observer pattern for real-time notifications
- Event-driven execution workflow
- Robust error handling and recovery
- Complete state management

### Model Context Protocol (MCP) Integration

The framework integrates with various MCP servers through client modules in `libs/mcp/src/client/`:

- Sequential thinking for recursive thought generation
- Context7 for context awareness
- Brave search for web search capabilities
- Image generation capabilities
- React hooks for frontend integration (`apps/web/src/hooks/mcp/`)

### Agent System

The Agent-to-Agent communication system (`libs/agents/src/`) enables specialized AI agents to collaborate on complex tasks by:

- Defining a standard messaging format
- Providing a central agent registry
- Supporting capability-based agent discovery
- Implementing specialized agents for different domains

### RAG System

The Retrieval Augmented Generation system (`libs/rag/src/`) enhances Claude's responses by retrieving relevant context from a knowledge database:

- Document indexing and embedding generation
- Vector-based information retrieval
- Augmented response generation
- Support for different embedding providers and vector databases

## TypeScript Development

The codebase is primarily written in TypeScript with a focus on:

- Strong typing with proper interfaces and type definitions
- Functional programming patterns
- Component-based architecture
- Jest for testing (configuration in `jest.config.js`)

## SAAR Workflow

SAAR (Simplified Agent Architecture and Routing) provides a streamlined workflow with scripts in the repository root (`saar.sh`).

## Environment Variables

Required environment variables for development:
- None specified in the standard configuration

## Additional Notes

- Follow the existing code style and patterns when adding new components
- Document new functionality with inline comments and in the appropriate documentation files
- Ensure tests are written for all new functionality
- Make TypeScript types as specific as possible, avoiding `any` types