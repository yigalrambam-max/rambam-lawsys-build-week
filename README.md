# Rambam LawSys | OpenAI Build Week

**Track:** Education  
**Project:** Source-faithful AI for legal learning

## What this repository contains

This repository contains a public, non-confidential demonstration of the Rambam LawSys workflow. It shows how the system maps a legal course source pack, identifies missing or uncertain materials, and blocks premature synthesis.

The repository does **not** include private Custom GPT instructions, confidential knowledge files, copyrighted course readings, API keys, or personal student data.

## Working demo

Open `index.html` in a browser.

The demo allows a judge to:

1. Add legal course sources.
2. Classify each source by type.
3. mark a source as available, missing, or uncertain.
4. Evaluate whether the source pack may proceed to controlled synthesis.
5. Export a JSON source manifest.

No installation or API key is required for this demonstration.

## Why Rambam LawSys

Generic AI tools can produce fluent summaries while hiding missing sources, unsupported attribution, or collapsed distinctions. Rambam LawSys treats legal learning as both a pedagogical and provenance-governance problem.

Core principles:

- Source before synthesis
- Source-type processing before integration
- Separation of authority, interpretation, criticism, and uncertainty
- No unsupported quotation or attribution
- Completion veto for missing mandatory material
- Product-level quality gates
- RTL-aware delivery for Hebrew legal education

## How Codex was used during Build Week

This public demo repository is intended to be extended in the primary Codex build thread.

The final submission should replace this paragraph with a factual summary of the work actually completed in Codex, including:

- The core feature implemented or materially improved
- Files created or changed by Codex
- Tests or verification performed
- Where Codex accelerated implementation
- The product, engineering, or design decisions retained by the submitter

Do not claim work that was not actually completed in Codex.

## How GPT-5.6 was used

GPT-5.6 supported the legal-learning architecture, long-context reasoning, provenance controls, failure-state analysis, pedagogical product design, and review of the public demonstration.

The final repository should identify the actual GPT-5.6 usage evidenced by the Codex build session and submission materials.

## Suggested Codex Build Week extension

A meaningful extension is to add:

- A required/optional source field
- Duplicate-source detection
- A structured defect register
- Automated validation tests
- A visible run manifest
- A README update documenting the implementation decisions

## Repository structure

```text
.
├── index.html
├── styles.css
├── app.js
├── README.md
├── LICENSE
├── sample-data/
├── docs/
├── tests/
└── assets/
```

## Test instructions

1. Open `index.html`.
2. Select **Load sample course**.
3. Select **Evaluate readiness**.
4. Confirm that the missing lecture causes a NO-GO decision.
5. Remove the missing source or add it as available.
6. Evaluate again.
7. Export the manifest and inspect the JSON file.

## Build Week disclosure

Rambam LawSys existed before Build Week as an evolving legal-learning methodology and controlled Custom GPT workflow. The submission must distinguish that pre-existing work from the specific repository implementation and extensions completed during the official submission period.

See `docs/BUILD_WEEK_LOG.md`.

## License and rights

The demonstration code is provided under the MIT License. The Rambam LawSys name, methodology, proprietary prompts, internal governance documents, course materials, and non-public knowledge artifacts are not licensed by this repository.
