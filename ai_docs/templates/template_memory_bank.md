---
title: "Memory Bank Template for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
status: "active"
---

# Memory Bank Template for agentland.saarland

This template defines the memory bank structure, memory controller system, and recursive template evolution flow (RTEF) for agentland.saarland projects. The memory bank serves as a persistent storage system for AI agents to track progress, store context, and evolve templates over time.

## Memory Bank Structure

The memory bank is organized in the `ai_docs/memory-bank/` directory with the following files:

```
ai_docs/memory-bank/
├── activeContext.md       # Active working context for agents
├── memoryController.md    # Memory controller system documentation
├── productContext.md      # Product context and business requirements
├── progress.md            # Project progress tracking with memory updates
├── projectbrief.md        # Project brief and overall objectives
├── systemPatterns.md      # System patterns and architectural decisions
└── techContext.md         # Technical context and stack information
```

## Memory File Format

Each memory bank file follows a standardized format:

1. **YAML Frontmatter**: Metadata section at the top of the file
2. **Content Sections**: Organized content with clear headings
3. **Memory Updates**: Tagged sections tracking changes over time

### YAML Frontmatter

All memory bank files should include YAML frontmatter with the following fields:

```yaml
---
title: "File Title"
date: "YYYY-MM-DD"
status: "current|archived|draft"
updated_by: "Author"
version: "1.0.0"  # Semantic versioning
---
```

### Memory Update Tags

Memory updates are tracked using specialized tags with standardized attributes:

```markdown
<memory_update date="YYYY-MM-DD" source="Update Source" trigger="Update Trigger">

## Update Title

Update content goes here...

</memory_update>
```

Attributes:
- `date`: The date of the update (YYYY-MM-DD format)
- `source`: The source of the update (e.g., "User Input", "System Analysis", "Recursive Template Evolution")
- `trigger`: What triggered the update (e.g., "Code Review", "Security Audit", "Template Change")

## Memory Controller System

The memory controller system manages the memory bank, ensuring consistent updates and tracking changes. It is documented in `memoryController.md` and implements the following features:

1. **Memory Update Protocol**: Standardized format for recording updates
2. **Version Tracking**: Semantic versioning for memory files
3. **Cross-References**: Linking between memory bank files
4. **Template Evolution Flow**: Process for evolving templates based on memory updates

### Memory Controller Implementation

```markdown
# Memory Controller System

The Memory Controller System for agentland.saarland provides a standardized approach to memory management for AI agents. It ensures consistent recording, tracking, and evolution of project information.

## Memory Update Protocol

### Format

Every memory update follows this standardized format:

```
<memory_update date="YYYY-MM-DD" source="Update Source" trigger="Update Trigger">

## Update Title

Update content with optional tags:

<template_diff>
Details of what changed in templates
</template_diff>

<suggested_change>
Specific implementation suggestions
</suggested_change>

</memory_update>
```

### Attributes

- **date**: The ISO date when the update was created
- **source**: The originating system or process (e.g., "User Input", "System Analysis")
- **trigger**: The specific event that triggered the update (e.g., "Code Review", "Security Audit")

### Tags

- **template_diff**: Identifies changes needed in templates
- **suggested_change**: Provides specific implementation suggestions
- **concept_validation**: Validates or challenges existing concepts
- **error_correction**: Documents error corrections

## Version Tracking

Memory bank files use semantic versioning:

- **Major (1.x.x)**: Significant restructuring or reimagining
- **Minor (x.1.x)**: New sections or substantial content additions
- **Patch (x.x.1)**: Corrections, clarifications, or minor updates

Version numbers are included in the YAML frontmatter:

```yaml
---
title: "Memory Bank File"
version: "1.2.3"  # Major.Minor.Patch
---
```

## Memory Bank Initialization

New projects should initialize the memory bank with these files:

1. **activeContext.md**: Initial working context
2. **productContext.md**: Product requirements and goals
3. **progress.md**: Empty progress file with initial structure
4. **projectbrief.md**: Project brief and objectives
5. **systemPatterns.md**: Initial architecture decisions
6. **techContext.md**: Technical stack and constraints
7. **memoryController.md**: This document

Each file should include proper YAML frontmatter and initial content.
```

## Recursive Template Evolution Flow (RTEF)

The RTEF is a process for evolving templates based on memory updates. It is triggered when a `<template_diff>` tag is detected in a memory update.

