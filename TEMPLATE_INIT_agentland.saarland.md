# AGENT_LAND_SAARLAND Initialisierungsvorlage

## Vorlagenparameter
- PROJECT_NAME: Name des Projekts (Standard: AGENT_LAND_SAARLAND)
- PROJECT_DIR: Installationsverzeichnis (Standard: Aktuelles Verzeichnis)
- REGIONAL_CONFIG: Regionale Konfigurationsvorlage (Standard: saarland-standard)
- LANGUAGE_MODE: Primärer Sprachmodus (Standard: bilingual-de-en)

## Verzeichnisstruktur erstellen

Erstelle folgende Verzeichnisstruktur:

```
AGENT_LAND_SAARLAND/
├── .claude/                     # Claude-spezifisches Konfigurationsverzeichnis
│   ├── commands/                # Benutzerdefinierte Slash-Befehle
│   │   ├── init.md             # Initialisierungsbefehl
│   │   ├── memory.md           # Speicherverwaltungsbefehl
│   │   └── regional/           # Regionalspezifische Befehle
│   │       └── saarland.md     # Saarland-spezifische Befehle
│   ├── config.json             # Claude-Konfiguration
│   └── memory/                 # Persistenter Speicher (.gitignored)
├── .claudeignore               # Von Claude zu ignorierende Dateien
├── .clauderules                # Regeln für Claudes Verhalten
├── CLAUDE.md                   # Projektspezifische Anweisungen für Claude
├── ai_docs/                    # KI-Dokumentation (gemäß .clauderules)
│   ├── analysis/               # Projekt- und Codeanalyse
│   ├── api/                    # API-Dokumentation für KI-Dienste
│   ├── architecture/           # KI-spezifische Architekturdiagramme
│   ├── branding/               # Markenrichtlinien und -strategien
│   │   └── markenimplementierungsstrategie_agentland_saarland.md
│   ├── cleanup/                # Dokumentation zu Code-Bereinigungen
│   ├── enterprise/             # Enterprise-spezifische KI-Dokumentation
│   ├── examples/               # Anwendungsbeispiele für KI-Komponenten
│   ├── general/                # Allgemeine Projektdokumentation für KI
│   ├── guides/                 # Anleitungen und Leitfäden
│   │   ├── claude_power_tools_guide.md
│   │   ├── prompt_best_practices_agentland_saarland.md
│   │   ├── mcp_tools_implementierungsplan_agentland_saarland.md
│   │   ├── advanced_development_guidelines_agentland_saarland.md
│   │   └── recursive_template_evolution_flow.md
│   ├── integration/            # Integrationsleitfäden für KI-Systeme
│   ├── memory-bank/            # Persistenter Projektkontext für Claude
│   │   ├── projectbrief.md
│   │   ├── productContext.md
│   │   ├── systemPatterns.md
│   │   ├── techContext.md
│   │   ├── activeContext.md
│   │   └── progress.md
│   ├── migration/              # Migrationsleitfäden für KI-Systeme
│   ├── models/                 # Modelldokumentation und -spezifikationen
│   ├── overviews/              # Projektübersichten
│   │   └── project_summary_agentland_saarland.md
│   ├── plans/                  # KI-Projektpläne
│   ├── prompts/                # Prompt-Vorlagen und Engineering-Richtlinien
│   │   ├── base_context_agentland_saarland.md
│   │   ├── agent_implementation_guidelines_agentland_saarland.md
│   │   └── example_tourism_agent_request_agentland_saarland.md
│   ├── recommendations/        # Empfehlungen basierend auf Analysen
│   ├── regional/               # Regionalspezifische KI-Dokumentation
│   │   └── saarland/           # Saarland-spezifische KI-Dokumentation
│   ├── reports/                # Analyseberichte
│   ├── security/               # KI-Sicherheitsrichtlinien
│   ├── templates/              # Vorlagen für KI-Dokumente
│   ├── tutorials/              # Tutorials für KI-Werkzeuge und -Frameworks
│   └── ui_ux/                  # UI/UX-Richtlinien für KI-Anwendungen
│       └── ui_verbesserungsplan_agentland_saarland.md
├── specs/                      # Projektspezifikationen
│   ├── architecture/           # Übergreifende Systemarchitektur
│   ├── initiatives/            # Spezifikationen für Kerninitiativen
│   │   └── ki_schmiede_saar_konzept_agentland_saarland.md
│   ├── plans/                  # Projektpläne (alternativ zu ai_docs/plans)
│   │   └── technical_roadmap_agentland_saarland.md # Technische Roadmap (aus P5)
│   ├── requirements/           # Anforderungsdokumentation
│   └── regional/               # Regionalspezifische Spezifikationen
│       └── saarland/           # Saarland-spezifische Spezifikationen
├── src/                        # Quellcode
│   ├── agent-definitions/      # Formale Definitionen von Agentenrollen und -fähigkeiten (P7)
│   ├── agent/                  # Agent-Implementierung (bestehend)
│   ├── ai-models/              # Lokale KI-Modelle oder Konfigurationen (P7)
│   ├── data/                   # Datenressourcen (bestehend)
│   │   └── regional/           # Regionalspezifische Daten (bestehend)
│   │       └── saarland/       # Saarland-spezifische Daten (bestehend)
│   ├── integration-connectors/ # Konnektoren zu externen Datenquellen/Diensten (P7)
│   ├── regional-data/          # Verarbeitete oder kuratierte regionale Daten (P7)
│   └── tools/                  # Benutzerdefinierte Tool-Implementierung (bestehend)
├── config/                     # Konfigurationsdateien
│   └── regional/               # Regionalspezifische Konfigurationen
│       └── saarland.yaml       # Saarland-spezifische Konfiguration
└── README.md                   # Projekt-README
```

## Konfigurationsdateien

### 1. README.md

```markdown
# agentland.saarland Framework

Ein umfassendes Framework für die Integration von KI-Fähigkeiten in Entwicklungsworkflows, mit Agentenarchitektur, MCP-Integration und RAG-Framework für agentland.saarland.

## Überblick

Das agentland.saarland Framework ist eine Plattform zur Integration von KI-Fähigkeiten in Entwicklungsprozesse. Es bietet:

- Ein System spezialisierter KI-Agenten für verschiedene Aufgaben
- MCP-Integration (Model Context Protocol) für erweiterte KI-Funktionen
- RAG-Framework (Retrieval Augmented Generation) für kontextbewusste Informationsbereitstellung
- Rekursive Debugging-Werkzeuge
- Automatisierte Dokumentationsgenerierung
- Umfassendes Sicherheitsframework mit TypeScript-Typisierung
- SAAR-Workflow für vereinfachte Konfiguration und Nutzung

## Architektur

Das Framework folgt einer Monorepo-Struktur mit klarer Modularisierung:

- **apps**: Anwendungskomponenten (CLI, API, Web)
- **libs**: Kernbibliotheken (Agents, Core, MCP, RAG, Workflows)
- **tools**: Entwicklungswerkzeuge
- **configs**: Konfigurationen
- **docs**: Dokumentation (im `ai_docs` Verzeichnis für dieses Projekt)
  - **security**: [Sicherheitskonfiguration und -richtlinien](ai_docs/security/security_policy.md)

## Installation

```bash
# Repository klonen
git clone https://github.com/agentland-saarland/agentland.saarland.git
cd agentland.saarland

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Entwicklung

```bash
# Neue Bibliothek erstellen
npx nx g @nx/js:lib my-lib

# Neue App erstellen
npx nx g @nx/node:app my-app

# Tests ausführen
npm test

# Build durchführen
npm run build
```

## Lizenz

[MIT](LICENSE.md)
```

### 2. .claudeignore

```
# Claude Ignore File
# Files and directories that Claude should ignore during analysis

# Virtual environment
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd

# Temporary files
*.tmp
*.temp
*.swp
*~

# Logs
logs/
*.log

# Environment files
.env
.env.local

# Build output
dist/
build/
*.egg-info/

# Node modules
node_modules/
apps/cli/node_modules/

# System files
.DS_Store
.vscode/
.idea/
mcp_servers_backup.tar.gz
```

### 3. .clauderules

```toml
# agentland.saarland Framework – .clauderules
# Location: /home/jan/Dokumente/agent.saarland/.clauderules
# Version: 2.x
# Enforces: Struktur, Konvention, Modularität, Doku, CI-Fähigkeit

[project]
name = "agentland.saarland Framework"
monorepo = true
entry_point = "saar.sh"
typed = true
typed_language = "TypeScript"
docs_base = "ai_docs/"
enforce_module_boundaries = true
readme = "README.md"

[folders.authoritative]
ai_docs = true
specs = true
.claude = true
configs = true
tools = true
libs = true
apps = true

[folders.enforce_structure.ai_docs]
must_have = [
  "analysis/",
  "api/",
  "architecture/",
  "branding/",
  "cleanup/",
  "enterprise/",
  "examples/",
  "general/",
  "guides/",
  "integration/",
  "memory-bank/",
  "migration/",
  "models/",
  "overviews/",
  "plans/",
  "prompts/",
  "recommendations/",
  "reports/",
  "security/",
  "templates/",
  "tutorials/",
  "ui_ux/"
]
readme_required = true
central_docs = [
  "CLAUDE.md",
  "CLEANUP-LIST.md",
  "FINAL_FILE_TREE.md",
  "FINAL-POLISHING-STEPS.md",
  "FINAL-STRUCTURE.md",
  "PROJECT-STRUCTURE-AUDIT.md",
  "STRUCTURE.md"
]

[enforce.aliasing]
tsconfig_paths = true
aliases = [
  { path = "@libs/*", mapsTo = "libs/*/src" },
  { path = "@ai_docs/*", mapsTo = "ai_docs/*" },
  { path = "@specs/*", mapsTo = "specs/*" },
  { path = "@.claude/*", mapsTo = ".claude/*" }
]

[enforce.scripts]
only_root_script = ["saar.sh"]
disallow_other_root_scripts = true
scripts_allowed_in = [
  "tools/",
  ".claude/",
  "libs/**/scripts/"
]
strict_bash_required = true
no_debug_or_console_logs = true

[enforce.docs]
all_md_files = "ai_docs/"
require_md_index = true
disallow_duplicate_readmes = true
must_link_from_root_readme = [
  "FINAL-STRUCTURE.md",
  "PROJECT-STRUCTURE-AUDIT.md",
  "CLAUDE.md"
]

[enforce.testing]
test_framework = "jest"
enforce_test_dirs = ["__tests__", "test", "tests"]
spec_suffix = ".spec.ts"
test_required_for = [
  "libs/*",
  "apps/*"
]
isolate_test_data = true

[enforce.typing]
strict_typescript = true
disallow_any = true
require_interfaces = true
validate_config_with = "zod"
convert_all_js_to_ts = true
typed_config_locations = ["configs/", "libs/core/config/"]

[enforce.cleanup]
ignore_patterns = [
  "logs/",
  ".venv/",
  "node_modules/",
  ".DS_Store",
  "*.bak",
  "*.refactored",
  "*.enhanced"
]
must_be_gitignored = [
  "logs/",
  ".venv/"
]

[deployment]
must_include = [
  "saar.sh",
  "package.json",
  "tsconfig.base.json",
  "nx.json",
  ".claudeignore",
  ".clauderules"
]
```

### 4. .claude/config.json

```json
{
  "project": "agentland.saarland",
  "version": "1.0.0",
  "description": "KI-Projektvorlage für die Region Saarland im agentland.saarland Framework",
  "defaultModel": "claude-3.5-sonnet",
  "regionalSettings": {
    "region": "saarland",
    "country": "germany",
    "language": "de-DE",
    "fallbackLanguage": "en-US"
  },
  "memory": {
    "enablePersistence": true,
    "storageLocation": ".claude/memory"
  },
  "security": {
    "dataGovernance": "eu-strict",
    "technicalSovereignty": "high",
    "complianceFrameworks": ["GDPR", "German-AI-Act"]
  }
}
```

### 5. CLAUDE.md

```markdown
# CLAUDE.md for agentland.saarland

This file provides guidance to the AI assistant (e.g., Claude Code) when working with code in this agentland.saarland repository.

## Project Overview

The agentland.saarland Framework is a comprehensive platform for integrating AI capabilities with development workflows. It combines agent-based architecture, Model Context Protocol (MCP) integration, and Retrieval Augmented Generation (RAG) in a consistent environment for the Saarland region.

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

## Key Technologies

- **Frontend**: React 18 with Vite for fast development
- **Backend**: Node.js with Express, Python with FastAPI
- **Testing**: Jest for unit testing
- **Build System**: Nx for monorepo management
- **Type System**: TypeScript with strict typing
- **Package Manager**: npm with workspaces
- **Web Server**: Vite dev server for the dashboard
- **AI Frameworks**: LangChain, LlamaIndex, PyTorch, Hugging Face Transformers

## MCP Integration

The framework integrates with various MCP servers:

- **sequentialthinking**: Recursive thought generation
- **context7**: Context awareness and documentation access
- **desktop-commander**: Filesystem integration and shell execution
- **brave-search**: External knowledge acquisition
- **think-mcp**: Meta-cognitive reflection
- **GitHub MCP Server**: For repository interactions
(Refer to `ai_docs/guides/mcp_tools_implementierungsplan_agentland_saarland.md` for full list)

MCP configuration is located in `configs/mcp/`.

## Agent System

The agent system is based on specialized agents that communicate with each other through a standardized protocol. Key components include:

- **Debug Agents**: For recursive debugging and bug hunting
- **Documentation Agents**: For generating documentation from code
- **Git Agents**: For integrating with Git workflows
- **Orchestrator (NavigatorAgent)**: For coordinating agent activities
(Refer to `specs/technical_roadmap_agentland_saarland.md` for agent details)

Agent architecture follows the A2A (Agent-to-Agent) protocol, with security features including:
- DNS verification
- Message validation
- Priority management
- Authentication providers

## RAG Framework

The RAG framework provides context-aware responses by:

1. Indexing code and documentation
2. Generating embeddings for efficient retrieval
3. Retrieving relevant context for a given query
4. Generating responses augmented with retrieved information

RAG configuration is located in `configs/rag/`.

## Sequential Thinking and Planning

The framework implements sequential thinking and planning through:

1. Breaking down complex problems into steps
2. Generating plans for achieving goals
3. Executing plans step by step
4. Monitoring and adapting to changes during execution

Sequential execution tools are available in `tools/mcp/integration/` and `libs/workflows/src/sequential/`.

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

## Project Structure Notes

- The project is structured as an Nx monorepo with workspaces for apps and libraries
- Configuration files are stored in the `configs/` directory
- Documentation is available in the `ai_docs/` directory with subdirectories for different aspects
- Tools and scripts for development are in the `tools/` directory
- Examples are provided in `ai_docs/examples/`
- Schema definitions are in `configs/schemas/` and `libs/core/src/schemas/`
```

### 6. config/regional/saarland.yaml

```yaml
# Regionale Konfiguration für das Saarland (agentland.saarland)
region:
  name: "Saarland"
  country: "Deutschland"
  language:
    primary: "de-DE"
    secondary: "en-US"
    dialect:
      enable: true
      name: "Saarländisch"

# Einstellungen für technische Souveränität
sovereignty:
  level: "high"
  dataSovereignty: true
  dataLocalization: "germany-only"
  complianceFrameworks:
    - "DSGVO"
    - "Deutsches KI-Gesetz"
    - "Saarländische Digitalstrategie"
  
# Regionale Datenquellen
dataSources:
  - name: "saarland-open-data"
    url: "https://www.saarland.de/opendata/api"
    type: "REST"
    description: "Saarland Open Data Portal"
  - name: "saarland-geo"
    url: "https://geoportal.saarland.de/services"
    type: "WMS"
    description: "Geographische Daten für die Region Saarland"

