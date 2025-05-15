# agentland.saarland Template System

**IMPORTANT: This monolithic template has been split into a modular template system**

The original `TEMPLATE_INIT_agentland.saarland.md` file has been migrated to a modular template chain to improve maintainability and solve token limit issues. Please refer to the following files for the new template system:

## Modular Template System

The template is now organized into specialized modules:

| Module | Purpose | Path |
|--------|---------|------|
| **Root Index** | Main entry point for template chain | [ai_docs/templates/TEMPLATE_INIT_chain.md](ai_docs/templates/TEMPLATE_INIT_chain.md) |
| **Structure** | Directory tree and layout strategy | [ai_docs/templates/template_structure.md](ai_docs/templates/template_structure.md) |
| **Configurations** | Config files and .env integration | [ai_docs/templates/template_configurations.md](ai_docs/templates/template_configurations.md) |
| **CI/CD** | GitHub Actions, workflows, scripts | [ai_docs/templates/template_ci_cd.md](ai_docs/templates/template_ci_cd.md) |
| **Memory Bank** | Memory-bank structure and logic | [ai_docs/templates/template_memory_bank.md](ai_docs/templates/template_memory_bank.md) |
| **Dashboard** | Dashboard UI, components, visualizers | [ai_docs/templates/template_dashboard.md](ai_docs/templates/template_dashboard.md) |
| **Security** | Security audit rules, secrets management | [ai_docs/templates/template_security.md](ai_docs/templates/template_security.md) |
| **Prompts** | Modular Claude/Gemini prompt logic | [ai_docs/templates/template_prompts.md](ai_docs/templates/template_prompts.md) |
| **Guides** | Linked AI guides, flowcharts, best practices | [ai_docs/templates/template_guides.md](ai_docs/templates/template_guides.md) |
| **Changelog** | Rolling changelog from progress.md | [ai_docs/templates/template_changelog.md](ai_docs/templates/template_changelog.md) |

## Benefits of Modular Template System

1. **Improved Maintainability**: Each module can be updated independently
2. **Solved Token Limitations**: No more token limit issues during processing
3. **Better Organization**: Clear separation of concerns for each template area
4. **Easier Updates**: Simplified process for updating specific template sections
5. **Version Control**: Each module has its own version, allowing independent evolution

## Using the New Template System

1. Start with the [TEMPLATE_INIT_chain.md](ai_docs/templates/TEMPLATE_INIT_chain.md) file
2. Navigate to the specific module that covers your area of interest
3. Follow the instructions in the relevant template file

The template system is designed to be comprehensive while maintaining flexibility. Each template module includes detailed examples, best practices, and implementation guidance.

## RTEF Integration

The template system is integrated with the Recursive Template Evolution Flow (RTEF) through:

1. GitHub workflows for detecting template changes
2. Automated issue creation for template updates
3. Memory bank integration for tracking template evolution

---

**Note**: This file will be maintained for backward compatibility but is no longer the primary template. Please use the modular template system linked above.