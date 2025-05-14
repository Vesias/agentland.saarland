# Claude Framework Final File Tree Structure

This document provides a structured overview of the final Claude Framework directory structure after integration.

```
.
├── ai_docs
│   ├── a2a_protocol_guide.md
│   ├── analysis
│   │   ├── OPTIMIZATION-RECOMMENDATIONS.md
│   │   ├── PROJECT-PURPOSE-ANALYSIS.md
│   │   └── REFACTORING-SUMMARY.md
│   ├── api
│   │   ├── configuration.md
│   │   ├── core.md
│   │   ├── error.md
│   │   ├── i18n.md
│   │   ├── logging.md
│   │   ├── mcp.md
│   │   ├── rag.md
│   │   ├── README.md
│   │   ├── security.md
│   │   └── v1
│   │       └── claude-api.yaml
│   ├── architecture
│   │   ├── advanced_framework_architecture.md
│   │   ├── framework_architecture.md
│   │   ├── integration_framework.md
│   │   ├── neural_framework_overview.md
│   │   ├── pentagonal_architecture.md
│   │   └── rag_neural_architecture.pdf
│   ├── CLAUDE.md
│   ├── cleanup
│   │   └── component_removal_report.md
│   ├── CLEANUP-LIST.md
│   ├── enterprise
│   │   ├── quick_start.md
│   │   └── README.md
│   ├── examples
│   │   ├── agent-to-agent-integration.md
│   │   ├── code-analysis-example.md
│   │   ├── dependency_graph_analyzer.md
│   │   ├── mcp_hooks_comprehensive_example.md
│   │   ├── rag-venv-usage.md
│   │   ├── recursive_debugging
│   │   │   ├── buggy_fibonacci.js
│   │   │   ├── buggy_tree_traversal.py
│   │   │   └── debug_examples.md
│   │   └── sequential_execution_example.js
│   ├── FINAL_FILE_TREE.md
│   ├── FINAL-POLISHING-STEPS.md
│   ├── FINAL-STRUCTURE.md
│   ├── general
│   │   ├── CLAUDE.md
│   │   ├── CLEANUP-LIST.md
│   │   ├── FINAL_FILE_TREE.md
│   │   └── FINAL-POLISHING-STEPS.md
│   ├── git_agent_documentation.md
│   ├── guides
│   │   ├── about_profile_integration.md
│   │   ├── about_profile_mcp_integration_de.md
│   │   ├── advanced_system_requirements.md
│   │   ├── architecture.md
│   │   ├── backup_recovery_guide.md
│   │   ├── ci_cd_guide.md
│   │   ├── ci_cd_integration.md
│   │   ├── claude_integration_guide.md
│   │   ├── color_schema_guide.md
│   │   ├── configuration_guide.md
│   │   ├── documentation_generator.md
│   │   ├── enterprise_integration_guide.md
│   │   ├── enterprise_workflow.md
│   │   ├── error_handling_guide.md
│   │   ├── framework_setup_guide.md
│   │   ├── i18n_guide.md
│   │   ├── introduction.md
│   │   ├── logging_guide.md
│   │   ├── mcp_automatic_updates.md
│   │   ├── mcp_frontend_integration.md
│   │   ├── mcp_frontend_integration_summary.md
│   │   ├── mcp_hooks_usage.md
│   │   ├── mcp_integration_guide.md
│   │   ├── neural_framework_guide.md
│   │   ├── quick_start_guide.md
│   │   ├── rag_system_guide.md
│   │   ├── recovery_runbook.md
│   │   ├── recursive_debugging_guide.md
│   │   ├── saar_guide.md
│   │   ├── saar_mcp_user_manual.md
│   │   ├── security_checklist.md
│   │   ├── security_policy.md
│   │   ├── sequential_execution_manager_integration.md
│   │   ├── sequential-execution-manager.md
│   │   ├── sequential_execution_manager.md
│   │   ├── sequential_planner.md
│   │   ├── system_requirements.md
│   │   ├── testing_guide.md
│   │   └── version_control_guide.md
│   ├── integration
│   │   ├── INTEGRATION-PLAN.md
│   │   ├── INTEGRATION-REPORT.md
│   │   ├── INTEGRATION_SUMMARY.md
│   │   ├── RAG-SAAR-INTEGRATION.md
│   │   ├── VENV-SAAR-INTEGRATION.md
│   │   └── VIRTUAL-ENV-RAG-INTEGRATION.md
│   ├── migration
│   │   ├── EXTERNALLY-MANAGED-ENV-MIGRATION.md
│   │   ├── EXTERNALLY-MANAGED-ENV-PROGRESS.md
│   │   ├── MIGRATION-PLAN.md
│   │   ├── PYTHON-MODULES-ORGANIZATION.md
│   │   ├── PYTHON-VENV-QUICK-REFERENCE.md
│   │   ├── SECURITY-MIGRATION-CHECKLIST.md
│   │   ├── SECURITY-MODULE-MIGRATION-SUMMARY.md
│   │   └── TYPESCRIPT-MIGRATION-PROGRESS.md
│   ├── models
│   │   └── VIRTUAL-ENV-DESIGN.md
│   ├── plans
│   │   ├── FINAL-STRUCTURE.md
│   │   ├── INTEGRATION-PLAN.md
│   │   └── MIGRATION-PLAN.md
│   ├── PROJECT-STRUCTURE-AUDIT.md
│   ├── PROJECT_STRUCTURE_AUDIT_PLAN.md
│   ├── prompts
│   │   ├── classification
│   │   │   └── sentiment-analysis.md
│   │   ├── claude_prompt_templates.md
│   │   ├── CODE-ANALYSIS-PROMPT.md
│   │   ├── code-complexity-analyzer.md
│   │   ├── code-dependency-analyzer.md
│   │   ├── coding
│   │   │   └── refactoring-assistant.md
│   │   ├── complex_bug_hunt.md
│   │   ├── file-hierarchy-visualizer.md
│   │   ├── file-path-extractor.md
│   │   ├── generation
│   │   │   └── code-generator.md
│   │   ├── recursive_bug_analysis.md
│   │   ├── recursive_optimization.md
│   │   ├── stack_overflow_debugging.md
│   │   └── systematic_debugging_workflow.md
│   ├── README.md
│   ├── recommendations
│   │   └── frontend_mcp_optimization.md
│   ├── reports
│   │   ├── INTEGRATION-REPORT.md
│   │   ├── INTEGRATION_SUMMARY.md
│   │   ├── OPTIMIZATION-RECOMMENDATIONS.md
│   │   ├── PROJECT-PURPOSE-ANALYSIS.md
│   │   ├── REFACTORING-SUMMARY.md
│   │   ├── SECURITY-MODULE-MIGRATION-SUMMARY.md
│   │   └── TYPESCRIPT-MIGRATION-PROGRESS.md
│   ├── saar
│   │   └── templates
│   │       ├── architecture-design.md
│   │       ├── performance-optimization.md
│   │       ├── security-review.md
│   │       └── testing-strategy.md
│   ├── security
│   │   ├── policy_config_example.json
│   │   ├── security_config.example.json
│   │   ├── SECURITY.md
│   │   └── SECURITY-MIGRATION-CHECKLIST.md
│   ├── STRUCTURE.md
│   ├── templates
│   │   ├── architecture-design.md
│   │   ├── code-review.md
│   │   ├── performance-optimization.md
│   │   ├── python-venv-project.md
│   │   ├── security-review.md
│   │   └── testing-strategy.md
│   └── tutorials
│       └── saar_mcp_quickstart.md
├── apps
│   ├── cli
│   │   ├── package.json
│   │   └── src
│   │       ├── commands
│   │       └── index.ts
│   └── web
│       └── src
│           ├── components
│           ├── contexts
│           └── hooks
├── configs
│   ├── api
│   │   ├── index.js
│   │   └── schema.json
│   ├── backup
│   │   ├── config.json
│   │   └── index.js
│   ├── color-schema
│   │   ├── config.json
│   │   └── index.js
│   ├── debug
│   │   ├── index.js
│   │   └── workflow-config.json
│   ├── enterprise
│   │   ├── config.json
│   │   ├── index.js
│   │   └── workflow.json
│   ├── global.json
│   ├── i18n
│   │   ├── config.json
│   │   └── index.js
│   ├── index.js
│   ├── mcp
│   │   ├── config.json
│   │   ├── index.js
│   │   ├── mcp_config.json
│   │   ├── server_config.json
│   │   └── servers.json
│   ├── processes.json
│   ├── profiles
│   │   ├── test_user.about.json
│   │   └── testuser.about.json
│   ├── python
│   │   └── venv_config.json
│   ├── rag
│   │   ├── config.json
│   │   └── index.js
│   ├── saar
│   │   ├── config.json
│   │   └── index.js
│   ├── schemas
│   │   └── about-schema-de.json
│   ├── security
│   │   ├── constraints.json
│   │   ├── constraints.md
│   │   └── index.js
│   └── workflows
│       ├── index.js
│       └── saar
│           └── ci-cd-configuration.yml
├── jest.config.js
├── libs
│   ├── agents
│   │   ├── agent_communication_framework.md
│   │   └── src
│   │       ├── a2a-manager.ts
│   │       ├── agent-base
│   │       ├── agent_communication_framework.md
│   │       ├── commands
│   │       └── index.ts
│   ├── core
│   │   ├── package.json
│   │   └── src
│   │       ├── config
│   │       ├── dashboard
│   │       ├── error
│   │       ├── i18n
│   │       ├── index.ts
│   │       ├── logging
│   │       ├── schemas
│   │       ├── security
│   │       └── utils
│   ├── mcp
│   │   └── src
│   │       ├── a2a_manager.js
│   │       ├── api.js
│   │       ├── claude_integration.js
│   │       ├── claude_mcp_client.js
│   │       ├── client
│   │       ├── color_schema_manager.js
│   │       ├── enterprise
│   │       ├── enterprise_integration.js
│   │       ├── fallbacks
│   │       ├── git_agent.js
│   │       ├── index.ts
│   │       ├── memory_server.js
│   │       ├── routes
│   │       ├── server
│   │       ├── server_config.json
│   │       ├── services
│   │       ├── setup_mcp.js
│   │       └── start_server.js
│   ├── rag
│   │   ├── scripts
│   │   │   └── setup_rag.sh
│   │   ├── setup
│   │   │   └── check_python_env.sh
│   │   ├── src
│   │   │   ├── check_env_status.py
│   │   │   ├── claude_rag.py
│   │   │   ├── database
│   │   │   ├── __init__.py
│   │   │   ├── query_rag.py
│   │   │   ├── rag_framework.py
│   │   │   ├── rag_test.py
│   │   │   ├── recursive_watcher.py
│   │   │   ├── setup_database.py
│   │   │   └── update_vector_db.py
│   │   └── test
│   │       ├── __init__.py
│   │       └── test_rag_framework.py
│   ├── shared
│   │   └── src
│   │       ├── index.ts
│   │       └── utils
│   └── workflows
│       └── src
│           ├── index.ts
│           └── sequential
├── logs
│   ├── context7.log
│   ├── memory_bank.log
│   ├── neural_framework.log
│   └── sequential_thinking.log
├── mcp_servers_backup.tar.gz
├── nx.json
├── package.json
├── package-lock.json
├── README.md
├── saar_chain.sh -> /home/jan/Dokumente/agent.saarland/libs/workflows/src/saar/saar_chain.sh
├── saar.sh -> saar_chain.sh
├── specs
│   ├── ci-cd-configuration.yml
│   ├── coding-standards.md
│   ├── migrations
│   │   └── 001_initial_schema.sql
│   ├── openapi
│   │   └── v1
│   │       └── claude-api.yaml
│   ├── saar
│   │   ├── coding-standards.md
│   │   ├── schemas
│   │   │   └── performance-benchmarks.json
│   │   └── security-requirements.md
│   ├── schemas
│   │   ├── api-schema.json
│   │   └── performance-benchmarks.json
│   ├── security-requirements.md
│   └── virtual-env-requirements.md
├── tests
│   ├── integration
│   └── unit
├── tools
│   ├── documentation
│   │   └── sequential_doc_generator.js
│   ├── examples
│   │   ├── sequential-execution-example.js
│   │   ├── sequential-execution-manager-example.js
│   │   └── sequential-execution-manager-example.ts
│   ├── mcp
│   │   └── integration
│   │       ├── sequential_execution_manager.js
│   │       ├── sequential_execution_manager.js.original
│   │       └── sequential_execution_manager.js.proxy
│   ├── saar
│   │   └── saar_chain.sh
│   ├── scripts
│   │   ├── backup
│   │   │   ├── backup.js
│   │   │   ├── restore.js
│   │   │   ├── setup_cron.js
│   │   │   ├── system_verification.js
│   │   │   ├── test_backup_recovery.js
│   │   │   └── verify.js
│   │   ├── examples
│   │   │   └── sequential-execution-example.js
│   │   ├── git
│   │   │   ├── commit-lint.js
│   │   │   ├── enterprise-workflow.js
│   │   │   ├── feature-finish.js
│   │   │   ├── feature-start.js
│   │   │   ├── git-helper.js
│   │   │   ├── hotfix-finish.js
│   │   │   ├── hotfix-start.js
│   │   │   ├── install-aliases.sh
│   │   │   ├── issue-cherry-pick.js
│   │   │   ├── pr-manager.js
│   │   │   ├── project-stats.js
│   │   │   ├── README.md
│   │   │   ├── release-finish.js
│   │   │   ├── release-start.js
│   │   │   ├── staged-split-features.js
│   │   │   └── utils
│   │   ├── migration
│   │   │   ├── cleanup-configs.sh
│   │   │   ├── js-to-ts-converter.sh
│   │   │   ├── migrate.sh
│   │   │   ├── README.md
│   │   │   ├── update-imports.js
│   │   │   └── update-imports.sh
│   │   ├── rag
│   │   │   └── run_rag.sh
│   │   ├── saar
│   │   │   ├── auto_debug.py
│   │   │   ├── backup
│   │   │   ├── cleanup
│   │   │   ├── dashboard
│   │   │   ├── debug_workflow_engine.js
│   │   │   ├── enterprise
│   │   │   ├── error_trigger.js
│   │   │   ├── git
│   │   │   ├── git-workflow.js
│   │   │   ├── installation
│   │   │   ├── language_support
│   │   │   ├── prepare_release.js
│   │   │   ├── run_ci_locally.js
│   │   │   ├── setup
│   │   │   ├── startup
│   │   │   ├── test_demo.js
│   │   │   └── update_vector_db.js
│   │   ├── setup
│   │   │   ├── cicd_integration.js
│   │   │   ├── color_schema_wrapper.js
│   │   │   ├── create_about.js
│   │   │   ├── create_about_launcher.sh
│   │   │   ├── create_about_simple.js
│   │   │   ├── git_feature_manager.sh
│   │   │   ├── install_core.sh
│   │   │   ├── install_recursive_debugging.sh
│   │   │   ├── setup_all.sh
│   │   │   ├── setup_chain.js
│   │   │   ├── setup_git_agent.js
│   │   │   ├── setup_neural_framework.sh
│   │   │   ├── setup_neural_framework.sh.enhanced
│   │   │   ├── setup_project.js
│   │   │   └── setup_user_colorschema.js
│   │   └── start_local.sh
│   └── validators
│       ├── clauderules-validator.js
│       ├── clauderules-validator.spec.ts
│       ├── clauderules-validator.ts
│       └── README.md
└── tsconfig.base.json
```