# Regionale API-Integrationen
apiIntegrations:
  - name: "dfki-ai-services"
    url: "https://dfki.de/services/ai"
    description: "KI-Dienste vom DFKI (Deutsches Forschungszentrum für Künstliche Intelligenz)"
  - name: "saarland-university-nlp"
    url: "https://nlp.uni-saarland.de/api"
    description: "NLP-Dienste der Universität des Saarlandes"
```

### 7. .dockerignore

```
node_modules
npm-debug.log
.DS_Store
.env
.env.*
*.local
dist
coverage
.nx/cache
build
# Ggf. weitere Verzeichnisse/Dateien, die nicht im Image benötigt werden
ai_docs/.gitbook
*.log
```

### 8. ai_docs/guides/claude_power_tools_guide.md

```markdown
# agentland.saarland Framework: Power Tools for Configuration, Commands, and Workflows

The agentland.saarland Framework employs a sophisticated suite of configuration files, commands, and organizational structures to enhance developer workflows. These tools allow for persistent context management, project customization, and efficient AI-assisted development. Below is a comprehensive guide to these systems, their syntax, and practical usage examples.

## Configuration files: Your project's AI assistant memory system

The agentland.saarland ecosystem uses several configuration mechanisms that mirror concepts in other development tools, particularly Git:

### .claude/ directory: Command central

The `.claude/` directory serves as the central configuration hub for agentland.saarland projects, similar to how `.git/` manages Git repositories. It contains:

- **Custom commands**: Stored in `.claude/commands/` as Markdown files, these define project-specific slash commands
- **Local configuration**: Developer-specific settings in `settings.local.json` that aren't shared with the team
- **MCP server configurations**: Settings for integrating the AI assistant with external tools and data sources

Example structure:
```
.claude/
├── commands/
│   ├── fix-github-issue.md
│   └── security-review.md
└── settings.local.json
```

Custom commands can be invoked with slash commands like `/project:fix-github-issue 1234`. The command files include placeholders (e.g., `$ARGUMENTS`) that get replaced with parameters.

### .claudeignore file: Context management

The `.claudeignore` file serves a function similar to `.gitignore` but focuses on reducing token usage by telling the AI assistant which files to exclude from its context. This is **critical for performance optimization** in large codebases.

Syntax follows `.gitignore` patterns:
```
.* 
LICENSE
node_modules/
dist/
*.pyc
__pycache__/
.git/
```

