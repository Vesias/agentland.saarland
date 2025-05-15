---
title: "Directory Structure Template for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
status: "active"
---

# Directory Structure Template for agentland.saarland

This template defines the standard directory structure and file organization for agentland.saarland projects. Following this structure ensures consistency across all projects and facilitates easier integration of new components.

## Root Directory Structure

```
agentland.saarland/
├── .github/                   # GitHub workflows and templates
├── .nx/                       # Nx workspace configuration
├── ai_docs/                   # AI documentation and memory bank
├── apps/                      # Applications (web, CLI, API)
├── configs/                   # Configuration files
├── docs/                      # Human-readable documentation
├── libs/                      # Shared libraries and modules
├── logs/                      # Log files (gitignored)
├── scripts/                   # Utility scripts
├── specs/                     # Specifications and schemas
├── tools/                     # Development tools
├── .claudeignore              # Claude ignore patterns
├── .clauderules               # Claude rules
├── .env.example               # Example environment variables
├── .eslintrc.js               # ESLint configuration
├── .gitignore                 # Git ignore patterns
├── .markdownlint.jsonc        # Markdown linting rules
├── .prettierrc                # Prettier configuration
├── CLAUDE.md                  # Claude Code instructions
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
├── jest.config.js             # Jest test configuration
├── nx.json                    # Nx configuration
├── package.json               # NPM package configuration
├── README.md                  # Project overview
├── TEMPLATE_INIT_chain.md     # Template chain reference
├── tsconfig.base.json         # TypeScript base configuration
└── tsconfig.json              # TypeScript configuration
```

## Detailed Subdirectory Structures

### ai_docs/ - AI Documentation

```
ai_docs/
├── CLAUDE.md                  # Claude-specific instructions
├── CLEANUP-LIST.md            # Cleanup tasks
├── FINAL-POLISHING-STEPS.md   # Final preparation steps
├── FINAL-STRUCTURE.md         # Final directory structure
├── FINAL_FILE_TREE.md         # Complete file tree
├── PROJECT-STRUCTURE-AUDIT.md # Structure audit results
├── README.md                  # Documentation overview
├── STRUCTURE.md               # Current structure description
├── analysis/                  # Analysis reports
├── architecture/              # Architecture documentation
├── guides/                    # User and developer guides
├── memory-bank/               # Memory bank for agents
│   ├── activeContext.md       # Active context tracker
│   ├── memoryController.md    # Memory controller system
│   ├── productContext.md      # Product context
│   ├── progress.md            # Project progress log
│   ├── projectbrief.md        # Project brief
│   ├── systemPatterns.md      # System patterns
│   └── techContext.md         # Technical context
├── prompts/                   # Prompt templates
├── security/                  # Security documentation
│   ├── SECURITY.md            # Security guidelines
│   └── security_audit_agentland_saarland.md # Security audit
└── templates/                 # Project templates
    ├── TEMPLATE_INIT_chain.md # Template chain index
    ├── template_ci_cd.md      # CI/CD templates
    ├── template_configurations.md # Configuration templates
    ├── template_dashboard.md  # Dashboard templates
    ├── template_guides.md     # Guide templates
    ├── template_memory_bank.md # Memory bank templates
    ├── template_prompts.md    # Prompt templates
    ├── template_security.md   # Security templates
    └── template_structure.md  # Structure templates
```

### apps/ - Applications

```
apps/
├── cli/                       # Command-line interface
│   ├── src/                   # CLI source code
│   │   ├── commands/          # CLI commands
│   │   │   └── sequential-execute.ts # Sequential execution
│   │   └── index.ts           # CLI entry point
│   ├── package.json           # CLI package configuration
│   └── tsconfig.json          # CLI TypeScript configuration
└── web/                       # Web application
    ├── configs/               # Web-specific configs
    │   └── color-schema/      # Color schema configuration
    ├── public/                # Static web assets
    ├── src/                   # Web source code
    │   ├── components/        # React components
    │   │   ├── auth/          # Authentication components
    │   │   ├── dashboard/     # Dashboard components
    │   │   │   ├── agent-orchestration/ # Agent orchestration
    │   │   │   ├── knowledge-management/ # Knowledge management
    │   │   │   ├── regional-integration/ # Regional integration
    │   │   │   └── system-health/ # System health
    │   │   ├── form/          # Form components
    │   │   ├── i18n/          # Internationalization
    │   │   ├── layout/        # Layout components
    │   │   ├── mcp/           # MCP components
    │   │   ├── profile/       # Profile components
    │   │   ├── security/      # Security components
    │   │   └── support/       # Support components
    │   ├── contexts/          # React contexts
    │   ├── core/              # Core functionality
    │   ├── hooks/             # React hooks
    │   │   └── mcp/           # MCP hooks
    │   ├── layouts/           # Page layouts
    │   └── pages/             # Page components
    ├── index.html             # Web entry point
    ├── package.json           # Web package configuration
    ├── postcss.config.js      # PostCSS configuration
    ├── start-dashboard.sh     # Dashboard startup script
    ├── tailwind.config.js     # Tailwind CSS configuration
    ├── tsconfig.json          # Web TypeScript configuration
    └── vite.config.js         # Vite configuration
```