## Key Structural Points

1.  **Hexagonal Architecture**: The framework follows a hexagonal architecture pattern with clear separation of concerns:
    *   Domain logic in `libs/`
    *   Application implementations in `apps/`
    *   External interfaces and adapters in `apps/api`, `apps/cli`, and `apps/web`

2.  **Modular Organization**: The codebase is organized into modular components with well-defined responsibilities:
    *   `core`: Core framework functionality
    *   `mcp`: MCP server and client implementation
    *   `agents`: Agent framework
    *   `rag`: RAG implementation
    *   `workflows`: Workflow implementations including SAAR and sequential execution

3.  **Clear Configuration**: Configuration is separated from implementation and organized by domain in the `configs/` directory

4.  **Comprehensive Documentation**: Documentation is comprehensive and organized by category in the `docs/` directory (Note: `ai_docs` is the current primary documentation location)

5.  **Testing**: Each library has a dedicated `test/` directory for unit and integration tests. Project-wide tests are in the root `tests/` directory.

6.  **TypeScript Support**: The framework supports TypeScript with appropriate type definitions and TypeScript implementations

7.  **Unified Tooling**: Tools and utilities are organized in the `tools/` directory with clear categorization

8.  **Specification-Driven Development**: API and schema specifications are defined in the `specs/` directory

9.  **Cross-Platform**: The framework is designed to work across platforms with appropriate abstractions

10. **Extensibility**: The framework is designed to be extensible with clear extension points and interfaces