As of May 2025, this functionality (for the underlying Claude Code tool) is still being actively developed, with an open feature request in the Claude Code GitHub repository (Issue #79) marked as "in progress."

### .clauderules file: Coding standards

The `.clauderules` file defines project-specific architectural guidelines and coding patterns for agentland.saarland. While less documented than other configuration files, it appears to:

- Use a YAML-based configuration format (as seen in this project's template)
- Support file pattern associations
- Enforce coding standards and architectural patterns

This feature seems to be newer or less established compared to other configuration mechanisms for the underlying Claude Code tool.

## Command functionality: Managing your AI workflow

agentland.saarland development workflows are enhanced by several key commands, often facilitated by the Claude Code CLI:

### /init command: Project bootstrapping

The `/init` command (when used with Claude Code CLI) analyzes a codebase and creates a comprehensive `CLAUDE.md` guide. This automated process:

1. Examines project structure, technologies, and conventions
2. Captures build/test/lint commands specific to the project
3. Documents code style guidelines, naming conventions, and architecture
4. Creates a token-efficient context file for future interactions

This command is implemented in the Claude Code CLI as a "type: prompt" command that passes a specific request to the AI. After running, the AI assistant automatically pulls the `CLAUDE.md` file into context for future conversations.

### /memory command: Context management

The `/memory` command (when used with Claude Code CLI) manages the AI assistant's persistent memory across development sessions. When invoked, it:

- Opens a menu to select which `CLAUDE.md` file to edit
- Provides access to different memory locations
- Allows viewing and modifying memory files in your system editor

Claude Code offers three primary memory locations:
1. **Project memory** (`CLAUDE.md`) - Checked in with source code, shared with the team
2. **Project memory (local)** (`CLAUDE.local.md`) - Git-ignored, developer-specific
3. **User/system memory** (`~/.claude/CLAUDE.md`) - Global across all projects

### Claude Code CLI: The command center

Claude Code CLI is an agentic coding tool developed by Anthropic that operates directly in the terminal. Key commands include:

- `claude [options] [prompt]` - Start an interactive session
- `claude -p "prompt"` - Non-interactive/headless mode 
- `claude --continue` - Continue the most recent conversation
- `claude --resume <session-id>` - Resume a specific previous session
- Slash commands `/init`, `/memory`, `/help`, `/clear`, `/bug`, `/compact`

The CLI maintains awareness of the entire project structure and can perform real operations such as editing files and creating Git commits.

## Project organization: Structured for AI understanding

While a specific organization structure isn't mandated by underlying tools, for agentland.saarland, several patterns have emerged from the provided documents:

### ai_docs/ and specs/ directories

The `ai_docs/` directory in agentland.saarland typically contains:
- AI model specifications and parameters
- Prompt engineering guidelines and examples
- Model behavior documentation
- Input/output format specifications

The `specs/` directory in agentland.saarland typically holds:
- Technical specifications for the overall project
- API definitions and schemas
- Data models and structures
- System architecture documentation

These directories have a complementary relationship, with `specs/` containing general project specifications and `ai_docs/` containing AI-specific documentation that builds upon those specifications.

### agentland.saarland Memory Bank system

The **Memory Bank system** is a sophisticated approach to maintaining persistent project knowledge for the AI assistant within agentland.saarland. It consists of:

1. **Directory Structure**:
   - `ai_docs/memory-bank/` at the project root (as per project summary and template structure)
   - Hierarchical organization with numbered files to indicate reading order (best practice).

2. **Core Memory Files**:
   - `projectbrief.md`: Foundation document outlining project goals
   - `productContext.md`: Business and user perspective
   - `systemPatterns.md`: Technical architecture and decisions
   - `techContext.md`: Development environment specifications
   - `activeContext.md`: Current development focus
   - `progress.md`: Implementation timeline and status

The Memory Bank system interacts with configuration files by storing settings in `.claude/` directories and defining how the AI assistant interacts with the Memory Bank through configuration files like `claude_desktop_config.json` (if Claude Desktop is used).

## Comparison to Git concepts

agentland.saarland configuration files share many similarities with Git:

| Aspect | Git | agentland.saarland |
|--------|-----|-----------|
| **Configuration storage** | `.git/` directory | `.claude/` directory |
| **File exclusions** | `.gitignore` | `.claudeignore` |
| **Rule enforcement** | Git hooks | `.clauderules` |
| **Central context** | Git history | `CLAUDE.md`, Memory Bank |
| **Command interface** | `git` CLI | Claude Code CLI (for AI interaction) |

Key differences include:
- Git focuses on version control; The agentland.saarland system (via these tools) focuses on context management for AI collaboration.
- `.git/` contains technical metadata; `.claude/` and `ai_docs/` directories contain human-readable documentation and AI-specific configurations.
- Git has standardized commands; The AI assistant interaction systems are more fluid and evolving.

## Best practices in agentland.saarland projects

Successful agentland.saarland development can follow these organizational patterns:

### Documentation hierarchy

Organize documents in a clear hierarchical structure:
- Core documentation at the root level (`CLAUDE.md`, `README.md`)
- Specialized documentation in subdirectories (e.g., `ai_docs/guides/`, `specs/architecture/`)
- Context-specific files organized by feature or functionality

### File naming conventions

Use consistent, descriptive naming patterns (refer to `Erweiterte Entwicklungsrichtlinien`):
- Category identifiers (e.g., `markenimplementierungsstrategie_agentland_saarland.md`)
- Version numbers when applicable
- Descriptive suffixes indicating content type
- Example: `ProductSpec_Widget123_2024_v2.1.md` (general example)

### Custom commands implementation

Creating effective custom commands in `.claude/commands/` for agentland.saarland:

```markdown
# .claude/commands/fix-issue.md
Find and fix issue #$ARGUMENTS. Follow these steps:
1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR
```

### Directory-specific context

Some projects use multiple `CLAUDE.md` files in different directories (a pattern that could be adopted if needed):
- `apps/web/CLAUDE.md` - Web app specific context
- `libs/agents/CLAUDE.md` - Agent library specific context

### Example Memory Bank implementation

A typical Memory Bank implementation for agentland.saarland (located in `ai_docs/memory-bank/`):

```
agentland.saarland/
├── ai_docs/
│   └── memory-bank/
│       ├── projectbrief.md
│       ├── productContext.md
│       ├── systemPatterns.md
│       ├── techContext.md
│       ├── activeContext.md
│       └── progress.md
├── src/
└── CLAUDE.md 
```
(Note: `custom-instructions.md` from original example could be part of `ai_docs/prompts/`)

## Conclusion

The agentland.saarland Framework's configuration files, commands, and organizational structures, often leveraged via tools like Claude Code CLI, form a powerful ecosystem for AI-assisted development. While some components like the `.claude/` directory and `/init` command are features of underlying Anthropic tools, others like the specific Memory Bank structure are adapted for this project.

These tools collectively solve the challenge of maintaining consistent context across development sessions, allowing the AI assistant for agentland.saarland to understand project specifics without repetitive explanations. As AI assistants continue to evolve, these practices are likely to become more standardized, providing a robust foundation for human-AI collaborative development within the agentland.saarland project.
```

### 9. ai_docs/memory-bank/projectbrief.md

```markdown
# Project Brief: agentland.saarland

Foundation document outlining project goals, scope, and core objectives for the agentland.saarland initiative.
```

### 10. ai_docs/memory-bank/productContext.md

```markdown
# Product Context: agentland.saarland

Describes the business needs, user personas, target audience, and problem context that agentland.saarland aims to address.
```

### 11. ai_docs/memory-bank/systemPatterns.md

```markdown
# System Patterns: agentland.saarland

Documents the key technical architecture decisions, design patterns, and high-level system structure for agentland.saarland.
```

### 12. ai_docs/memory-bank/techContext.md

```markdown
# Technical Context: agentland.saarland

Specifications for the development environment, core technologies, frameworks, and tools used in the agentland.saarland project.
```

### 13. ai_docs/memory-bank/activeContext.md

```markdown
# Active Context: agentland.saarland

Details the current development focus, ongoing tasks, short-term priorities, and active areas of work for the agentland.saarland team.
```

### 14. ai_docs/memory-bank/progress.md

```markdown
# Progress Tracker: agentland.saarland

Tracks the implementation timeline, milestones, current status of various components, and overall project progress for agentland.saarland.
```

### 15. ai_docs/branding/markenimplementierungsstrategie_agentland_saarland.md
```markdown
Von der Vision zur Realität: Markenimplementierung für
agentland.saarland

Die Verbindung von künstlicher Intelligenz mit regionaler Identität erfordert eine durchdachte

Implementierungsstrategie, die technologische Exzellenz mit kultureller Verwurzelung verschmilzt.

agentland.saarland kann zum Vorbild für regionale KI-Ökosysteme in ganz Europa werden,

wenn die Markenstrategie konsequent und ganzheitlich umgesetzt wird.

Bundesregierung

 Diese

Implementierungsstrategie liefert konkrete Handlungsempfehlungen basierend auf erfolgreichen

Beispielen und bewährten Methoden.

BRAINPATH +3

Erfolgreiche Vorbilder: Was wir von anderen lernen können

Regionale Technologiemarken haben dann den größten Erfolg, wenn sie authentisch auf lokalen Stärken

aufbauen und gleichzeitig überregionale Strahlkraft entwickeln. Der "Silicon Saxony" Tech-Cluster in

Dresden demonstriert dies exemplarisch: Die Marke verbindet die historische Tradition der Region in

Feinmechanik und Präzisionsinstrumenten mit moderner Halbleitertechnologie.

ResearchGate

Innerhalb

von 15 Jahren wuchs das Netzwerk auf über 300 Unternehmen mit 60.000 Beschäftigten.

ResearchGate +5

Weitere inspirierende Beispiele:

Digital Hub Initiative (Deutschland): Die regionalen Digital Hubs wie "de:hub Logistics Hamburg"

oder "InsurTech Hub Munich" nutzen lokale Branchenstärken als Differenzierungsmerkmal und

erreichten gemeinsam über 500 erfolgreiche Startup-Kooperationen.

De +2

AI Sweden: Diese nationale Initiative nutzt ein regionales Hub-Modell mit lokalen Stärken und konnte

innerhalb von 3 Jahren über 70 Partner aus Wirtschaft, Forschung und öffentlichem Sektor gewinnen.

Prnewswire

Diplo

Station F (Paris): Der größte Startup-Campus der Welt schuf eine eigenständige Marke innerhalb der

"French Tech"-Initiative mit klarer visueller Identität, die industrielles Erbe (ehemaliger Bahnhof) mit

moderner Startup-Kultur verbindet.

Brainport Eindhoven: Diese niederländische Tech-Region kombiniert regionales Storytelling mit

hochspezialisierten Technologieclustern und konnte ihre internationale Bekanntheit um 45%

steigern.

SPRI +3

Die Erfolgsfaktoren dieser Initiativen für agentland.saarland:

1. Klare Positionierung an der Schnittstelle regionaler Tradition und technologischer Innovation

Focusbusiness +2

2. Aufbau eines starken Partnernetzwerks mit gemeinsamer Markennutzung

Filestage

Cam

3. Entwicklung von physischen Erlebnisräumen als Manifestation der Marke

Thales Group

4. Konsequente visuelle Sprache über alle Medien hinweg

Thebrandeducation

5. Fokus auf konkrete, sichtbare Erfolgsgeschichten statt abstrakter Visionen

Startup Genome

Cambridge-design

Die methodische Grundlage: Best Practices für die Markenimplementierung

Erfolgreiche Tech-Marken mit regionalem Fokus folgen einem strukturierten Implementierungsprozess

in vier Phasen:

BRAINPATH

Phase 1: Strategische Fundierung (1-2 Monate)

Stakeholder-Workshops mit Vertretern aus Landesregierung, Universitäten, lokalen Unternehmen

und Tech-Community

Nordic cooperation

Entwicklung eines "Brand Steering Committee" mit Schlüsselpartnern

StudySmarter

Definition von Markenkennzahlen und Erfolgsmessung

BRAINPATH +3

Phase 2: Interne Aktivierung (2-3 Monate)

Erstellung des Marken-Toolkits mit allen Designelementen

Onboarding-Prozess für alle beteiligten Organisationen

Entwicklung von Markenrichtlinien für Partner mit verschiedenen Umsetzungsstufen

All Time Design +4

Phase 3: Externe Einführung (3-4 Monate)

Schrittweise Markteinführung mit Leuchtturm-Events

Presseportal

Eskenzi PR

Gezielte Medienarbeit auf regionaler und nationaler Ebene

Eskenzi PR

Einbindung von Influencern aus Tech und Wissenschaft

BRAINPATH +2

Phase 4: Evolution und Wachstum (fortlaufend)

Regelmäßige Markenevaluierung (Brand Health Tracking)

BSC Designer

Community-Building-Maßnahmen

Maddyness

Fortlaufende Anpassung der Markenelemente

BRAINPATH

Vim-group

Besonders relevant für agentland.saarland ist die "Markenfamilie"-Strategie, bei der unter

einer Dachmarke mehrere Submarken wie "Volks-KI" und "KI-Schmiede Saar" positioniert werden,

ähnlich wie beim erfolgreichen Modell von "AI Sweden" mit seinen regionalen Hubs.

Brand Family +4

Leuchtturm-Anwendungen: Die Marke zum Leben erwecken

Demonstrator-Projekte sind entscheidend, um abstrakte KI-Technologie greifbar zu machen und die

Marke zu materialisieren.

Spok +2

 Für agentland.saarland empfehlen sich folgende Leuchtturm-

Anwendungen:

Contino +6

1. Saarland-Navigator 2.0

Ein KI-gestütztes Navigationssystem, das weit über herkömmliche Kartendienste hinausgeht und

regional relevante Informationen integriert:

Kulturelle Entdeckungsrouten mit KI-generierten Geschichten zur saarländischen Geschichte

Wirtschaftsdaten-Overlays für potenzielle Investoren

Integration von Dialekt-Erkennung und regionalen Sprachbesonderheiten

Brandbuildr

2. Industrie-KI-Werkbank

Eine modulare Toolbox für die mittelständische Industrie im Saarland:

Vorgefertigte KI-Komponenten für Produktionsoptimierung

Ki-regio

Anpassbare Benutzerschnittstellen für verschiedene Industriezweige

Open-Source-Basis mit saarländischen Partnern als Entwickler

Goodfirms +2

3. "Volks-KI" als bürgernahe Anwendung

Ein KI-Assistent für alltägliche Fragen der Saarländer:

Integration regionaler Besonderheiten wie Dialekt und kultureller Referenzen

Schnittstelle zu Verwaltungsdienstleistungen

Bürgerpartizipation durch kontinuierliche Verbesserung und Feedback

Hackernoon +5

4. KI-Erlebnisraum "Zukunftslabor Saar"

Ein physischer Showroom in Saarbrücken:

Interaktive Demonstrationen der agentland.saarland-Technologien

Workshopräume für Schulklassen und Weiterbildung

Regelmäßige öffentliche Veranstaltungen und Hackathons

TeamSnap +3

Diese Leuchtturm-Projekte sollten nach folgenden Kriterien ausgewählt werden:

Regionale Relevanz und Nutzen

Technologische Machbarkeit innerhalb von 6-12 Monaten

Sichtbarkeit und PR-Potenzial

Einbindungsmöglichkeiten für lokale Partner

Henricodolfing

Kommunikationsstrategie und visuelle Umsetzung

Integrierte Kommunikationsstrategie

Die Kommunikation von agentland.saarland sollte auf einem Drei-Ebenen-Modell basieren:

1. Fachebene: Kommunikation mit der Tech-Community und Forschung

Fokus auf: technische Tiefe, Innovationspotenzial, "agentland.saarland Framework"

Kanäle: Fachpublikationen, wissenschaftliche Konferenzen, GitHub, Tech-Meetups

Siegel+Gale

2. Wirtschaftsebene: Kommunikation mit Unternehmen und Investoren

Fokus auf: Wertschöpfungspotenzial, Umsetzbarkeit, "Deployment-Ready Framework"

Designrush

CIO

Kanäle: Wirtschaftsmedien, Branchenveranstaltungen, Investoren-Roadshow

Technical

3. Regionalebene: Kommunikation mit Bürgern und lokaler Öffentlichkeit

Fokus auf: Alltagsnutzen, Zukunftssicherung, "Volks-KI"

Kanäle: Lokale Medien, öffentliche Veranstaltungen, soziale Medien

Brandfolder +6

Eine zentrale Content-Hub-Webseite dient als Knotenpunkt für alle Kommunikationsaktivitäten und

fächert sich zu zielgruppenspezifischen Angeboten auf.

Visuelle Markenelemente in der Anwendung

Die Markenpersönlichkeit von agentland.saarland, die Technologie-Kompetenz mit regionaler

Verwurzelung verbindet, sollte sich in allen visuellen Elementen widerspiegeln:

Infogram +8

1. Logo-Anwendung:

Dynamische Logo-Varianten für verschiedene Submarken (z.B. SaarAI AG, Volks-KI)

Sortlist

Responsive Design für verschiedene Medienformate

Integration regionaler Symbole (wie stilisierte Saarschleife) in abstrahierter Form

99designs

Beautiful

2. Farbsystem:

Primärfarben aus dem Tech-Bereich (Blau, Violett) kombiniert mit sekundären Akzentfarben aus

regionalen Bezügen (Waldgrün, Industrierot)

LimeLight Marketing +2

Farbverläufe für digitale Anwendungen, Vollfarben für Print

Wizard Marketing

Spezifische Farbcodes für verschiedene Submarken

Nopio +3

3. Typografie:

Kombination einer modernen Sans-Serif-Schrift für Headlines mit einer gut lesbaren

Systemschrift für Fließtext

Made By Extreme Norgram

Einbindung einer speziellen Display-Schrift für plakative Anwendungen

Klare Hierarchieregeln für verschiedene Textebenen

Benchmark Design +2

4. Bildsprache:

Kombination von abstrakten KI-Visualisierungen mit authentischen regionalen Motiven

Sortlist

Menschen im Mittelpunkt: Saarländer in Interaktion mit Technologie

LinkedIn

Kontrastreiche Darstellung von historischen Industriestandorten und modernster Technologie

HubSpot +6

Die visuelle Identität sollte in einem umfassenden Markenbuch dokumentiert werden, das detaillierte

Anwendungsbeispiele für alle Kommunikationskanäle enthält.

Rcco

Vistaprint

Tonalität und praktische Markenpersönlichkeit

Die Tonalität von agentland.saarland muss die Balance zwischen technologischer Präzision und

regionaler Nahbarkeit finden:

markenfaktur +4

Tonalitäts-Matrix nach Zielgruppen

Zielgruppe

Formalitätsgrad

Technische

Regionale

Tiefe

Färbung

Beispiel-Headline

Fachpublikum

Mittel

Hoch

Niedrig

saarländische Forscher KI-Souveränität neu

"agentland.saarland Framework: Wie

Wirtschaft

Mittel-hoch

Mittel

Mittel

Lokale

Öffentlichkeit

Niedrig-mittel

Niedrig

Hoch

Praktische Umsetzungsbeispiele

1. Social Media:

definieren"

"Vom Stahlwerk zur KI-Schmiede: Wie die

SaarAI AG neue Wertschöpfung schafft"

"Ei jo! Unsere Volks-KI versteht jetzt auch

Saarländisch"

LinkedIn: Fachliche Updates zum Deployment-Ready Framework, Erfolgsgeschichten lokaler

Unternehmen

Startup Creator Nation-branding

Twitter: Kurze Updates zu Meilensteinen, Dialog mit Tech-Community

Instagram: Visuelle Storytelling-Formate, die Menschen hinter der Technologie zeigen

Maddyness

YouTube: "agentland.saarland Erklärt"-Serie mit 2-3 minütigen Videos zu Kerntechnologien

Cio +4

2. Event-Kommunikation:

Differenzierte Ansprache für verschiedene Veranstaltungsformate

Bildung einer eigenen Submarke für die Investoren-Roadshow "agentland.saarland Ready!"

Regionale Pressearbeit bei lokalen Events, überregionale Pressearbeit bei Fachkonferenzen

TPBO +2

3. Direkte Kommunikation:

Newsletter-Strategie mit verschiedenen thematischen Strängen

Persönliche Ansprache von Schlüsselakteuren durch das Brand Steering Committee

Community-Management mit aktiver Dialogführung

BrandDoctor

Grammarly

Konkrete Marketing- und Präsentationsmaterialien

Für die erfolgreiche Implementierung der Marke agentland.saarland sind folgende Materialien zu

entwickeln:

Europa

Fischerappelt

Grundlegende Marketingmaterialien

1. Digitales Markenbuch

Interaktives PDF mit integrierten Videobeispielen

Nopio

e-Estonia

Download-Bereich für Partner mit Logoversionen und Templates

Anwendungsbeispiele für verschiedene Kommunikationsszenarien

Made By Extreme +3

2. Präsentationsset für die SaarAI AG

PowerPoint/Keynote-Basis-Template mit flexiblen Modulen

Präsentationsvorlagen für verschiedene Zielgruppen (Investoren, Partner, Öffentlichkeit)

Integrierte Demo-Videos der Leuchtturm-Anwendungen

Canva +3

3. Imagevideo-Serie "KI trifft Saarland"

Kurzvideos (60-90 Sekunden) zu Leuchtturm-Projekten

Porträts lokaler KI-Pioniere

Mailchimp

Cambridge-dt

Animierte Erklärvideos zum "agentland.saarland Framework"

Blog +3

Spezifische Materialien für strategische Initiativen

1. Roadshow-Paket "agentland.saarland Ready!"

Modularer Messestand mit interaktiven Elementen

Maddyness

Investor Pitch Deck mit klarem Stufenmodell

Begleitbroschüre mit Investmentmöglichkeiten

McKinsey & Company

Give-aways mit echtem Mehrwert (z.B. USB-Sticks mit Demo-Software)

Slideteam +2

2. "KI-Schmiede Saar" Starter-Kit

Onboarding-Material für teilnehmende Unternehmen

Bolderagency

Tech

Partnerlogo-Varianten mit Co-Branding-Richtlinien

LimeLight Marketing

Technische Dokumentation im Corporate Design

Visme +5

3. Öffentlichkeitswirksames "Volks-KI" Kampagnenmaterial

Plakatmotive für den öffentlichen Raum

Techbehemoths

Social Media Toolkit mit Bildern und Textbausteinen

Sosmarketing

Sortlist

Einfach verständliche Handbücher für Endnutzer

6revs

Niedrigschwellige Workshop-Materialien für Schulen und Seniorenheime

Microsoft +3

Implementierungsfahrplan und nächste Schritte

Für eine erfolgreiche Implementierung der agentland.saarland Markenidentität empfehlen wir

folgenden Zeitplan:

LinkedIn McKinsey & Company

Monat 1-2: Fundament legen

Bildung des Brand Steering Committee

Brand Finance

Finalisierung aller Markenelemente

Entwicklung des digitalen Markenbuchs

AIHR +3

Monat 3-4: Interne Aktivierung

Onboarding der Kernpartner

Tech

Entwicklung der ersten Leuchtturm-Anwendungen

Destatis +2

Aufbau der digitalen Infrastruktur

ContactMonkey +2

Monat 5-6: Softlaunch

Vorstellung im geschlossenen Kreis

City Nation Place

Medien-Briefings

Digiday

Vorbereitung der Kommunikationsmaterialien

Rock Content

Monat 7-9: Öffentlicher Launch

Offizielle Launch-Veranstaltung

German-brand-award +2

Start der "KI-Schmiede Saar"

AgilHybrid

Erste öffentliche Demonstrationen des "Saarland-Navigator 2.0"

Willkommen

Edih-saarland

Monat 10-12: Wachstum und Skalierung

Start der Investoren-Roadshow

Launch der "Volks-KI"

Smartnation

Erste Erfolgsmessung und Anpassung

DeSantis Breindel +6

Der Schlüssel zum Erfolg liegt in der konsequenten Umsetzung dieser Strategie mit einem klaren Fokus

auf messbare Ergebnisse, authentische regionale Verwurzelung und technologische Exzellenz.

Ramotion

Ignitetech

 agentland.saarland hat das Potenzial, ein Vorbild für regionale KI-Initiativen in

ganz Europa zu werden

Silicon Saxony

 und gleichzeitig die digitale Zukunft des Saarlandes zu sichern.

Gaia-x +11
```

### 16. ai_docs/ui_ux/ui_verbesserungsplan_agentland_saarland.md
```markdown
UI-Verbesserungen für agentland.saarland

Analyseergebnisse

Nach der umfassenden Analyse der bestehenden UI-Komponenten von agentland.saarland habe

ich folgende Struktur identifiziert:

Ein modulares Dashboard mit konfigurierbaren Widgets

Ein EnhancedAgentCockpit für "Real-Life Agenten"-Funktionalität

Regionale Komponenten wie RegionalIdentityWidget und SaarlandDialektWidget

Ein Theming-System mit Unterstützung für helle und dunkle Designs

Die bestehenden Komponenten sind bereits gut strukturiert, folgen jedoch teilweise veralteten Patterns

und könnten modernisiert werden.

Empfohlene Verbesserungen

1. Migration zu Tailwind CSS

Anstatt die derzeit eingebetteten CSS-Styles mit  styled-jsx  zu verwenden, empfehle ich die Migration

zu Tailwind CSS. Vorteile:

Bessere Performance durch Utility-First-Ansatz

Responsives Design mit einfachen Klassen

Konsistentes und skalierbares Design-System

Benutzerdefinierte Themes über die Tailwind-Konfiguration

2. Komponenten-Modernisierung

Shadcn/UI Integration: Verwendung der High-Quality, zugänglichen Komponenten der Shadcn/UI-

Bibliothek

Verbesserte Zugänglichkeit: Implementierung von ARIA-Attributen und Keyboard-Navigation

Animationen und Übergänge: Sanfte Übergänge mit Framer Motion

Interaktives Design: Verbesserte Hover- und Fokus-Zustände

3. Funktionale Verbesserungen

Dark Mode Toggle: Verbesserte Dark-Mode-Integration mit System-Präferenz-Erkennung

Erweiterte Widget-Konfigurationen: Speichern von Anpassungen

Verbesserte Drag-and-Drop-Funktionalität: Intuitivere Bewegung und Zustandsänderungen

Progressive Enhancement: Graceful Degradation für ältere Browser

4. Saarland-spezifische Verbesserungen

Verbesserte regionale Karte: Interaktive SVG-Karte des Saarlandes

Kulturelle Integration: Bessere Darstellung saarländischer Kultur

Bildoptimierung: Optimierte Bildanzeige mit Next.js Image-Komponenten

Implementierungsplan

Phase 1: Setup und Konfiguration

1. Tailwind CSS-Integration

2. Definition eines Tailwind-Themes basierend auf dem bestehenden Color Schema

3. Einrichtung der Shadcn/UI-Komponenten

Phase 2: Komponenten-Migration

1. Dashboard-Komponente auf Tailwind CSS migrieren

2. EnhancedAgentCockpit-Komponente modernisieren

3. RegionalIdentityWidget verbessern

4. Dark Mode Toggle optimieren

Phase 3: UI/UX-Verbesserungen

1. Verbesserung der Zugänglichkeit

2. Animation und Übergänge hinzufügen

3. Mobile-Responsiveness optimieren

4. Performance-Optimierungen

Beispiel-Implementierungen

Im Folgenden finden Sie beispielhafte Implementierungen der wichtigsten Komponenten.
```

### 17. ai_docs/guides/prompt_best_practices_agentland_saarland.md
```markdown
Prompt Best-Practice für Claude Code CLI:
agentland.saarland

Kontext

Du bist ein KI-Entwicklungsexperte im agentland.saarland Framework für das Projekt

agentland.saarland.

Das Projekt kombiniert modernste KI-Agententechnologie mit regionaler Identität
des Saarlandes.

Du sollst bei der Implementierung von Komponenten gemäß der technischen Roadmap

helfen.

Technischer Rahmen

Architektur: Multiagenten-System mit Orchestrierungsebene, spezialisierten Agenten
und Wissensmanagement

Technologien: LangChain/LangGraph, LlamaIndex, FastAPI/Next.js, PostgreSQL mit

pgvector

Regionale Integration: Saarländische Datenquellen, Sprachunterstützung (Deutsch,
Französisch, optional Dialekt)

Leitprinzipien: Privacy-by-Design, Ethics-by-Design, API-First, Microservices

Anweisungen an Claude

1. Analysiere den Projektkontext und die vorhandenen Dateien.

2. Entwirf oder implementiere Code, der genau den Projektspezifikationen
entspricht.

3. Halte dich strikt an die definierten Architekturprinzipien und die Monorepo-
Struktur.

4. Verwende ausschließlich TypeScript mit strenger Typisierung, keine 'any' Typen.

5. Implementiere React-Komponenten als funktionale Komponenten mit Hooks.

6. Schreibe alle Benutzeroberflächen-Texte und Kommentare auf Deutsch.

7. Berücksichtige regionale Elemente des Saarlandes in Datenintegrationen.

8. Dokumentiere Code umfassend mit JSDoc-Kommentaren und erzeuge Beispiele.

9. Berücksichtige nachhaltige Fehlerbehandlung und Logging.

10. Implementiere Tests für alle erstellten Komponenten.

Agent-System Implementierung

- Setze die "CrewAI"-Struktur um, in der Agenten mit verschiedenen Rollen

zusammenarbeiten

- Jeder Agent benötigt eine klar definierte Rolle und Schnittstelle

- Implementiere Chain-of-Thought für Transparenz der Agentenprozesse

- Stelle eine Feedbackschleife für kontinuierliche Verbesserung bereit

- Orchestriere Agenten über den zentralen Navigator-Agenten

Codestruktur-Konventionen

- Dateinamen: kebab-case.ts

- Komponenten: PascalCase.tsx

- Funktionen und Variablen: camelCase

- Interfaces: IPascalCase

- Types: TPascalCase

- Enums: PascalCaseEnum

- Hooks: useHookName

- Konstanten: UPPER_SNAKE_CASE

Regionale Integration

- Integriere regionale Datenquellen über standardisierte Konnektoren
- Implementiere Mehrsprachigkeit (Deutsch, Französisch)

- Berücksichtige saarländische Besonderheiten und Dialekte als optionales Feature

- Verbinde mit regionalen Services (Verkehrsverbund, E-Government, etc.)

- Nutze kontextbezogene Beispiele aus dem Saarland

Beispiel-Anfrage

Implementiere einen spezialisierten Tourismus-Agenten, der Sehenswürdigkeiten im

Saarland empfehlen kann.

Integriere eine RAG-Komponente für kontextuelles Wissen über saarländische

Attraktionen.

Beispiel-Umsetzung (Muster für Antworten)

typescript

/**

 * TourismusAgent.ts

 * Spezialisierter Agent für touristische Empfehlungen im Saarland
 * 

 * Dieser Agent verarbeitet Anfragen zu Sehenswürdigkeiten und

 * gibt kontextbezogene Empfehlungen basierend auf den Interessen

 * und dem Standort des Nutzers.
 */

import  {  BaseAgent  }  from  '@libs/agents/base-agent';
import  {  IAttraktion  }  from  '@libs/shared/types';
import  {  VektorSpeicher  }  from  '@libs/rag/vektor-speicher';
import  { createChainOfThought }  from  '@libs/agents/chain-of-thought';

/**
 * Interface für TourismusAgent-Konfiguration
 */
interface  ITourismusAgentConfig  {
    /** Maximale Anzahl von Empfehlungen pro Anfrage */
  maxEmpfehlungen:  number;
    /** Standard-Suchradius in Kilometern */
  standardRadius:  number;
    /** Pfad zur Wissensdatenbank */
  wissensDBPfad:  string;
}

/**
 * TourismusAgent - Spezialisierter Agent für Saarland-Tourismus
 */
export  class  TourismusAgent  extends  BaseAgent  {
    private vektorDB:  VektorSpeicher<IAttraktion>;
    private config:  ITourismusAgentConfig;

    constructor(config:  ITourismusAgentConfig)  {
        super('tourismus-agent');
        this.config  = config;
        this.vektorDB  =  new  VektorSpeicher<IAttraktion>(config.wissensDBPfad);
        this.initializeChainOfThought();
    }

    /**
   * Initialisiert den Chain-of-Thought Prozess für Transparenz
   */
    private  initializeChainOfThought():  void  {
        this.denkprozess  =  createChainOfThought([
      'NutzerinteressenAnalyse',
      'StandortBestimmung',
      'AttraktionenSuche',
      'KontextuelleFilterung',
      'PersonalisierteRangliste',
      'EmpfehlungsGenerierung'
        ]);
    }

    /**
   * Findet passende Sehenswürdigkeiten basierend auf Nutzerinteressen und Standort
   * 
   * @param interessen - Array von Interessenskategorien des Nutzers
   * @param standort - Aktueller Standort des Nutzers (Koordinaten oder Ortsname)
   * @param radius - Optionaler Suchradius in Kilometern
   * @returns Sortierte Liste von empfohlenen Attraktionen
   */
    public  async  empfehleSehenswürdigkeiten(
    interessen:  string[],
    standort:  [number,  number]  |  string,
    radius?:  number
    ):  Promise<IAttraktion[]>  {
        this.logger.info(`Suche Attraktionen für Interessen: ${interessen.join(', ')}`);
        // Chain-of-Thought Protokollierung
        await  this.denkprozess.execute('NutzerinteressenAnalyse',  { interessen });

        const suchRadius = radius ||  this.config.standardRadius;
        const standortKoordinaten =  await  this.resolveStandort(standort);

        await  this.denkprozess.execute('StandortBestimmung',  { standort, standortKoordinaten });
        // RAG-Komponente: Vektorsuchquery bauen
        const query =  this.buildVectorQuery(interessen);
        const attraktionen =  await  this.vektorDB.suche(query,  {
      filter:  {
        geoDistance:  {
          koordinaten: standortKoordinaten,
          distanz: suchRadius
        }
      },
      limit:  this.config.maxEmpfehlungen
        });

        await  this.denkprozess.execute('AttraktionenSuche',  {
      anzahlGefunden: attraktionen.length,
      suchRadius
        });

// Kontextuelle Filterung (Wetter, Saison, Öffnungszeiten)
        const gefilterteAttraktionen =  await  this.kontextuelleFilterung(attraktionen);

        await  this.denkprozess.execute('PersonalisierteRangliste',  {
      anzahlNachFilter: gefilterteAttraktionen.length
        });

        return gefilterteAttraktionen;
    }

    /**
   * Baut eine Vektorquery basierend auf Nutzerinteressen
   */
    private  buildVectorQuery(interessen:  string[]):  string  {
        // Kombination aus Interessen und saarländischem Kontext
        return  `Sehenswürdigkeiten im Saarland zu: ${interessen.join(', ')}`;
    }

    /**
   * Filtert Attraktionen basierend auf aktuellem Kontext
   */
    private  async  kontextuelleFilterung(attraktionen:  IAttraktion[]):  Promise<IAttraktion[]>  {
        // Implementierung von kontextueller Filterung...
        await  this.denkprozess.execute('KontextuelleFilterung',  {});
        return attraktionen;
    }

    /**
   * Wandelt einen Ortsnamen in Koordinaten um
   */
    private  async  resolveStandort(
    standort:  [number,  number]  |  string
    ):  Promise<[number,  number]>  {
        if  (Array.isArray(standort))  {
      return standort;
        }

// Geocoding-Implementierung für saarländische Ortsnamen
        // ...
        return  [49.2354,  6.9968];  // Fallback: Saarbrücken Zentrum
    }
}

// Beispiel für Testfall
if  (process.env.NODE_ENV  ===  'test')  {
    describe('TourismusAgent',  ()  =>  {
        it('sollte Sehenswürdigkeiten basierend auf Interessen empfehlen',  async  ()  =>  {
      // Test-Implementierung...
        });
    });
}
```

Best Practices für Claude Code CLI Antworten

- Immer vollständigen, lauffähigen Code liefern, keine Platzhalter
- Detaillierte Erklärungen zu Architekturentscheidungen geben
- Komponenten im Kontext des Gesamtsystems beschreiben
- Regional relevante Beispiele und Anwendungsfälle verwenden
- Integrationspunkte mit anderen Systemteilen klar kennzeichnen
- Potenzielle Herausforderungen und Lösungsansätze aufzeigen
- Tests und Dokumentation als integralen Bestandteil behandeln

Qualitätskriterien

- Der Code folgt streng TypeScript mit vollständiger Typisierung
- Benutzeroberflächen-Texte sind auf Deutsch
- Kommentare bieten wertvolle Kontextinformationen
- Komponenten lassen sich nahtlos in die Monorepo-Struktur integrieren
- Alle Funktionen beinhalten Fehlerbehandlung
- Regionale Besonderheiten werden berücksichtigt
- Tests sind implementiert oder vorgesehen
- Code verwendet die definierten Namenskonventionen

Abschließender Hinweis

Dieses Projekt verbindet innovative KI-Technologie mit regionaler Identität. Es
ist essentiell, dass der Code sowohl technisch exzellent als auch kulturell
sensibel ist und die saarländische Identität respektiert. Fokussiere auf solide
technische Fundamentierung, klare Strukturierung und nahtlose Integration der
regionalen Elemente.
```

### 18. ai_docs/guides/mcp_tools_implementierungsplan_agentland_saarland.md
```markdown
MCP-Tools Implementierungsplan für agentland.saarland

1. Vorbereitungen

Backup der vorhandenen Konfiguration

bash

# Backup der aktuellen MCP-Server-Konfiguration erstellen
tar -czvf mcp_servers_backup_$(date +%Y%m%d).tar.gz ~/.claude/mcp.json

Umgebung vorbereiten

bash

# Projektverzeichnis navigieren
cd /path/to/agentland.saarland 
# Abhängigkeiten aktualisieren
npm install
# Benötigte MCP-Tools installieren
npm install -g @smithery/cli@latest

2. MCP-Server Integration

Desktop Commander Integration

bash

# Desktop Commander MCP-Server hinzufügen
claude mcp add '{"mcpServers": {"desktop-commander": {"command": "npx", "args": ["-y", "@smithery/cli@latest", "run", "@wonderwhy-er/desktop-commander"]}}}'

Context7-MCP Integration

bash

# Context7-MCP Server hinzufügen
claude mcp add '{"mcpServers": {"context7-mcp": {"command": "npx", "args": ["-y", "@upstash/context7-mcp", "--key", "YOUR_CONTEXT7_API_KEY"]}}}'

Clear Thought Integration

bash

# Clear Thought Server hinzufügen
claude mcp add '{"mcpServers": {"clear-thought": {"command": "npx", "args": ["-y", "@waldzellai/clear-thought", "--key", "YOUR_CLEAR_THOUGHT_API_KEY"]}}}'

Sequential Thinking Server

bash

# Sequential Thinking Server hinzufügen
claude mcp add '{"mcpServers": {"server-sequential-thinking": {"command": "npx", "args": ["-y", "@smithery-ai/server-sequential-thinking"]}}}'

GitHub Integration

bash

# GitHub MCP-Server hinzufügen
claude mcp add '{"mcpServers": {"github": {"command": "npx", "args": ["-y", "@smithery-ai/github", "--key", "YOUR_GITHUB_TOKEN"]}}}'

Shadcn UI Integration

bash

# Shadcn UI MCP-Server hinzufügen
claude mcp add '{"mcpServers": {"shadcn-ui-mcp-server": {"command": "npx", "args": ["-y", "@ymadd/shadcn-ui-mcp-server", "-p", "3007"]}}}'

DeepView Integration

bash

# DeepView MCP-Server hinzufügen
claude mcp add '{"mcpServers": {"deepview-mcp": {"command": "npx", "args": ["-y", "@ai-1st/deepview-mcp", "--key", "YOUR_DEEPVIEW_API_KEY"]}}}'

Gemini MCP Integration

bash

# Gemini MCP-Server hinzufügen
claude mcp add '{"mcpServers": {"geminimcptest": {"command": "npx", "args": ["-y", "@palolxx/geminimcptest", "--key", "YOUR_GEMINI_API_KEY"]}}}'

DeepResearch MCP

bash

# DeepResearch MCP-Server hinzufügen
claude mcp add '{"mcpServers": {"DeepResearchMCP": {"command": "npx", "args": ["-y", "@ameeralns/DeepResearchMCP", "--key", "YOUR_DEEPRESEARCH_API_KEY"]}}}'

3. Verifikation der Installation

Überprüfung des Status

bash

# MCP-Server Status überprüfen
claude mcp list
# MCP-Server starten (falls nicht automatisch gestartet)
claude mcp start

Funktionstest

bash

# Eigenes Testskript ausführen
node test-a2a-security.js
# Verbindung zu den MCP-Servern testen
node tools/scripts/mcp/test-connections.js

4. Projektspezifische Integration

Framework-Anpassungen für agentland.saarland

In der Datei  `libs/mcp/src/setup_mcp.js` (Pfad anpassen an Monorepo-Struktur):
javascript
// MCP-Tools in das agentland.saarland Framework integrieren
const  setupMCPIntegration  =  async  ()  =>  {
    try  {
        console.log('Initialisiere MCP-Tools für agentland.saarland...');
        
        // Desktop Commander integrieren
        const desktopCommander =  await  initializeMCPService('desktop-commander');
        
        // Sequential Thinking in Workflow integrieren
        const sequentialThinking =  await  initializeMCPService('server-sequential-thinking');
        // Annahme: workflowEngine ist verfügbar
        // workflowEngine.registerThinkingService(sequentialThinking);
        
        // GitHub-Integration für Code-Repositories
        const github =  await  initializeMCPService('github');
        // Annahme: registerCodeRepository ist verfügbar
        // registerCodeRepository(github);
        
        // DeepView für Code-Analyse
        const deepview =  await  initializeMCPService('deepview-mcp');
        // Annahme: registerCodeAnalyzer ist verfügbar
        // registerCodeAnalyzer(deepview);
        
        // DeepResearch für komplexe Recherchen
        const deepResearch =  await  initializeMCPService('DeepResearchMCP');
        // Annahme: registerResearchService ist verfügbar
        // registerResearchService(deepResearch);
        
        console.log('MCP-Tools erfolgreich integriert!');
        return  true;
    }  catch  (error)  {
        console.error('Fehler bei der MCP-Integration:', error);
        return  false;
    }
};
module.exports  =  { setupMCPIntegration };

MCP-Integration in die Agent-Architektur

In der Datei  `libs/agents/src/base/MCPCapableAgent.ts` (Pfad anpassen):
typescript
import  {  MCPClient  }  from  '@libs/mcp/client'; // Pfad anpassen
import { BaseAgent, BaseAgentConfig } from './BaseAgent'; // Pfad anpassen

export interface MCPCapableAgentConfig extends BaseAgentConfig {
    requiredTools?: string[];
}

export  class  MCPCapableAgent  extends  BaseAgent  {
    protected mcpClient:  MCPClient;
    protected availableTools:  string[]  =  [];
    protected requiredTools: string[] = [];

    constructor(config: MCPCapableAgentConfig)  {
        super(config);
        this.mcpClient  =  new  MCPClient();
        if (config.requiredTools) {
            this.requiredTools = config.requiredTools;
        }
        this.initializeTools();
    }

    async  initializeTools()  {
        const tools =  await  this.mcpClient.listTools();
        this.availableTools  = tools.map(tool => tool.name);
        this.setupAgentSpecificTools();
        this.checkRequiredTools();
    }
    
    protected checkRequiredTools(): void {
        const missingTools = this.requiredTools.filter(
            tool => !this.availableTools.includes(tool)
        );
        if (missingTools.length > 0) {
            this.logger.warn(
                `${this.constructor.name}: Fehlende MCP-Tools: ${missingTools.join(', ')}`
            );
        }
    }

    setupAgentSpecificTools()  {
        // Wird von spezialisierten Agenten überschrieben
    }

    async  useThinkingTool(query: string, approach = '', options = {})  {
        if  (this.availableTools.includes('server-sequential-thinking'))  { // Name korrigiert
      return  this.mcpClient.callTool('server-sequential-thinking',  {
        query,
        approach,
        ...options
      });
        }
        // Fallback zu geminithinking oder anderem Tool hier, falls vorhanden
        throw  new  Error('Kein primäres Thinking-Tool (server-sequential-thinking) verfügbar.');
    }
  
    // Weitere Tool-spezifische Methoden...
}
```

5. Einrichtung für spezialisierte Agenten

Navigator-Agent MCP-Konfiguration

In der neu zu erstellenden Datei `libs/agents/src/specialized/NavigatorAgent.ts` (Pfad anpassen):
typescript
import  {  MCPCapableAgent, MCPCapableAgentConfig  }  from  '../base/MCPCapableAgent'; // Pfad anpassen

export interface NavigatorAgentConfig extends MCPCapableAgentConfig {}

export  class  NavigatorAgent  extends  MCPCapableAgent  {
    constructor(config: NavigatorAgentConfig)  {
        super({
      ...config,
      agentType:  'navigator',
      description:  'Zentraler Navigator-Agent für agentland.saarland',
      requiredTools: [ // Benötigte Tools hier definieren
            'server-sequential-thinking',
            'github',
            'deepview-mcp',
            'DeepResearchMCP'
        ]
        });
    }

    // Navigationsspezifische Methoden implementieren...
}
```

Tourismus-Agent MCP-Konfiguration

In der neu zu erstellenden Datei `libs/agents/src/specialized/TourismusAgent.ts` (Pfad anpassen):
typescript
import  {  MCPCapableAgent, MCPCapableAgentConfig   }  from  '../base/MCPCapableAgent'; // Pfad anpassen

export interface TourismusAgentConfig extends MCPCapableAgentConfig {}

export  class  TourismusAgent  extends  MCPCapableAgent  {
    constructor(config: TourismusAgentConfig)  {
        super({
      ...config,
      agentType:  'tourismus',
      description:  'Tourismus-Agent für agentland.saarland',
      requiredTools: [ // Benötigte Tools hier definieren
            'server-sequential-thinking',
            'DeepResearchMCP'
        ]
        });
    }
  
    // Tourismus-spezifische Methoden implementieren...
}
```

6. Automatisierung und Deployment

Automatisierte MCP-Setup-Skript

Erstellen eines Skripts in `scripts/setup-mcp-tools.sh`:
bash
#!/bin/bash
# agentland.saarland MCP-Tools Setup
set -e
echo "==== agentland.saarland MCP-Tools Setup ===="
echo "Vorbereitung der Umgebung..."
# Backup erstellen
mkdir -p backups
tar -czvf backups/mcp_servers_backup_$(date +%Y%m%d).tar.gz ~/.claude/mcp.json 2>/dev/null || echo "Kein bestehendes Backup oder Fehler beim Backup."

echo "MCP-Server-Konfigurationen werden hinzugefügt..."
# JSON-Datei erstellen
cat > temp_mcp_config.json << EOL
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "@wonderwhy-er/desktop-commander"]
    },
    "context7-mcp": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--key", "YOUR_CONTEXT7_API_KEY_ENV_VAR_NAME"] 
    },
    "clear-thought": {
      "command": "npx",
      "args": ["-y", "@waldzellai/clear-thought", "--key", "YOUR_CLEAR_THOUGHT_API_KEY_ENV_VAR_NAME"]
    },
    "server-sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@smithery-ai/server-sequential-thinking"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@smithery-ai/github", "--key", "YOUR_GITHUB_TOKEN_ENV_VAR_NAME"]
    },
    "shadcn-ui-mcp-server": {
      "command": "npx",
      "args": ["-y", "@ymadd/shadcn-ui-mcp-server", "-p", "3007"]
    },
    "deepview-mcp": {
      "command": "npx",
      "args": ["-y", "@ai-1st/deepview-mcp", "--key", "YOUR_DEEPVIEW_API_KEY_ENV_VAR_NAME"] 
    },
    "geminimcptest": {
      "command": "npx",
      "args": ["-y", "@palolxx/geminimcptest", "--key", "YOUR_GEMINI_API_KEY_ENV_VAR_NAME"]
    },
    "DeepResearchMCP": {
      "command": "npx",
      "args": ["-y", "@ameeralns/DeepResearchMCP", "--key", "YOUR_DEEPRESEARCH_API_KEY_ENV_VAR_NAME"]
    }
  }
}
EOL

