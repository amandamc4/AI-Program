# 🔍 Module 01: AI-First Product Strategy and Design

This module focuses on using Artificial Intelligence as a strategic engineering tool for software development. The goal is not merely to "generate text," but to transform ambiguous requirements into robust technical specifications and process user data for evidence-based decision-making.

Here, AI acts as a layer for **Technical Refinement** and **Variability Reduction** prior to any code implementation.

## 🎯 Engineering Objectives

- **Structured Rubber Ducking:** Use Google AI Studio to "stress-test" requirements, identifying flaws in business logic and overlooked edge cases.
- **Automated Diagramming:** Convert functional specifications into visual logic flows using **Mermaid.js**.
- **Data Discovery:** Create **Structured Prompts (JSON)** to sanitize and analyze large volumes of user feedback.
- **Prompt Engineering:** Master the control of _Temperature_ and _Safety Settings_ to ensure deterministic outputs.

---

## 🛠️ Technology Stack

- **Engine:** Google Gemini (1.5 Pro / Flash) via [Google AI Studio](https://aistudio.google.com/)
- **Notation:** [Mermaid.js](https://mermaid.js.org/) for flow diagrams.
- **Prompt Pattern:** JSON Prompts (Focus on _System Instructions_ and _Few-Shot_). ---

## 📂 Module File Structure

The deliverables for this module must strictly follow the folder organization below to ensure version control of the project's "intelligence":

```bash
modulo-01-discovery-refinement/
├── prompts/
│   ├── system-instructions-refinement.json  # Software Architect Prompt (Lesson 1)
│   └── insight-distiller.json               # Structured Prompt Configuration (Lesson 5)
├── docs/
│   └── refinement/
│       ├── briefing-bruto.md                # Original problem (Input)
│       ├── edge-cases.md                    # List of failures identified by the AI
│       └── fluxo-logico.mmd                 # Mermaid.js code for the refined flow
├── data/
│   └── raw-feedbacks.json                   # Raw dataset (logs/comments)
└── reports/
└── backlog-priorizado.json              # Structured output from data analysis
```

---

## 🚀 Project Execution Guide

### Project 1: Requirements Refinement and Edge Cases

Focus: Anticipating failures and mapping error states.

Setup: In Google AI Studio, copy the contents of `prompts/system-instructions-refinement.json` into the **System Instructions** field.

Input: Insert the content from `docs/refinement/briefing-bruto.md` (Scenario: Scheduled Pix Transfer).

Execution: Ask the AI ​​to analyze "Unhappy Paths" and generate the Mermaid code.

Validation: Render the Mermaid diagram in a compatible editor (e.g., VS Code plugin or Mermaid Live Editor) and validate the logic.

### Project 2: Insight Distiller (Data Discovery)

Focus: Transforming unstructured data into a technical backlog.

Preparation: Use the `data/raw-feedbacks.json` file.

Setup: In Google AI Studio, select **Structured Prompt** mode. Schema: Define output parameters according to `prompts/insight-distiller.json` (e.g., category, sentiment_score, technical_priority).

Parameters: Set Temperature to 0 to ensure the analysis is factual and free from hallucinations.

Output: Export the JSON result to the `reports/` folder.

## 📦 Final Deliverable (Acceptance Criteria)

For this module to be considered complete at a Senior level, the repository must demonstrate:

Prompt Versioning: JSON files in `/prompts` must contain clear, reusable system instructions.

Traceability: It must be possible to read `briefing-bruto.md` and see how it evolved into `fluxo-logico.mmd` through AI intervention.

Determinism: The data report (`backlog-priorizado.json`) must be consistent and actionable, ready for import into Jira or Trello.

Note: Although we use the Google ecosystem for demonstration purposes, the fundamentals of Structured Prompting and System Instructions apply to any LLM (Claude, GPT-4, Llama). The focus is on the engineering methodology, not the specific tool.