### libs/ - Shared Libraries

```
libs/
├── agents/                    # Agent framework
│   └── src/                   # Agent source code
│       ├── agent-base/        # Base agent classes
│       ├── commands/          # Agent commands
│       ├── security/          # Agent security
│       │   ├── a2a-auth-provider.ts # A2A authentication
│       │   ├── a2a-dns-verifier.ts # DNS verification
│       │   ├── a2a-message-validator.ts # Message validation
│       │   ├── a2a-mission-auth.ts # Mission authorization
│       │   ├── a2a-priority-manager.ts # Priority management
│       │   ├── a2a-security-middleware.ts # Security middleware
│       │   └── a2a-security.types.ts # Security types
│       └── index.ts           # Agent library entry point
├── core/                      # Core functionality
│   └── src/                   # Core source code
│       ├── config/            # Configuration management
│       │   ├── config-manager.spec.ts # Config tests
│       │   ├── config-manager.ts # Config manager
│       │   └── env-validator.ts # Environment validator
│       ├── error/             # Error handling
│       ├── i18n/              # Internationalization
│       │   └── locales/       # Language files
│       ├── logging/           # Logging system
│       ├── schemas/           # JSON schemas
│       ├── security/          # Core security
│       └── index.ts           # Core library entry point
├── mcp/                       # MCP integration
│   └── src/                   # MCP source code
│       ├── client/            # MCP client
│       ├── routes/            # MCP routes
│       ├── server/            # MCP server
│       │   └── quality-guard/ # Quality assurance
│       ├── services/          # MCP services
│       └── index.ts           # MCP library entry point
├── rag/                       # RAG framework
│   ├── scripts/               # RAG scripts
│   ├── setup/                 # RAG setup
│   └── src/                   # RAG source code
│       ├── database/          # Vector database
│       └── __init__.py        # Python module initialization
├── shared/                    # Shared utilities
│   └── src/                   # Shared source code
│       └── utils/             # Utility functions
└── workflows/                 # Workflow engine
    └── src/                   # Workflow source code
        └── sequential/        # Sequential workflows
            ├── documentation/ # Documentation generation
            ├── executors/     # Workflow executors
            ├── integration/   # Integration managers
            ├── planners/      # Workflow planners
            └── services/      # Workflow services
```

### configs/ - Configuration Files

```
configs/
├── api/                       # API configuration
├── backup/                    # Backup configuration
├── color-schema/              # Color schema configuration
├── debug/                     # Debug configuration
├── enterprise/                # Enterprise configuration
├── i18n/                      # Internationalization configuration
├── mcp/                       # MCP configuration
│   ├── config.json            # MCP configuration
│   ├── mcp_config.json        # MCP server config
│   └── servers.json           # MCP server list
├── profiles/                  # User profiles
├── python/                    # Python configuration
├── rag/                       # RAG configuration
├── saar/                      # SAAR configuration
├── schemas/                   # JSON schemas
├── security/                  # Security configuration
│   ├── constraints.json       # Security constraints
│   ├── constraints.md         # Security constraints documentation
│   ├── dns-records.json       # DNS records
│   └── dns-security.json      # DNS security configuration
└── workflows/                 # Workflow configuration
    └── saar/                  # SAAR workflows
```

### tools/ - Development Tools