# Claude MCP hinzufügen - einzeln für Fehlerbehandlung
for server_name in desktop-commander context7-mcp clear-thought server-sequential-thinking github shadcn-ui-mcp-server deepview-mcp geminimcptest DeepResearchMCP; do
  echo "MCP-Server hinzufügen: $server_name"
  jq -c ".mcpServers.\"$server_name\"" temp_mcp_config.json > temp_server.json
  claude mcp add "{\"$server_name\": $(cat temp_server.json)}" || echo "Fehler beim Hinzufügen von $server_name. Überspringe."
  sleep 1
done

# Aufräumen
rm temp_mcp_config.json temp_server.json
# Status überprüfen
echo "Überprüfe MCP-Server Status..."
claude mcp list
echo "MCP-Server werden gestartet..."
claude mcp start
echo "Setup abgeschlossen!"
echo "==== agentland.saarland MCP-Tools bereit ===="
```

Integration in Projekt-Setup

Anpassung der Datei `package.json`:
json
{
  "scripts": {
    "setup:mcp": "bash scripts/setup-mcp-tools.sh",
    "start:mcp": "claude mcp start",
    "stop:mcp": "claude mcp stop",
    "test:mcp": "node tools/scripts/mcp/test-connections.js"
  }
}
```

7. Dokumentation

