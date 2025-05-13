# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Claude Neural Framework is a comprehensive platform for integrating Claude AI capabilities with development workflows. It combines agent-based architecture, Model Context Protocol (MCP) integration, and Retrieval Augmented Generation (RAG) in a consistent environment.

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

## Development Commands

### Basic Commands

```bash
# Install dependencies
npm install

# Start development server (runs up to 3 services in parallel)
npm run dev

# Run all tests
npm test

# Lint all projects
npm run lint

# Build all projects
npm run build
```

### Nx-specific Commands

```bash
# Run a specific project
nx serve [project-name]

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

## Development Conventions

### Code Style

- TypeScript is used throughout the codebase with strict typing
- Use functional programming patterns where appropriate
- Follow the hexagonal architecture pattern for better separation of concerns
- Use dependency injection for better testability

### Testing

- Write unit tests for all core functionality
- Use integration tests for testing between modules
- Use E2E tests for testing applications
- Use mocks and test doubles for external dependencies

### Documentation

- Document all public APIs with JSDoc comments
- Keep README files up-to-date
- Document architectural decisions
- Use diagrams to explain complex systems

## MCP Integration

The framework integrates with various MCP servers:

- **sequentialthinking**: Recursive thought generation
- **context7**: Context awareness and documentation access
- **desktop-commander**: Filesystem integration and shell execution
- **brave-search**: External knowledge acquisition
- **think-mcp**: Meta-cognitive reflection

## Agent System

The agent system is based on specialized agents that communicate with each other through a standardized protocol:

- **Debug Agents**: For recursive debugging and bug hunting
- **Documentation Agents**: For generating documentation from code
- **Git Agents**: For integrating with Git workflows
- **Orchestrator**: For coordinating agent activities

## RAG Framework

The RAG framework provides context-aware responses by:

1. Indexing code and documentation
2. Generating embeddings for efficient retrieval
3. Retrieving relevant context for a given query
4. Generating responses augmented with retrieved information

## Sequential Thinking and Planning

The framework implements sequential thinking and planning through:

1. Breaking down complex problems into steps
2. Generating plans for achieving goals
3. Executing plans step by step
4. Monitoring and adapting to changes during execution

## SAAR Workflow

SAAR (Simplified Agent Architecture and Routing) provides a streamlined workflow for configuring and using the framework. The startup scripts are located in `libs/workflows/src/saar/startup/` and follow a sequential execution pattern from basic setup to advanced features.

## Project Structure Notes

- The project is structured as an Nx monorepo with workspaces for apps and libraries
- Configuration files are stored in the `configs/` directory
- Documentation is available in the `docs/` directory with subdirectories for different aspects
- Tools and scripts for development are in the `tools/` directory
- Examples are provided in `docs/examples/` and `tools/examples/`