```markdown
# Recursive Template Evolution Flow (RTEF)

The Recursive Template Evolution Flow (RTEF) is a systematic process for evolving project templates based on memory updates. It ensures that templates remain up-to-date and reflect the latest best practices.

## RTEF Process

1. **Detection**: The system detects a `<template_diff>` tag in a memory update
2. **Analysis**: The template difference is analyzed to determine required changes
3. **Template Update**: Templates are updated based on the analysis
4. **Documentation**: Changes are documented in a new memory update
5. **Notification**: Stakeholders are notified of the template changes

## Template Diff Format

The `<template_diff>` tag uses this format:

```
<template_diff>
1. Change item 1: [Description of what needs to change]
2. Change item 2: [Description of what needs to change]
...
</template_diff>
```

## Suggested Change Format

The `<suggested_change>` tag provides specific implementation details:

```
<suggested_change>
Specific implementation suggestions, potentially including code snippets:

```typescript
// Code example
function example() {
  return 'Implementation suggestion';
}
```
</suggested_change>
```

## RTEF Triggering

RTEF can be triggered by:

1. **Manual Updates**: A user explicitly adding a `<template_diff>` tag
2. **Automated Detection**: System detecting patterns that suggest template improvements
3. **Periodic Review**: Scheduled template reviews

## RTEF Implementation

RTEF is implemented through:

1. **GitHub Workflows**: Detecting template_diff tags in PRs
2. **Automated Issue Creation**: Creating issues for template updates
3. **Template Update PRs**: Dedicated PRs for template changes
```

## Progress Tracking

The `progress.md` file is the central location for tracking project progress. It follows a standardized format:

```markdown
---
title: "Progress"
date: "YYYY-MM-DD"
status: "current"
updated_by: "Author"
version: "1.0.0"
---

# Progress: [Project Name]

## 1. Current Status

[Brief description of the current project status]

## 2. What's Working

[List of components, features, or aspects that are working as expected]

## 3. Pending Tasks

[List of tasks that still need to be completed]

### 3.1. [Category 1]
*   ✅ [Completed task]
*   ⏳ [In-progress task]
*   ⭕ [Pending task]

### 3.2. [Category 2]
*   ✅ [Completed task]
*   ⏳ [In-progress task]
*   ⭕ [Pending task]

## 4. Known Issues

[List of known issues or challenges]

<memory_update date="YYYY-MM-DD" source="Initial Setup" trigger="Project Initialization">
Initial progress report created for tracking project status.
</memory_update>
```

## Active Context

The `activeContext.md` file maintains the current working context for AI agents:

```markdown
---
title: "Active Context"
date: "YYYY-MM-DD"
status: "current"
updated_by: "Author"
version: "1.0.0"
---

# Active Context

This document maintains the current working context for AI agents, updating as the project evolves.

## Current Focus

[Description of the current development focus]

## Active Components

[List of components currently being worked on]

## Recent Changes

[Summary of recent changes to the project]

## Upcoming Work

[Description of planned work in the near future]

<memory_update date="YYYY-MM-DD" source="Context Initialization" trigger="Project Start">
Initial active context established for the project.
</memory_update>
```

## Product Context

The `productContext.md` file contains business requirements and product context:

```markdown
---
title: "Product Context"
date: "YYYY-MM-DD"
status: "current"
updated_by: "Author"
version: "1.0.0"
---

# Product Context

This document provides the business context and product requirements for the project.

## Business Goals

[Description of the business goals the product aims to achieve]

## Target Users

[Description of the target user groups]

## Key Features

[List of key features the product should provide]

## Success Metrics

[Description of how success will be measured]

<memory_update date="YYYY-MM-DD" source="Product Definition" trigger="Project Initialization">
Initial product context established for the project.
</memory_update>
```

## System Patterns

The `systemPatterns.md` file documents architectural decisions and system patterns:

```markdown
---
title: "System Patterns"
date: "YYYY-MM-DD"
status: "current"
updated_by: "Author"
version: "1.0.0"
---

# System Patterns

This document catalogs the architectural decisions and system patterns used in the project.

## Architectural Style

[Description of the overall architectural style]

## Design Patterns

[List of key design patterns used in the project]

## Code Organization

[Description of how code is organized]

## State Management

[Description of state management approaches]

## Error Handling

[Description of error handling patterns]

<memory_update date="YYYY-MM-DD" source="Architecture Planning" trigger="Project Initialization">
Initial system patterns established for the project.
</memory_update>
```

## Technical Context

The `techContext.md` file contains information about the technical stack:

```markdown
---
title: "Technical Context"
date: "YYYY-MM-DD"
status: "current"
updated_by: "Author"
version: "1.0.0"
---

# Technical Context

This document provides information about the technical stack and constraints for the project.

## Technology Stack

[Description of the primary technologies used]

## Development Environment

[Description of the development environment]

## Build and Deployment

[Description of build and deployment processes]

## External Dependencies

[List of key external dependencies]

## Technical Constraints

[Description of technical constraints]

<memory_update date="YYYY-MM-DD" source="Tech Stack Definition" trigger="Project Initialization">
Initial technical context established for the project.
</memory_update>
```

## Project Brief

The `projectbrief.md` file contains the overall project objectives:

```markdown
---
title: "Project Brief"
date: "YYYY-MM-DD"
status: "current"
updated_by: "Author"
version: "1.0.0"
---

# Project Brief

This document provides the overall objectives and scope for the project.

## Project Purpose

[Description of why the project exists]

## Project Scope

[Description of what is in and out of scope]

## Timeline

[Description of the project timeline]

## Key Stakeholders

[List of key stakeholders]

## Success Criteria

[Description of how success will be determined]

<memory_update date="YYYY-MM-DD" source="Project Definition" trigger="Project Initialization">
Initial project brief established.
</memory_update>
```

## Memory Bank Initialization

When initializing a new project, follow these steps:

1. Create the `ai_docs/memory-bank/` directory
2. Add all required memory bank files with proper frontmatter
3. Initialize each file with basic content
4. Add initial memory updates to each file

Example initialization script:

```javascript
// tools/scripts/setup/initialize-memory-bank.js
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Get current date
const currentDate = moment().format('YYYY-MM-DD');

// Create memory bank directory
const memoryBankDir = path.join(process.cwd(), 'ai_docs', 'memory-bank');
if (!fs.existsSync(memoryBankDir)) {
  fs.mkdirSync(memoryBankDir, { recursive: true });
}

// Define memory bank files with templates
const memoryBankFiles = [
  {
    name: 'activeContext.md',
    template: `---
title: "Active Context"
date: "${currentDate}"
status: "current"
updated_by: "Setup Script"
version: "1.0.0"
---

# Active Context

This document maintains the current working context for AI agents, updating as the project evolves.

## Current Focus

Initial project setup and configuration.

## Active Components

- Core infrastructure
- Project templates
- Memory bank system

## Recent Changes

N/A - Initial setup.

## Upcoming Work

- Complete initial project structure
- Set up development environment
- Initialize core components

<memory_update date="${currentDate}" source="Context Initialization" trigger="Project Start">
Initial active context established for the project.
</memory_update>
`
  },
  // Add templates for other memory bank files...
];

// Create each memory bank file
memoryBankFiles.forEach(file => {
  const filePath = path.join(memoryBankDir, file.name);
  fs.writeFileSync(filePath, file.template);
  console.log(`Created ${file.name}`);
});

console.log('Memory bank initialized successfully!');
```

## Best Practices

1. **Regular Updates**: Update the memory bank regularly, especially after significant changes
2. **Consistent Formatting**: Follow the standardized format for all memory bank files
3. **Semantic Versioning**: Use proper semantic versioning for memory bank files
4. **Cross-References**: Include cross-references between memory bank files when appropriate
5. **Template Evolution**: Use the RTEF process to evolve templates based on project experience
6. **Memory Updates**: Always use `<memory_update>` tags to track changes
7. **Status Indicators**: Use ✅, ⏳, and ⭕ to indicate task status
8. **Detailed Progress**: Keep the `progress.md` file up-to-date with current status
9. **Active Context**: Regularly update the `activeContext.md` file as the focus changes
10. **Project History**: Use memory updates to maintain a history of project decisions

## Conclusion

The memory bank system provides a powerful tool for maintaining project context, tracking progress, and evolving templates. By following this standardized approach, agentland.saarland projects can maintain consistency, capture institutional knowledge, and continuously improve over time.

## Related Templates

| Template | Relationship |
|----------|--------------|
| [Prompts](./template_prompts.md) | Uses memory bank content as context for AI prompt generation |
| [Changelog](./template_changelog.md) | Derives changelog entries from memory bank updates |
| [Guides](./template_guides.md) | Uses memory bank content to inform documentation creation |

## Integration Points

The memory bank integrates with other components of the agentland.saarland system:

1. **Recursive Template Evolution Flow (RTEF)** - Memory updates with `<template_diff>` tags trigger the RTEF system
2. **CI/CD Pipeline** - Memory bank validation is part of documentation checks
3. **AI Prompts** - Memory bank content provides context for AI prompts
4. **Dashboard** - Memory bank status is displayed in the dashboard

## Changelog

- **1.0.0** (2025-05-16): Initial version based on the agentland.saarland project