Neue Dokumentationsdatei erstellen in `ai_docs/guides/mcp_tools_integration_guide.md` (Pfad anpassen):
markdown
# MCP-Tools Integration in agentland.saarland

Dieses Dokument beschreibt die Integration und Nutzung der MCP-Tools (Model Control Protocol) im agentland.saarland Framework.

## Überblick

Die MCP-Tools erweitern die Fähigkeiten der KI-Agenten durch spezialisierte Dienste wie:
- **Desktop Commander**: Systeminteraktion und Dateimanagement
- **Sequential Thinking**: Strukturierte Denkprozesse für komplexe Probleme
- **GitHub Integration**: Code-Repository-Management
- **DeepView**: Code-Analyse und -Verständnis
- **DeepResearch**: Komplexe Recherchen und Informationsaggregation
- **Context7**: Kontext- und Dokumentationszugriff
- **Shadcn UI MCP**: Komponentenreferenz für UI-Entwicklung

## Einrichtung

Die MCP-Tools können mit dem Setup-Skript installiert und konfiguriert werden:
```bash
npm run setup:mcp
```
Dies erfordert, dass Umgebungsvariablen für API-Keys (z.B. `YOUR_CONTEXT7_API_KEY_ENV_VAR_NAME`) gesetzt sind.

Einzelne Tools können auch manuell hinzugefügt werden:
```bash
claude mcp add '{"mcpServers": {"tool-name": {"command": "npx", "args": [...]}}}'
```

## Verwendung in Agenten

Die spezialisierten Agenten von agentland.saarland greifen über die `MCPCapableAgent`-Basisklasse auf die MCP-Tools zu.

### Verfügbare Tools Übersicht

| Tool-Name                  | Primäre Funktion                        | Empfohlene Agenten        |
|----------------------------|-----------------------------------------|---------------------------|
| desktop-commander          | Dateisystem-Interaktion                 | Alle                      |
| server-sequential-thinking | Strukturierte Denkprozesse              | Navigator, Verwaltung     |
| github                     | Code-Repository-Management            | Entwicklung, KI-Schmiede  |
| deepview-mcp               | Code-Analyse                            | Entwicklung, KI-Schmiede  |
| DeepResearchMCP            | Informationsrecherche                   | Tourismus, Kultur, Forschung|
| context7-mcp               | Dokumentations- & Kontextabruf        | Alle                      |
| shadcn-ui-mcp-server       | UI Komponenten Referenz               | UI-Entwicklung Agent      |

### Beispiel: Nutzung des Sequential Thinking Tools
```typescript
// const agent = new YourMCPCapableAgentSubclass(config);
// const denkprozess = await agent.useThinkingTool(
//   "Wie optimiere ich die Tourismusroute im nördlichen Saarland?",
//   "Berücksichtige Verkehrsanbindungen und lokale Sehenswürdigkeiten"
// );
```

## Fehlerbehebung

Bei Problemen mit den MCP-Tools:
1. Status prüfen: `claude mcp list`
2. Neustart: `claude mcp restart` (oder `claude mcp stop` und `claude mcp start`)
3. Logs prüfen: `claude mcp logs <server-name>`
4. Verbindungstest: `npm run test:mcp` (stellt sicher, dass `tools/scripts/mcp/test-connections.js` existiert und funktioniert)

## Weitere Ressourcen
- Claude MCP Dokumentation (Offizielle Dokumentation des Claude CLI)
- agentland.saarland Framework-Dokumente
  - `ai_docs/architecture/technical_roadmap_agentland_saarland.md`
  - `libs/agents/src/base/MCPCapableAgent.ts`
```

### 19. specs/technical_roadmap_agentland_saarland.md
```markdown
# KI-Zukunft Saar: Technische Roadmap für agentland.saarland

Das Projekt agentland.saarland steht an der Schnittstelle zwischen regionaler Identität und KI-Innovation. Nach umfassender Analyse lässt sich feststellen, dass das GitHub-Repository `agentland.saarland` derzeit nicht öffentlich zugänglich ist, was auf ein frühes Projektstadium oder einen konzeptionellen Status hindeutet. Dennoch bietet die fortschrittliche KI-Forschungslandschaft des Saarlandes einen idealen Nährboden für eine technisch ambitionierte Umsetzung dieses Vorhabens.

## Status quo: Eine Vision in Entstehung

Das Repository (z.B. `https://github.com/agentland-saarland/agentland.saarland`) existiert entweder nicht öffentlich oder befindet sich in einer frühen Konzeptionsphase. Diese Situation bietet die Chance, eine fundierte technische Architektur von Grund auf zu entwickeln, die moderne KI-Agenten-Technologien mit der regionalen Identität des Saarlandes verbindet.

Die KI-Landschaft im Saarland selbst ist hervorragend entwickelt mit internationalen Leuchtturminstitutionen wie:
- Deutsches Forschungszentrum für Künstliche Intelligenz (DFKI)
- Saarland Informatics Campus mit zwei Max-Planck-Instituten
- CISPA Helmholtz-Zentrum für Informationssicherheit
- Zentrum für Mechatronik und Automatisierungstechnik (ZeMA)

Diese Einrichtungen haben das Saarland zu einem der führenden KI-Standorte in Europa gemacht, mit besonderer Expertise in neurosymbolischer KI.

## Technische Architektur: Das agentland.saarland Framework

Für agentland.saarland empfiehlt sich eine Multiagent-Systemarchitektur mit hybrider Struktur, die zentrale Koordination mit dezentraler Ausführung verbindet:

1.  **Orchestrierungsschicht**: Ein zentraler "Saarland-Navigator"-Agent als Einstiegspunkt und Koordinator.
2.  **Spezialisierte Agentenebene**: Fachspezifische Agenten für Bereiche wie Tourismus, Verwaltung und Wirtschaft.
3.  **Tool-Integration-Schicht**: API-Gateway und MCP-Integration für die Anbindung an externe Dienste und Datenquellen.
4.  **Gemeinsamer Wissensbereich**: Vektorindex-System (z.B. mit LlamaIndex und pgvector) für regionale Daten und Informationen.

Der empfohlene technologische Stack umfasst:
- **Agentenorchestrierung**: LangChain/LangGraph, CrewAI-Muster
- **Wissensmanagement/RAG**: LlamaIndex
- **Backend-Framework**: FastAPI (Python), Next.js (TypeScript, auch für Frontend)
- **Datenbank**: PostgreSQL mit pgvector Erweiterung
- **Containerisierung & Orchestrierung**: Docker und Kubernetes (ggf. K3s)

Architektonisch sollten folgende Prinzipien verfolgt werden:
- Microservices-Architektur mit eigenständigen Agenten
- API-First-Ansatz mit klar definierten Schnittstellen (OpenAPI)
- Event-Driven Architecture für asynchrone Kommunikation
- Privacy-by-Design und Ethics-by-Design als Grundprinzipien

## KI-Agenten-System: Das Herz von agentland.saarland

Das Kernstück des Projekts sollte ein modulares Multiagenten-System sein mit:

**Zentrale Agenten:**
-   `NavigatorAgent`: Primäre Nutzerinteraktion und Anfragenweiterleitung.
-   `ResearchAgent`: Informationsrecherche in regionalen Datenquellen und via MCP-Tools.
-   `PlannerAgent`: Komplexe Planungsaufgaben (z.B. Reiserouten).
-   `AdminAgent`: Interaktion mit öffentlichen Diensten.
-   `MonitoringAgent`: Qualitätssicherung für Outputs anderer Agenten.

**Fachspezifische Agenten (Beispiele):**
-   `TourismAgent`: Spezialisiert auf Sehenswürdigkeiten und Freizeit.
-   `BusinessAgent`: Unterstützung für Unternehmen und Gründer.
-   `EducationAgent`: Informationen zu Bildungseinrichtungen.
-   `CultureAgent`: Fokus auf kulturelle Besonderheiten des Saarlandes.

Für die Agentenkoordination bietet sich die Implementierung des CrewAI-Musters an. Transparenz wird durch Chain-of-Thought-Prompting erhöht, während eine kontinuierliche Feedback-Schleife das System selbstlernend macht.

## Markenintegration: Wie Technik die Identität widerspiegelt

Die Markenidentität "agentland.saarland" verbindet die bestehende Saarland-Marke ("Großes entsteht immer im Kleinen") mit den KI-Stärken der Region. Die technische Umsetzung sollte diese Identität reflektieren:

-   **Visuelle Integration**: Kombination des Saarland-Umrisses mit KI-typischen Visualisierungen, erweiterte Farbpalette, konsistente Bildsprache.
-   **Konzeptionelle Integration**: Human-Centric AI, KI als Brücke zwischen Tradition und Innovation, "Hidden Champion"-Narrativ im KI-Bereich, "Mitmach-KI" für Bürgerbeteiligung.

## Regionale Integration: Das Saarland in der Technologie

Das Alleinstellungsmerkmal von agentland.saarland:

-   **Datenintegration**: Konnektoren zu regionalen Datenquellen (Verwaltung, Tourismus, Kultur), saarländische Wissensbasis mit RAG, regelmäßige Updates.
-   **Sprachliche und kulturelle Integration**: Saarländischer Dialekt (optional), Mehrsprachigkeit (Deutsch, Französisch, ggf. Luxemburgisch), Einbindung regionaler kultureller Kontexte.
-   **Technische Integration**: Anbindung an E-Government-Dienste, Verkehrsverbund Saar, regionale Wirtschaftsförderungsplattformen.

## Entwicklungsfahrplan (Beispiel)

-   **Phase 1: Grundlagen (Monate 1-3)**: Architekturspezifikation, Infrastrukturaufbau, Implementierung des Orchestrierungs-Agenten.
-   **Phase 2: Kernfunktionalitäten (Monate 4-6)**: Entwicklung spezialisierter Agenten, RAG-Komponente, API-Integration mit regionalen Diensten.
-   **Phase 3: Erweiterung (Monate 7-9)**: Integration weiterer Agenten, Ausbau Datenkonnektoren, Beta-Launch.
-   **Phase 4: Finalisierung (Monate 10-12)**: Qualitätssicherung, Optimierung, Dokumentation, Schulung, öffentlicher Launch.

## Leuchtturm-Anwendungen mit regionalem Fokus

-   **Saarland-Navigator 2.0**: Multimodales Interface, kontextbewusste Navigation, personalisierte Empfehlungen, ÖPNV-Integration, Barrierefreiheit.
-   **Weitere**: Saar-KI-Assistant (Verwaltung), Wirtschafts-Navigator Saar (Unternehmen), Saar-KulturBot (Kultur).

## Volks-KI und KI-Schmiede Saar: Demokratische Innovation