```
tools/
├── ci/                        # CI tools
│   ├── check_links.sh         # Link validation
│   ├── check_memory_bank.sh   # Memory bank validation
│   ├── check_naming.sh        # Naming convention checker
│   ├── check_prompt_format.sh # Prompt format validator
│   ├── check_structure.sh     # Structure validator
│   └── validate_toc.sh        # Table of contents validator
├── documentation/             # Documentation tools
├── scripts/                   # Utility scripts
│   ├── backup/                # Backup scripts
│   ├── git/                   # Git workflow scripts
│   ├── migration/             # Migration scripts
│   ├── qa/                    # Quality assurance scripts
│   ├── rag/                   # RAG scripts
│   ├── saar/                  # SAAR scripts
│   │   ├── backup/            # SAAR backup scripts
│   │   ├── cleanup/           # Cleanup scripts
│   │   ├── git/               # SAAR git scripts
│   │   ├── installation/      # Installation scripts
│   │   ├── language_support/  # Language support
│   │   └── setup/             # SAAR setup scripts
│   └── setup/                 # General setup scripts
└── validators/                # Validation tools
    ├── clauderules-validator.spec.ts # Claude rules validator tests
    └── clauderules-validator.ts # Claude rules validator
```

## File Naming Conventions

1. **Kebab Case for Directories and Files**: Use kebab-case (lowercase with hyphens) for directories and files:
   - `agent-orchestration/`
   - `config-manager.ts`

2. **File Extensions**:
   - TypeScript: `.ts`
   - TypeScript React: `.tsx`
   - JavaScript: `.js`
   - React JavaScript: `.jsx`
   - JSON: `.json`
   - Markdown: `.md`
   - Shell Scripts: `.sh`

3. **Special Files**:
   - Configuration files: `*.config.js`, `*.config.ts`
   - Type definition files: `*.types.ts`, `*.d.ts`
   - Test files: `*.spec.ts`, `*.test.ts`
   - React components: `ComponentName.tsx`

4. **Index Files**:
   - Use `index.ts` or `index.js` for exporting from directories
   - Each module should have an `index.ts` file that exports its public API

## Module Organization Principles

1. **Monorepo Structure**:
   - Use Nx for monorepo management
   - Clear separation between `apps/` and `libs/`
   - Shared code should always go in `libs/`

2. **Feature-First Organization**:
   - Organize code by feature rather than type
   - Place related files together regardless of type
   - Example: `dashboard/agent-orchestration/` contains all agent orchestration components

3. **Core Module Separation**:
   - `core/`: Contains foundational utilities used across all modules
   - `shared/`: Contains shared utilities that depend on core
   - `agents/`: Contains agent-specific functionality
   - `mcp/`: Contains MCP integration
   - `rag/`: Contains RAG framework
   - `workflows/`: Contains workflow engines

4. **Configuration Centralization**:
   - All configuration files go in `configs/`
   - Application-specific configs in respective app directories
   - Environment variables in `.env` files (not in version control)

5. **Documentation Organization**:
   - Human-readable docs in `docs/`
   - AI-specific docs in `ai_docs/`
   - Memory bank in `ai_docs/memory-bank/`
   - Templates in `ai_docs/templates/`

## Project Initialization

When creating a new agentland.saarland project:

1. Clone this directory structure
2. Run installation scripts from `tools/scripts/setup/`
3. Configure environment variables based on `.env.example`
4. Initialize the memory bank with project-specific information
5. Update configuration files in `configs/`

## Adding New Components

When adding new components:

1. Follow the established directory structure
2. Use the appropriate naming conventions
3. Create necessary test files
4. Update index files to export the new components
5. Document the component in the appropriate documentation file

## Migration from Legacy Projects

When migrating from legacy projects:

1. Create the new directory structure
2. Move files to their appropriate locations
3. Update imports and references
4. Run the migration scripts from `tools/scripts/migration/`
5. Validate the migration with the validation tools in `tools/validators/`

## Conclusion

This directory structure template provides a standardized approach to organizing agentland.saarland projects. Following this structure ensures consistency, maintainability, and easier integration of new components.

## Related Templates

| Template | Relationship |
|----------|--------------|
| [Configurations](./template_configurations.md) | Defines how configuration files are structured and managed within this directory structure |
| [CI/CD](./template_ci_cd.md) | Provides workflows for validating and testing components in this structure |
| [Dashboard](./template_dashboard.md) | Implements the web application components defined in the structure |

## Changelog

- **1.0.0** (2025-05-16): Initial version based on the agentland.saarland project structure