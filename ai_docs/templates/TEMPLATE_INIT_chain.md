---
title: "TEMPLATE_INIT_chain for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
status: "active"
---

# TEMPLATE_INIT_chain for agentland.saarland

This file serves as the root index for the modular template system of agentland.saarland. The template has been divided into specialized components to improve maintainability, enable easier updates, and solve token limit issues.

## Template Modules

| Module | Purpose | Path | Related Modules |
|--------|---------|------|----------------|
| 📁 **Structure** | Directory tree and layout strategy | [template_structure.md](./template_structure.md) | Configurations, CI/CD |
| ⚙️ **Configurations** | Config files and .env integration | [template_configurations.md](./template_configurations.md) | Structure, Security, Dashboard |
| 🔄 **CI/CD** | GitHub Actions, workflows, scripts | [template_ci_cd.md](./template_ci_cd.md) | Structure, Security, Changelog |
| 🧠 **Memory Bank** | Memory-bank structure and logic | [template_memory_bank.md](./template_memory_bank.md) | Prompts, Changelog, Guides |
| 📊 **Dashboard** | Dashboard UI, components, visualizers | [template_dashboard.md](./template_dashboard.md) | Structure, Configurations, Security |
| 🔒 **Security** | Security audit rules, secrets management | [template_security.md](./template_security.md) | Configurations, CI/CD, Dashboard |
| 💬 **Prompts** | Modular Claude/Gemini prompt logic | [template_prompts.md](./template_prompts.md) | Memory Bank, Guides |
| 📚 **Guides** | Linked AI guides, flowcharts, best practices | [template_guides.md](./template_guides.md) | Structure, Prompts, Memory Bank |
| 📝 **Changelog** | Rolling changelog from progress.md | [template_changelog.md](./template_changelog.md) | Memory Bank, CI/CD |

## Using This Template Chain

1. Start with this index file to understand the overall template structure
2. Navigate to the specific module that covers your area of interest
3. Each module file includes:
   - Frontmatter with version information
   - Detailed implementation instructions
   - Code snippets and examples
   - Best practices for that domain

When creating a new project or component, consult the relevant template module to ensure consistency with established patterns.

## Version Control

Each template module has its own version, allowing individual modules to evolve independently. When making changes:

1. Update the version in the frontmatter of the specific module
2. Add a concise changelog entry at the bottom of the module file
3. If needed, update references in other modules

## Integration with RTEF (Recursive Template Evolution Flow)

The template chain integrates with the RTEF system through:

1. The `rtef-trigger.yml` GitHub workflow
2. Automated PR creation for template updates
3. Versioned template diffs for clear change tracking

## Template Update Process

To propose updates to any template module:

1. Create a branch from `main`
2. Modify the relevant template module(s)
3. Update version(s) in frontmatter
4. Add changelog entry
5. Submit a PR with the `template-update` label

## Migration from Legacy Template

This modular template chain replaces the previous monolithic `TEMPLATE_INIT_agentland.saarland.md` file, which exceeded token limits for processing. All content from the original template has been distributed across the specialized modules for better organization and maintainability.