-   **Volks-KI**: Demokratisch kontrollierte KI-Infrastruktur, partizipatives Training, transparente Daten, Open-Source-Kernkomponenten, Feedbacksystem.
-   **KI-Schmiede Saar**: Technische Innovationsplattform, Entwicklungsplattform für lokale KI-Projekte, KI-Ressourcenpool, API-Marktplatz, SDKs/Tools. (Siehe `specs/initiatives/ki_schmiede_saar_konzept_agentland_saarland.md`)

## Integration mit externen KI-Diensten

Über eine Abstraktionsschicht:
-   **Empfohlene Integrationen**: Claude API (Anthropic), Groq API, lokale Open-Source-Modelle.
-   **Technische Aspekte**: Message-Queue, Circuit Breaker, Rate-Limiting, Caching.

## Technische Empfehlungen für die Weiterentwicklung

1.  Aufbau eines interdisziplinären Kernteams.
2.  Entwicklung eines detaillierten Architekturkonzepts.
3.  Priorisierung der regionalen Datenintegration.
4.  Agile Entwicklung mit Nutzerfeedback.
5.  Enge Kooperation mit lokalen Institutionen (DFKI, Uni Saarland, etc.).
6.  Implementierung strikter Datenschutz- und Ethikrichtlinien.
7.  Open-Source-Ansatz für Kernkomponenten.
8.  Umfassende Monitoring-Infrastruktur.

## Fazit: Das Saarland als KI-Vorreiter

agentland.saarland hat das Potenzial, ein technologisches Leuchtturmprojekt zu werden, das KI-Kompetenzen demonstriert und praktischen Nutzen bietet. Die Verbindung von regionaler Identität mit moderner KI schafft ein einzigartiges, gemeinwohlorientiertes Konzept.
```

### 20. specs/initiatives/ki_schmiede_saar_konzept_agentland_saarland.md
```markdown
# KI-Schmiede Saar: Technisches Konzept für den agentland.saarland Workspace

## Die Zukunft der KI-Entwicklung im Saarland beginnt hier

Das agentland.saarland Workspace-Konzept schafft eine leistungsstarke regionale KI-Entwicklungsumgebung, die lokale Rechenleistung mit Cloud-KI verbindet. Der innovative Ansatz ermöglicht es Unternehmen, Forschern und Verwaltungen im Saarland, KI-Lösungen zu entwickeln und zu testen, ohne sensible Daten an externe Dienste übertragen zu müssen. Diese Technische Konzeption dient als Grundlage für die Implementierung einer "KI-Schmiede Saar", die den digitalen Wandel in der Region vorantreibt und die Position des Saarlandes als KI-Standort stärkt.

## Technische Infrastruktur

### Hardwareanforderungen
Die Infrastruktur des agentland.saarland Workspace basiert auf einem skalierbaren Mehrstufenmodell:

**Basis-Tier (Entwicklung & Testing)**
*   CPU: AMD Ryzen 9 oder Intel Core i9 (12+ Kerne)
*   RAM: 32GB DDR4/DDR5
*   GPU: NVIDIA RTX 3060/3070 (12GB VRAM)
*   Speicher: 500GB NVMe SSD, 2TB Sekundärspeicher
*   Einsatzbereich: 7B-Parameter-Modelle (Llama 3.1-8B, Gemma 2B)

**Standard-Tier (Produktion)**
*   CPU: AMD Threadripper Pro oder Intel Xeon W (32+ Kerne)
*   RAM: 128GB ECC-Speicher
*   GPU: 2x NVIDIA RTX 4090 (24GB VRAM je Karte)
*   Speicher: 1TB NVMe SSD, 4TB Sekundärspeicher
*   Einsatzbereich: 13B-70B-Parameter-Modelle, 5-10 gleichzeitige Nutzer

**Premium-Tier (Großflächiger Einsatz)**
*   CPU: Dual AMD EPYC oder Intel Xeon (64+ Kerne)
*   RAM: 256-512GB ECC-Speicher
*   GPU: 4-8x NVIDIA A100/H100 (40-80GB VRAM je Karte)
*   Speicher: 2TB NVMe SSD, 10TB+ RAID-Speicherarray
*   Einsatzbereich: 70B+ Parameter-Modelle, 10-100+ gleichzeitige Nutzer

### Netzwerkinfrastruktur
*   Internes Netzwerk: Mindestens 10 Gigabit Ethernet (10GbE)
*   Empfohlen: 25GbE oder 40GbE für High-Performance-Cluster
*   Externe Anbindung: 10Gbps+ mit redundanten Carriern
*   GPU-Interkonnekt: NVLink für NVIDIA-Systeme, InfiniBand für High-Performance-Cluster

### Hosting-Optionen
**Hybrid-Ansatz (empfohlen):**
*   Kerninfrastruktur: On-Premises in saarländischen Rechenzentren
*   Entwicklung/Testing: Cloud-Ressourcen für Flexibilität

**Lokale Datencenter-Optionen:**
*   KÜS DATA GmbH (Losheim am See)
*   eurodata (Saarbrücken)
*   Net-Build Datacenter RZ Saar 1 (Saarwellingen)

**Cloud-Optionen mit EU-Datensouveränität:**
*   Europäische Anbieter: OVHcloud, STACKIT, gridscale
*   Internationale Anbieter mit EU-Regionen: AWS European Sovereign Cloud, Microsoft Azure, Google Cloud

## Software-Stack

### Betriebssystem und Virtualisierung
*   Basis-Betriebssystem: Ubuntu Server 22.04 LTS (Langzeit-Support bis 2027)
*   Optimierte Kernel-Parameter für KI-Workloads
*   AppArmor-Profile für Container-Isolation
*   Virtualisierungs-/Container-Technologie:
    *   Primär: Docker mit Docker Compose (Docker Version: 25.0 oder neuer)
    *   NVIDIA Container Toolkit für GPU-Nutzung
    *   Für größere Deployments: K3s (Lightweight Kubernetes)

### KI-Frameworks und Bibliotheken
**Kern-Frameworks:**
1.  PyTorch (2.2.x) mit CUDA 12.x
2.  Hugging Face Transformers (4.40.x+)
3.  Optimierte LLM-Runtime: llama.cpp

**Unterstützende Bibliotheken:**
*   ONNX Runtime (1.16.x)
*   TensorFlow (2.15.x)
*   Accelerate (0.29.x)
*   BitsAndBytes (0.41.x)
*   LangChain (0.1.x)
*   Sentence Transformers (2.5.x)

### Optimierte Konfiguration für lokale KI-Modelle
*   **Hardware-spezifische Optimierungen**: CUDA Toolkit 12.x mit cuDNN 9.x, Mixed-Precision-Training/Inferenz, OpenMP Thread-Pool-Konfiguration.
*   **Modell-Quantisierungsstrategie**: GGUF-Format (Q4_K_M für 70B auf 24GB VRAM, Q4_K_M für 13B auf 12GB VRAM, Q3_K_S für 7B auf 8GB VRAM).
*   **Inferenz-Konfiguration**: Kontextlängen-, Batch-Größen-, KV-Cache-Optimierung (Sliding Window Attention).

## Sichere Anbindung von externen LLMs

### API-Integrations-Middleware (FastAPI)
*   FastAPI (0.108.x) mit Pydantic v2, asynchrone Endpoints.
*   **Benutzerdefinierte Middleware für**: Token-Management & Rate-Limiting, Request-Transformation, Fallback & Load-Balancing, Caching.
*   **Integrations-Komponenten**: Anthropic Python SDK, OpenAI-kompatible API (via LM Studio), Response-Streaming.

### API-Key-Management
*   Sichere Speicherung (Umgebungsvariablen, Secure Vaults), regelmäßige Rotation, Zugriffsbeschränkung, Monitoring.

### Sichere Kommunikation
*   TLS/HTTPS, Request/Response-Validierung, Datensparsamkeit in Prompts, Content-Filtering.

## Integration regionaler Datenquellen

### Schlüssel-Datenquellen im Saarland
*   **Forschungseinrichtungen**: MPI-INF, DFKI, CISPA, Universität des Saarlandes.
*   **Behördendaten**: Statistisches Amt Saarland, regionale Wirtschaftsdaten, öffentliche Aufzeichnungen.

### Sichere Integrationsmethoden
*   Federated Learning, Differential Privacy, Secure Multi-Party Computation, API-basierter Zugriff mit granularen Kontrollen.

### Data Source Integration Governance
*   Datenfreigabevereinbarungen, Compliance-Audits, Transparenzdokumentation.

## Datenschutz und Sicherheit

### DSGVO und deutsche Datenschutzanforderungen
*   Zweckbindung, Datensparsamkeit, Speicherbegrenzung, Richtigkeit, Transparenz.

### Sicherheit für Virtual Machines
*   Sichere Hypervisor-Konfiguration, Netzwerkisolation, Ressourcenzuweisungskontrollen, Echtzeit-Monitoring.

### LLM-spezifische Sicherheitsmaßnahmen
*   Prompt-Injection-Schutz, Trainingsdatensicherheit, Modell-DoS-Prävention, sichere Ausgabebehandlung, Sandboxed Execution.

## Autorisierungs- und Authentifizierungssysteme
*   Mehrfaktor-Authentifizierung (MFA), Machine-to-Machine (M2M) Authentifizierung (OAuth 2.0 Client Credentials Flow), Attributbasierte Zugriffskontrolle (ABAC), Just-in-time-Zugriff.

## Implementierungsstrategie und Roadmap (36 Monate)

*   **Phase 1: Grundlagen (Monate 1-6)**: Infrastrukturplanung, Stakeholder-Engagement, Kernteam, Governance-Framework.
*   **Phase 2: Minimum Viable Workspace (Monate 7-12)**: Infrastrukturbereitstellung, Service-Definition, begrenztes User-Testing, Feedback.
*   **Phase 3: Öffentlicher Launch und Expansion (Monate 13-24)**: Vollständige Infrastruktur, User-Onboarding, Service-Portfolio-Erweiterung, Community-Building.
*   **Phase 4: Reife und Innovation (Monate 25-36)**: Erweiterte Funktionen, regionale Integration, Nachhaltigkeitsplanung, Wirkungsanalyse.

## Kostenmodell (Empfohlenes Gesamtbudget 3 Jahre: €14 Mio.)
*   Infrastrukturkosten (28%): Computing-Hardware, Facility, Software-Lizenzen.
*   Personalkosten (42%): Technisches Team, Geschäftsbetrieb.
*   Anfängliche Betriebskosten (20%): Training, Marketing, Recht, Dienstleistungen.
*   Laufende Betriebskosten (10%): Wartung, Updates, Versorgung.

## Finanzierungsoptionen
*   EU-Förderung (Digital Europe, Horizon Europe, InvestAI).
*   Deutsche Bundesförderung (KI-Aktionsplan, BMBF).
*   Saarländische regionale Förderung (gwSaar, Transformationsfonds).
*   Public-Private-Partnerships (Industrie-Konsortien, Forschungskooperationen).

## Preismodelle und Abonnements
*   **Basis-Stufe ("KI-Explorer")**: €500-1.000/Monat.
*   **Standard-Stufe ("KI-Innovator")**: €2.000-5.000/Monat.
*   **Premium-Stufe ("KI-Enterprise")**: €8.000-15.000/Monat.
*   **Sonderraten**: Akademisch (50% Rabatt), Startup (70% Rabatt), Öffentlicher Sektor (30% Rabatt).

## Benutzeroberfläche und User Experience

### Schlüsselfunktionen
1.  Modulares Dashboard
2.  Konversations-KI-Schnittstelle
3.  Kontextuelle Hilfe
4.  Kollaborationstools
5.  Integrations-Hub (regionale Tools/DBs)
6.  Visualisierungstools

### Design-Prinzipien
1.  Menschenzentrierte KI
2.  Transparenz
3.  Konsistenz
4.  Skalierbarkeit
5.  Regionale Identität (visuell)
6.  Zugänglichkeit (universell)
7.  Mehrsprachige Unterstützung (de, fr, en)

### Onboarding-Prozess
1.  Benutzerprofilerstellung
2.  Geführte Tour
3.  Schnellstart-Projekte
4.  Ressourcenverbindung (Communities, Experten)

### Bildungsressourcen
1.  KI-Grundlagenbibliothek
2.  Interaktive Lernmodule
3.  Experten-Webinare/Workshops
4.  Referenzdokumentation

## Anwendungsfälle für das Saarland
*   **Automobilindustrie**: Lieferketten-Resilienz, Transformationsunterstützung.
*   **Stahlindustrie**: Nachhaltige Produktion, intelligente Qualitätskontrolle.
*   **IT-Dienstleistungssektor**: KI-as-a-Service Plattform, mehrsprachiger Kundenservice-KI.
*   **Öffentliche Verwaltung**: KI für Regionalplanung, Bürgerbeteiligung.

## Fazit und nächste Schritte
Die KI-Schmiede Saar ist eine strategische Investition. Die Implementierung erfolgt schrittweise über 36 Monate.
Erforderliche Schritte:
1.  Bildung eines Kern-Steuerungsteams.
2.  Sicherung der Grundfinanzierung.
3.  Erstellung detaillierten technischen Designs und Beschaffungsplans.
4.  Entwicklung von Pilotanwendungsfällen.
5.  Stufenweise Implementierung mit Evaluation und Anpassung.
```

### 21. ai_docs/guides/advanced_development_guidelines_agentland_saarland.md
```markdown
# Erweiterte Entwicklungsrichtlinien für agentland.saarland

Diese Richtlinien erweitern die bestehenden `.clauderules` für das agentland.saarland-Projekt und integrieren die Anforderungen aus der technischen Roadmap.

## 1. Technologische Grundsätze

```toml
[project.technologies]
ai_frameworks = ["langchain", "llamaindex", "langGraph", "pytorch", "huggingface-transformers"]
backend_frameworks = ["nextjs", "fastapi"] # Next.js für Frontend und ggf. BFF, FastAPI für Python-Microservices
database = "postgresql"
vector_extension = "pgvector"
containerization = ["docker", "kubernetes"] # Kubernetes/K3s für größere Deployments
```

## 2. Architekturprinzipien

```toml
[architecture]
pattern = "multiagent"
style = "microservices"
approach = "api_first"
communication = "event_driven" # z.B. via Message Queues
principles = ["privacy_by_design", "ethics_by_design", "technical_sovereignty"]

[architecture.layers]
orchestration = "NavigatorAgent" # Zentraler Koordinator
specialized_agents = true # Für Domänenwissen
tool_integration = true # MCP für externe Tools
knowledge_base = "VectorIndex" # RAG mit LlamaIndex & pgvector
```

## 3. Agentenstruktur

```toml
[agents.structure]
central_agents = [
  "NavigatorAgent",
  "ResearchAgent",
  "PlannerAgent",
  "AdminAgent",
  "MonitoringAgent"
]
specialized_agents = [
  "TourismAgent",
  "BusinessAgent",
  "EducationAgent",
  "CultureAgent"
  # Weitere nach Bedarf
]

[agents.coordination]
pattern = "CrewAI" # Als konzeptionelles Muster
transparency = "chain_of_thought"
feedback_loop = true
```

## 4. Regionale Integration

```toml
[regional_integration]
data_integration_connectors = [ # Konkretere Benennung
  "saarland_admin_data_connector",
  "saarland_tourism_data_connector",
  "saarland_culture_data_connector",
  "saarland_business_data_connector"
]
language_support = ["de", "fr", "en"] # Englisch hinzugefügt für breitere Nutzbarkeit
dialect_support = "saarlaendisch" # Korrekte Schreibweise
technical_integration_services = [
  "saarland_egovernment_services_api",
  "saarland_transport_api",
  "saarland_business_development_platform_api"
]
```

## 5. Coderichtlinien

