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