```toml
[code.typescript]
type_safety = "strict"
naming_convention_functions_variables = "camelCase"
naming_convention_components_classes = "PascalCase"
naming_convention_files = "kebab-case.ts" # oder .tsx
interface_prefix = "I" # z.B. IUser
type_prefix = "T"    # z.B. TUserStatus
enum_suffix = "Enum" # z.B. UserRoleEnum
constants_convention = "UPPER_SNAKE_CASE"

[code.react]
components_path = "src/components" # Oder innerhalb von libs/apps
hooks_path = "src/hooks" # Oder innerhalb von libs/apps
context_path = "src/context" # Oder innerhalb von libs/apps
utilities_path = "src/utils" # Oder innerhalb von libs/apps
hooks_prefix = "use"
component_extension = ".tsx"
```

## 6. Entwicklungsrichtlinien in Textform

### 6.1 Spezifische TypeScript-Richtlinien
- Verwende immer explizite Typen; vermeide `any` strikt. Implizite Typisierung nur, wenn der Typ offensichtlich ist.
- Nutze Interfaces für öffentliche API-Definitionen von Objekten und Klassen-Props. Types für interne Typaliase.
- Implementiere Enums für fest definierte Wertebereiche (z.B. Status, Kategorien).
- Verwende TypeGuards (z.B. `isUser`, `isErrorResponse`) für komplexe Typprüfungen in der Laufzeit.
- Nutze moderne TypeScript-Features wie optional chaining (`?.`), nullish coalescing (`??`), Template Literal Types.
- Exportiere Typen und Interfaces aus einer zentralen `types.ts` oder `interfaces.ts` Datei pro Modul/Bibliothek.

### 6.2 React und Next.js Richtlinien
- Ausschließlich funktionale Komponenten mit Hooks.
- Implementiere Custom Hooks (`useMyLogic`) für wiederverwendbare UI-Logik und State-Management.
- Nutze React Context API für globalen oder themenübergreifenden Zustand; für komplexere Fälle Zustandmanagement-Bibliotheken (z.B. Zustand, Redux Toolkit) evaluieren.
- Optimiere Performance mit `React.memo`, `useCallback`, `useMemo` gezielt.
- Implementiere Lazy Loading für Routen (Next.js default) und große Komponenten (`React.lazy`).
- Nutze SWR oder React Query für Datenabrufe, Caching, und Server-State-Management.

### 6.3 Agentenentwicklung
- Jeder Agent muss eine klar definierte Rolle, Verantwortlichkeiten (Responsibilities) und Fähigkeiten (Capabilities) haben.
- Implementiere einheitliche, typisierte Schnittstellen für die Inter-Agenten-Kommunikation (z.B. standardisierte Nachrichtenformate).
- Dokumentiere das Verhalten jedes Agenten umfassend, inklusive Beispielen für Interaktionen und erwartete Ergebnisse.
- Implementiere strukturiertes Logging (z.B. mit Log-Levels und Kontextinformationen) für alle Agentenaktivitäten.
- Stelle sicher, dass jeder Agent über robuste Fehlerbehandlung und ggf. Fallback-Mechanismen verfügt.
- Entwickle detaillierte Testszenarien für einzelne Agentenfunktionen und komplexe Inter-Agenten-Workflows.

### 6.4 Regionale Integration (Saarland-Fokus)
- Alle benutzerorientierten Texte müssen primär auf Deutsch verfügbar sein; Französisch und Englisch als sekundäre Sprachen unterstützen.
- Implementiere einen optionalen Dialekt-Modus ("Saarländisch versteh'n mir aa!") für bestimmte Schnittstellen oder Agenten.
- Integriere regionale Datenquellen über standardisierte und versionierte Konnektoren (siehe `src/integration-connectors/`).
- Dokumentiere explizit regionale Besonderheiten (kulturell, sprachlich, administrativ), die in der KI berücksichtigt werden müssen (`ai_docs/regional/saarland/`).
- Nutze authentische lokale Beispiele und Szenarien in Dokumentation, Tests und Demo-Anwendungen.

### 6.5 Sicherheit und Datenschutz (Security & Privacy by Design)
- Implementiere DSGVO-konforme Datenspeicherung und -verarbeitung. Führe Datenschutz-Folgenabschätzungen (DSFA) für kritische Prozesse durch.
- Nutze durchgängige Verschlüsselung für sensible Daten (at rest, in transit). Verwalte Schlüssel sicher (z.B. HashiCorp Vault, Azure Key Vault).
- Führe regelmäßige Sicherheitsaudits und Penetrationstests durch (intern und extern).
- Implementiere granulare Nutzerzustimmung (Consent Management) für Datenverarbeitung und personalisierte Dienste.
- Dokumentiere Datenflüsse transparent (Data Flow Diagrams) und pflege ein Verzeichnis von Verarbeitungstätigkeiten (VVT).
- Stelle sicher, dass KI-Entscheidungen nachvollziehbar und erklärbar sind (Explainable AI - XAI).

### 6.6 CI/CD und Deployment
- Automatisiere Tests (Unit, Integration, E2E) und Code-Qualitätsprüfungen (Linting, Security Scans) in der CI-Pipeline (z.B. GitHub Actions).
- Implementiere dedizierte Staging-Umgebungen, die die Produktionsumgebung möglichst genau abbilden.
- Nutze Infrastructure as Code (IaC) Werkzeuge (z.B. Terraform, Pulumi) für die Verwaltung von Cloud-Ressourcen.
- Implementiere Blue-Green Deployment oder Canary Releases für reibungslose Updates und Risikominimierung.
- Stelle umfassendes Monitoring und Alerting für alle KI-Dienste und Infrastrukturkomponenten sicher.
- Entwickle und teste regelmäßig Rollback-Strategien für fehlgeschlagene Deployments.

## 7. KI-Modellintegration

```toml
[ai_models]
primary_llm = "Claude-3.5-Sonnet" # Oder spezifischer je nach Verfügbarkeit und Anforderung
fallback_llm = "local_open_source_model" # z.B. Llama 3.1 8B GGUF
speed_optimized_llm = "GroqAPI_LLaMA3_8B" # Für Latenz-kritische Aufgaben
specialized_models = ["domain_specific_fine_tuned_model_placeholder"] # Für spezifische Aufgaben (z.B. Dialekt)

[ai_integration_layer] # Statt [ai_integration]
use_abstraction_layer = true
use_message_queue = true # z.B. RabbitMQ, Kafka für asynchrone Agenten-Tasks
use_circuit_breaker = true
use_rate_limiting = true
use_caching_strategy = true
```

## 8. Dokumentationsstandards

```toml
[documentation]
api_documentation_standard = "OpenAPI_3.x"
code_comments_required = true # JSDoc/TSDoc für Funktionen, Klassen, Interfaces
architecture_decision_records = true # ADRs in specs/architecture/adrs/
user_guides_audience = ["citizens", "businesses", "administration", "developers"]
developer_guides_scope = ["onboarding", "framework_usage", "agent_development", "mcp_integration"]
include_regional_context_in_docs = true
```

## 9. Qualitätsstandards

```toml
[quality_assurance] # Umbenannt von [quality]
target_code_coverage_percentage = 80
performance_benchmarking_required = true
accessibility_standard = "WCAG_2.1_AA" # Mindestens AA, AAA wo möglich
internationalization_support = true # Für de, fr, en
supported_platforms_compatibility = ["desktop_web", "mobile_web", "native_mobile_optional"]
testing_levels_enforced = ["unit", "integration", "e2e", "agent_interaction_tests"]
```

## 10. Projektstruktur-Erweiterung (Vorschläge)

```toml
[project.structure_enhancements] # Umbenannt von [project.structure]
new_specialized_folders_src = [ # Präziser
  "src/regional-data-connectors/", # Für spezifische Saarland-Daten-Konnektoren
  "src/agent-blueprints/",      # Vorlagen für neue Agenten
  "src/ai-model-configs/",      # Konfigurationen für lokale/fine-tuned Modelle
  "src/shared-types/"           # Projektweite TypeScript-Typen
]
enforce_conventional_commits_standard = "Conventional_Commits_v1.0.0"
use_pull_request_template = true # .github/pull_request_template.md
use_issue_templates = true       # .github/ISSUE_TEMPLATE/
```
```

### 22. ai_docs/overviews/project_summary_agentland_saarland.md
```markdown
# agentland.saarland Project Summary

## Overview

agentland.saarland is an innovative multi-agent AI platform designed for the Saarland region in Germany. The project combines cutting-edge AI technology with regional context and technical sovereignty principles to create a system that provides valuable services to citizens, businesses, and public administration while maintaining control over data and technology.

## Core Components Implemented (Conceptual/Baseline)

### 1. Project Documentation Structure
*   **Memory Bank System**: Comprehensive documentation planned for `/ai_docs/memory-bank/` including `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`.
*   **Claude Integration**: `.clauderules`, `.claudeignore`, `.claude/config.json`, custom commands in `.claude/commands/`, and `CLAUDE.md` guidance documentation are defined in the project template.
*   **Regional Documentation**: Placeholders for detailed Saarland regional profile, data sources/APIs, Volks-KI plan, and AI technology landscape documentation within `ai_docs/regional/saarland/`.

### 2. Agent Framework (Conceptual)
*   **Base Classes**: `BaseAgent.ts` and `MCPCapableAgent.ts` are designed as foundational classes.
*   **Specialized Agent Classes**: `NavigatorAgent.ts` and `TourismAgent.ts` serve as examples for domain-specific agents.
*   **Regional Context System**: `RegionalContext.ts` is planned for accessing Saarland-specific information.

### 3. Utility Components (Conceptual)
*   **Core Utilities**: `Logger.ts`, `ApiClient.ts`, `CacheManager.ts`, `LLMService.ts`, `PromptBuilder.ts` are planned.
*   **MCP Integration**: `client.ts` for MCP communication, tool discovery, caching, error handling are part of the design.

### 4. Specifications and Plans
*   Detailed specifications like `ki_schmiede_spec.md` (for KI-Schmiede) and `mcp_integration_plan.md` are planned.
*   `README.md` provides a project overview and setup instructions.

## Project Architecture (Target)

The agentland.saarland Framework follows the architecture defined in the system patterns document (`ai_docs/memory-bank/systemPatterns.md`):
1.  **Orchestration Layer**: Navigator Agent for coordination.
2.  **Specialized Agent Layer**: Domain-specific agents.
3.  **Tool Integration Layer**: MCP client for enhanced capabilities.
4.  **Shared Knowledge Layer**: Regional context system and RAG.

These layers work together to provide a comprehensive, region-specific AI system.

## Key Features
*   **Technical Sovereignty**: Local execution focus, open-source core, regional data governance.
*   **Regional Integration**: Deep Saarland-specific information, data sources, language, and culture.
*   **Multi-Agent Architecture**: Centralized coordination, specialized expertise, standardized communication.
*   **Enhanced Capabilities**: MCP tool integration, research, document understanding, structured thinking.

## Next Steps (High-Level from various documents)

### Short-term Priorities
1.  **Implement Core Agents**: Business Agent, Administration Agent, Culture Agent.
2.  **Enhance Regional Integration**: Connect to actual regional data sources, implement dialect understanding.
3.  **Develop User Interfaces**: Web interface, mobile application, chat interfaces.

### Medium-term Goals
1.  **Volks-KI Implementation**: Democratic governance, participation platforms, feedback mechanisms.
2.  **KI-Schmiede Launch**: Developer portal, agent blueprint system, marketplace.
3.  **Deployment and Scaling**: Regional hosting, monitoring, analytics, resource management.

## Conclusion
The defined components and plans provide a strong foundation for the agentland.saarland project. The system architecture, agent framework, and utility components aim to create a flexible, extensible platform that can grow to meet regional needs while maintaining technical sovereignty and fostering democratic AI innovation.
```

### 23. ai_docs/prompts/base_context_agentland_saarland.md
```markdown
# Basis-Kontext für agentland.saarland KI-Assistent

Du bist ein KI-Entwicklungsexperte im agentland.saarland Framework.
Das Projekt agentland.saarland kombiniert modernste KI-Agententechnologie mit der regionalen Identität des Saarlandes.
Deine Aufgabe ist es, bei der Implementierung von Komponenten gemäß der technischen Roadmap und den Entwicklungsrichtlinien zu helfen.

**Kernarchitektur:** Multiagenten-System, Orchestrierungsebene (NavigatorAgent), spezialisierte Agenten, Wissensmanagement via RAG.
**Technologien:** TypeScript, Python, LangChain/LangGraph, LlamaIndex, FastAPI, Next.js, PostgreSQL mit pgvector, Docker, Kubernetes.
**Regionale Integration:** Saarländische Datenquellen, Sprachunterstützung (Deutsch, Französisch, optional Saarländisch).
**Leitprinzipien:** Technische Souveränität, Privacy-by-Design, Ethics-by-Design, API-First, Microservices.

Halte dich strikt an die in `ai_docs/guides/advanced_development_guidelines_agentland_saarland.md` und `.clauderules` definierten Standards.
```

### 24. ai_docs/prompts/agent_implementation_guidelines_agentland_saarland.md
```markdown
# Richtlinien für die Implementierung von Agenten in agentland.saarland

Wenn du einen neuen Agenten für das agentland.saarland Framework implementierst, beachte bitte Folgendes:

1.  **Rolle und Verantwortlichkeit**: Definiere klar die Rolle des Agenten und seine spezifischen Aufgaben.
2.  **Basisklasse**: Erbe von `MCPCapableAgent` (oder `BaseAgent`, falls keine MCP-Tools benötigt werden).
3.  **Schnittstellen**: Implementiere standardisierte Schnittstellen für die Kommunikation mit dem Orchestrator (NavigatorAgent) und anderen Agenten.
4.  **CrewAI-Muster**: Orientiere dich am CrewAI-Muster für die Zusammenarbeit von Agenten.
5.  **Chain-of-Thought**: Implementiere CoT-Logging für Transparenz der Denkprozesse.
6.  **Regionale Anpassung**: Integriere relevante regionale Daten und Logiken des Saarlandes.
7.  **Konfiguration**: Mache den Agenten über Konfigurationsdateien (z.B. in `configs/agents/`) anpassbar.
8.  **Fehlerbehandlung**: Implementiere robuste Fehlerbehandlung und Fallback-Mechanismen.
9.  **Logging**: Nutze das standardisierte Logging-System (`Logger.ts`).
10. **Tests**: Schreibe Unit- und Integrationstests für alle Kernfunktionen des Agenten.
11. **Dokumentation**: Dokumentiere die API des Agenten, seine Fähigkeiten und Anwendungsbeispiele in JSDoc/TSDoc und ggf. in einer separaten Markdown-Datei unter `ai_docs/agents/`.
12. **Sicherheit**: Beachte alle Sicherheitsrichtlinien des Projekts, insbesondere im Umgang mit Daten und externen APIs.
```

### 25. ai_docs/prompts/example_tourism_agent_request_agentland_saarland.md
```markdown
# Beispiel-Anfrage: Implementierung Tourismus-Agent für agentland.saarland

**Aufgabe:** Implementiere einen spezialisierten `TourismusAgent` für das agentland.saarland Framework.

**Anforderungen:**
1.  Der Agent soll Sehenswürdigkeiten und touristische Aktivitäten im Saarland empfehlen können.
2.  Er muss Nutzerinteressen und optional den Standort des Nutzers berücksichtigen.
3.  Integriere eine RAG-Komponente (`VektorSpeicher` aus `@libs/rag/vektor-speicher`) für kontextuelles Wissen über saarländische Attraktionen. Die Wissensdatenbank hierfür befindet sich unter einem konfigurierbaren Pfad.
4.  Der Agent soll von `MCPCapableAgent` erben und potenziell MCP-Tools wie `DeepResearchMCP` und `server-sequential-thinking` nutzen können.
5.  Implementiere eine Methode `empfehleSehenswürdigkeiten(interessen: string[], standort: [number, number] | string, radius?: number): Promise<IAttraktion[]>`.
6.  Nutze Chain-of-Thought für die Protokollierung der Entscheidungsschritte (z.B. NutzerinteressenAnalyse, StandortBestimmung, AttraktionenSuche, KontextuelleFilterung, PersonalisierteRangliste, EmpfehlungsGenerierung).
7.  Berücksichtige die Namens- und Codierungskonventionen aus den `advanced_development_guidelines_agentland_saarland.md`.
8.  Alle öffentlichen Methoden und Typen müssen mit JSDoc kommentiert werden.
9.  Erstelle eine Beispiel-Teststruktur für den Agenten.
10. Die Konfiguration des Agenten (maxEmpfehlungen, standardRadius, wissensDBPfad) soll über ein `ITourismusAgentConfig` Interface erfolgen.

**Beispiel für die erwartete Dateistruktur und Importe (Auszug):**
```typescript
import { MCPCapableAgent, MCPCapableAgentConfig } from '../base/MCPCapableAgent';
import { IAttraktion } from '@libs/shared/types'; // Annahme: Typ ist hier definiert
import { VektorSpeicher } from '@libs/rag/vektor-speicher';
import { createChainOfThought } from '@libs/agents/chain-of-thought'; // Annahme

export interface ITourismusAgentConfig extends MCPCapableAgentConfig {
  maxEmpfehlungen: number;
  standardRadius: number;
  wissensDBPfad: string;
}

export class TourismusAgent extends MCPCapableAgent {
  // ... Implementierung
}
```
```

### 26. ai_docs/guides/recursive_template_evolution_flow.md
```markdown
# Recursive Template Evolution Flow for agentland.saarland

This document outlines a conceptual flow for continuously evolving the `TEMPLATE_INIT_agentland.saarland.md` project template based on new project files, discussions, or other inputs. This flow leverages AI models (like Gemini) and MCP tools (like `sequentialthinking`) to analyze new information and propose updates.

## Flow Name

`EvolveAgentlandTemplateFlow`

## Objective

To intelligently and continuously analyze new project-related information, determine its impact on the `TEMPLATE_INIT_agentland.saarland.md` file, propose necessary structural or content updates, and maintain a log of these proposals to ensure the template evolves without regressions and reflects the latest project state.

## Inputs to the Flow

1.  **`new_information_sources`**: A list of sources for new information. This can include:
    *   Paths to newly added PDF documents.
    *   Paths to new markdown files (e.g., meeting notes, design documents).
    *   Text content from discussion summaries or external inputs.
    *   The user mentioned `{$NEW_FILES}` which this parameter represents.
2.  **`current_template_path`**: The file path to the current `TEMPLATE_INIT_agentland.saarland.md`.
3.  **`progress_log_path`**: The file path to `ai_docs/memory-bank/progress.md`. This file acts as the primary, evolving log of analyses and proposed changes.
4.  **`previous_updates_log_path`** (Optional): The file path to `update_log.yaml` (as mentioned by the user). This could be a more structured or periodically archived version of the `progress.md` content, or an auxiliary log providing historical context. The flow will primarily focus on reading from and appending to `progress.md`.
5.  **Core Project Context Documents**: Paths to key documents in `ai_docs/memory-bank/` like `projectbrief.md`, `systemPatterns.md`, `techContext.md` to provide baseline understanding.

## Conceptual Flow Steps (Orchestrated by a Genkit-like Framework)

The flow iterates through each new piece of information provided.

### 1. Initialization & Context Loading
   - Load the content of `TEMPLATE_INIT_agentland.saarland.md`.
   - Load the content of `ai_docs/memory-bank/progress.md` to understand previous analyses and suggestions.
   - Load content from core project context documents (e.g., `projectbrief.md`).

### 2. Information Ingestion & Pre-processing (Loop for each item in `new_information_sources`)
   - **a. Content Extraction**:
        - If the item is a file path (e.g., PDF, .docx), use appropriate tools (`read_file` which handles PDF/DOCX, or a specific `markdownify-mcp` tool if available and preferred for conversion to Markdown) to extract its text content.
        - If the item is already text (e.g., discussion summary), use it directly.
   - **b. Initial Summarization (LLM - e.g., Gemini Pro)**:
        - For lengthy new documents, use an LLM to generate a concise summary, identifying the main themes and keywords. This helps in focusing the subsequent analysis.

### 3. Purpose Determination (using `sequentialthinking` MCP tool)
   - **a. Invocation**: For each new information item (or its summary):
        - Call the `sequentialthinking` MCP tool.
        - **Inputs to `sequentialthinking`**:
            - The extracted/summarized content of the new item.
            - Core project context (e.g., summary of `projectbrief.md`, key architectural principles from `systemPatterns.md`).
            - The question: "What is the core purpose of this information in the context of the agentland.saarland project? What are its key implications for the project template (`TEMPLATE_INIT_agentland.saarland.md`)?"
   - **b. Output Analysis**:
        - The `sequentialthinking` tool will produce a chain of thoughts analyzing the new item.
        - Extract the final conclusion or a structured summary of its purpose, relevance, and potential impact areas (e.g., new structural components, documentation sections, configuration changes).

### 4. Comparison with Existing Template & Change Identification (LLM-assisted - e.g., Gemini Pro)
   - **a. Contextualization**: Provide an LLM with:
        - The structured purpose analysis from the `sequentialthinking` step.
        - The full content of the current `TEMPLATE_INIT_agentland.saarland.md`.
        - The full content of the new information item.
        - Relevant entries from `ai_docs/memory-bank/progress.md` to avoid redundant suggestions.
   - **b. Analysis Prompt**: Prompt the LLM to:
        - Determine if the new information is already adequately represented in the current template.
        - Identify specific sections or structural elements in the template that are affected (or should be added/modified).
        - Assess if the new information introduces new concepts, files, directory structures, or configuration parameters that are not yet part of the template.
        - Check for conflicts or if the new information supersedes existing parts of the template.
        - Propose specific actions: e.g., "Add new file definition", "Modify directory diagram", "Update content of existing file definition X".

### 5. Drafting Proposed Updates (LLM-assisted - e.g., Gemini Pro)
   - **a. Generate `<suggested_change>` (Human-readable summary)**:
        - Based on the LLM's analysis in Step 4, generate a clear, concise natural language description of the proposed changes.
        - *Example*: "The new document 'KI_Schmiede_Advanced_Features.pdf' details advanced GPU tiering and a new 'Research Sandbox' component for the KI-Schmiede. Suggestion: Update `specs/initiatives/ki_schmiede_saar_konzept_agentland_saarland.md` definition in the template with this new information, and add 'Research Sandbox' to the KI-Schmiede features list. Also, update the hardware requirements in the KI-Schmiede concept."
   - **b. Generate `<template_diff>` (Conceptual, structured description of changes)**:
        - This describes the specific modifications to `TEMPLATE_INIT_agentland.saarland.md`.
        - For simple additions (e.g., adding a new document to an existing category in the template): The LLM could generate the markdown snippet for the new file definition.
        - For structural changes (e.g., new directories, major refactoring of the template's narrative or diagram): The LLM might propose a high-level plan or a list of specific modifications.
        - This could be structured (e.g., XML, JSON, or a list of change operations):
          ```xml
          <template_diff target_file="TEMPLATE_INIT_agentland.saarland.md">
            <comment>Updates based on KI_Schmiede_Advanced_Features.pdf</comment>
            <modify_file_definition path="specs/initiatives/ki_schmiede_saar_konzept_agentland_saarland.md">
              <append_to_section title="Hardwareanforderungen">
                - Details on new GPU tiers (e.g., Premium Plus Tier with NVIDIA H200).
              </append_to_section>
              <add_subsection title="Research Sandbox">
                - Description of the Research Sandbox component.
              </add_subsection>
            </modify_file_definition>
            <update_diagram_entry path="specs/initiatives/ki_schmiede_saar_konzept_agentland_saarland.md" details="Reflect new GPU tiers and Research Sandbox"/>
          </template_diff>
          ```

### 6. Logging to `ai_docs/memory-bank/progress.md`
   - **a. Read Current Log**: Use `read_file` to get the content of `ai_docs/memory-bank/progress.md`.
   - **b. Append New Entry**: Add a new section to `progress.md` with:
        - A timestamp for the current analysis.
        - Source(s) of the new information (e.g., filename(s) of processed documents, summary of discussion).
        - The generated `<suggested_change>` text.
        - The structured `<template_diff>` information.
        - Status: "Proposed" (can be updated later if applied or rejected).
   - **c. Write Updated Log**: Use `write_to_file` (or `replace_in_file` if targeting a specific section) to save the updated `progress.md`.

### 7. Review and Recursion (Human-in-the-Loop)
   - The entries in `progress.md` serve as a queue of proposed changes for human review.
   - A project maintainer reviews these proposals.
   - If a proposal is accepted:
        - The maintainer (or an AI assistant guided by the proposal) applies the changes to `TEMPLATE_INIT_agentland.saarland.md`.
        - The corresponding entry in `progress.md` is updated (e.g., status changed to "Applied", date of application).
   - The updated `TEMPLATE_INIT_agentland.saarland.md` and `progress.md` then form the baseline for the next iteration of the `EvolveAgentlandTemplateFlow` when new information arrives. This makes the process "recursive" as it continuously builds upon its own outputs and analyses.

## Benefits of this Flow

-   **Continuous Evolution**: Keeps the project template aligned with the latest project knowledge.
-   **Consistency**: Helps maintain a coherent and up-to-date central project definition.
-   **Regression Prevention**: By logging changes and proposals, it helps avoid re-introducing outdated concepts or losing valuable structural information.
-   **AI-Assisted Maintenance**: Leverages AI for analysis and drafting, reducing manual effort in template upkeep.
-   **Transparency**: The `progress.md` log provides a clear audit trail of how and why the template evolves.

This flow provides a robust framework for managing the evolution of the `agentland.saarland` project template in an intelligent and maintainable way.
```

## Benutzerdefinierte Befehle

### 1. .claude/commands/init.md

```markdown
# Projektinitialisierungsbefehl

Sie haben die Aufgabe, eine neue Instanz des agentland.saarland-Projekts zu initialisieren.
Führen Sie diese Schritte sorgfältig aus:

1. Überprüfen Sie, ob das Projektverzeichnis leer ist oder nur die Vorlagendateien enthält.
2. Erstellen Sie alle erforderlichen Verzeichnisse gemäß der Projektstruktur.
3. Generieren Sie Konfigurationsdateien mit geeigneten Standardwerten für die Region Saarland.
4. Validieren Sie, dass alle Komponenten korrekt installiert und zugänglich sind.
5. Erstellen Sie einen Einrichtungsbericht, der den Initialisierungsprozess detailliert beschreibt.

Das Projekt sollte mit den folgenden saarlandspezifischen Einstellungen konfiguriert werden:
- Primärsprache: Deutsch
- Regionales Compliance-Framework: DSGVO + Deutsches KI-Gesetz + Saarländische Digitalstrategie
- Datenresidenz: Innerhalb deutscher Grenzen
- Technische Souveränität: Hohe Priorität
- Regionale API-Endpunkte: Saarland Open Data Portal

Berichten Sie über alle während der Initialisierung aufgetretenen Probleme und geben Sie Empfehlungen zur Lösung.
```

### 2. .claude/commands/memory.md

```markdown
# Speicherverwaltungsbefehl

Sie haben die Aufgabe, das Speichersystem für das agentland.saarland-Projekt zu verwalten.
Dieser Befehl ermöglicht die Initialisierung, Abfrage und Verwaltung des persistenten Speichers.

## Parameter

- `--init`: Initialisieren eines neuen Speichers.
- `--query <Begriff>`: Durchsuchen des Speichers nach bestimmten Informationen.
- `--add <Datei>`: Hinzufügen von Inhalten aus einer Datei zum Speicher.
- `--clear`: Löschen aller Inhalte aus dem Speicher.
- `--backup`: Erstellen einer Sicherung des aktuellen Speichers.
- `--restore <Sicherung>`: Wiederherstellen aus einer Sicherung.

## Verwendungsbeispiele

1. Speicher initialisieren: `/memory --init`
2. Dokument zum Speicher hinzufügen: `/memory --add ai_docs/regional/saarland/uebersicht.md`
3. Speicher abfragen: `/memory --query "Energiepolitik"`
4. Sicherung erstellen: `/memory --backup`

## Regionale Überlegungen

Bei der Verwaltung des Speichers für saarlandspezifische Anwendungen:
- Stellen Sie sicher, dass alle gespeicherten Daten den deutschen Datenschutzgesetzen entsprechen.
- Priorisieren Sie Informationen aus maßgeblichen regionalen Quellen.
- Pflegen Sie eine sprachliche Konsistenz (Deutsch primär, Englisch sekundär).
- Kennzeichnen Sie regional sensible Informationen entsprechend.

Erstellen Sie einen detaillierten Bericht über durchgeführte Speicherverwaltungsoperationen.
```

### 3. .claude/commands/regional/saarland.md

```markdown
# Saarland-Regionalbefehl

Dieser Befehl bietet saarlandspezifische Funktionalität für das agentland.saarland-Projekt.
Verwenden Sie ihn, um auf regionale Daten, Richtlinien und Konfigurationen zuzugreifen und diese zu verwalten.

## Parameter

- `--data-sources`: Verfügbare saarländische Datenquellen auflisten.
- `--policies`: Relevante regionale Richtlinien und Vorschriften anzeigen.
- `--language-model`: Sprachmodell für saarländischen Dialekt konfigurieren.
- `--compliance-check`: Compliance-Prüfung anhand saarländischer Anforderungen durchführen.
- `--connect <Endpunkt>`: Verbindung zu einem saarländischen regionalen Dienst-Endpunkt herstellen.
- `--geography <Gebiet>`: Geografische Daten für ein bestimmtes Gebiet im Saarland laden.

## Verwendungsbeispiele

1. Datenquellen auflisten: `/regional:saarland --data-sources`
2. Compliance überprüfen: `/regional:saarland --compliance-check`
3. Mit Service verbinden: `/regional:saarland --connect saarland-open-data`

## Regionaler Kontext

Die Region Saarland hat spezifische Merkmale, die zu berücksichtigen sind:
- Starkes industrielles Erbe, insbesondere in den Bereichen Stahl und Automobilindustrie.
- Grenzregion mit Verbindungen zu Frankreich und Luxemburg.
- Spezifische Dialektbetrachtungen für die Sprachverarbeitung.
- Aktives KI-Forschungsökosystem durch die Universität des Saarlandes und das DFKI.
- Betonung der technischen Souveränität in der KI-Entwicklung.

Bieten Sie regional angemessene Empfehlungen, die diese Faktoren berücksichtigen.
```

## Ausführungsparameter

[EXECUTION] kann folgende Parameter enthalten:
- --name: Überschreiben des Projektnamens
- --dir: Überschreiben des Installationsverzeichnisses
- --config: Angabe einer benutzerdefinierten regionalen Konfiguration
- --language: Sprachmodus festlegen (de, en, bilingual-de-en)
- --minimal: Nur minimale Projektstruktur einrichten
- --verbose: Ausführliche Protokollierung während der Initialisierung aktivieren

## Nach der Initialisierung

Nach der Initialisierung ist das Projekt einsatzbereit. Sie können:
1. Den `/init`-Befehl ausführen, um die Einrichtung weiter anzupassen
2. CLAUDE.md bearbeiten, um projektspezifische Anweisungen bereitzustellen
3. Mit der Entwicklung regionaler KI-Anwendungen unter Verwendung der bereitgestellten Struktur beginnen
