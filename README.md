# Rambam LawSys | OpenAI Build Week

**Track:** Education  
**Project:** Source-faithful AI for legal learning

## What this repository contains

This repository contains a public, non-confidential demonstration of the Rambam LawSys workflow. The Source Coverage Validator maps a legal course source pack, records coverage defects, and prevents premature synthesis when required materials are missing or uncertain.

The repository does **not** include private Custom GPT instructions, confidential Knowledge files, copyrighted course readings, API keys, or personal student data.

## Source Coverage Validator

Every source records four public metadata fields: title, source type, availability (`available`, `missing`, or `uncertain`), and coverage role (`required` or `optional`). The validator then:

- detects duplicate entries by normalizing title case, punctuation, Unicode form, and whitespace, then combining the normalized title with the normalized source type;
- creates structured defects for missing required sources, uncertain required sources, and duplicate source groups;
- records missing or uncertain optional sources as non-blocking warnings;
- calculates available required sources, total required sources, and coverage percentage; and
- produces a visible and exportable run manifest with a run ID, timestamp, source count, required-source coverage, open defects, warnings, and readiness status.

Readiness uses explicit precedence:

1. `NO-GO` when the pack is empty or any required source is missing or uncertain.
2. `REVIEW REQUIRED` when required coverage is complete but duplicate sources remain.
3. `GO` when required coverage is complete and no duplicate groups remain. Optional-source warnings remain visible but do not block readiness.

A `GO` result permits controlled synthesis to begin; it does not replace source-specific processing, attribution review, or product quality gates.

## Run the demo

No installation or API key is required for the browser demonstration.

1. Open `index.html` in a modern browser.
2. Select **Load sample course**.
3. Select **Evaluate readiness**.
4. Confirm the sample is `NO-GO`, with a missing required lecture, a duplicate Hart entry, and a missing optional-source warning.
5. Remove the missing required lecture and one of the duplicate Hart entries.
6. Evaluate again and confirm `GO` with 100% required-source coverage and one non-blocking warning.
7. Select **Export manifest** to download the current validation run as JSON.

The full manual walkthrough is also available in `manual-test.html`.

## Run the automated tests

The test suite uses the JavaScript runtime built into Node.js and has no package dependencies. Node.js 18 or newer is recommended.

```sh
npm test
```

Equivalent direct command:

```sh
node --test tests/validator.test.js
```

The suite covers title normalization, required-source blockers, optional warnings, duplicate detection, type-sensitive duplicate matching, readiness precedence, run-manifest fields, coverage calculation, and empty-pack behavior.

## Why Rambam LawSys

Generic AI tools can produce fluent summaries while hiding missing sources, unsupported attribution, or collapsed distinctions. Rambam LawSys treats legal learning as both a pedagogical and provenance-governance problem.

Core principles:

- Source before synthesis
- Source-type processing before integration
- Separation of authority, interpretation, criticism, and uncertainty
- No unsupported quotation or attribution
- Completion veto for missing required material
- Product-level quality gates
- RTL-aware delivery for Hebrew legal education

## How Codex accelerated the Build Week work

Codex inspected the existing public demo, separated the validation rules into a reusable `validator.js` module, connected that module to the browser UI, added the structured defect register and run manifest, updated the sample data, and authored the automated tests. Codex ran and repaired the implementation against the test suite, then exercised the live browser flow to verify the NO-GO and GO states, visible audit evidence, and absence of browser errors.

This accelerated implementation by keeping the rules, UI behavior, test expectations, documentation, and Build Week evidence aligned in one reviewable change. The substantive product decisions remain explicit in this repository and in `BUILD_WEEK_LOG.md`.

## How GPT-5.6 supported the work

GPT-5.6 supported the legal-learning architecture and implementation review by translating provenance-governance requirements into deterministic validation rules. Its contribution included failure-state analysis, readiness-precedence design, duplicate-normalization reasoning, structured defect semantics, audit-manifest design, test-case coverage, and review of the public demonstration for unsupported claims or private material.

GPT-5.6 did not supply private prompts, copyrighted course content, API keys, or confidential Knowledge files.

## Repository structure

```text
.
|-- app.js
|-- BUILD_WEEK_LOG.md
|-- index.html
|-- LICENSE
|-- manual-test.html
|-- package.json
|-- rambam-lawsys-workflow.png
|-- README.md
|-- sample-course.json
|-- styles.css
|-- validator.js
`-- tests/
    `-- validator.test.js
```

## Build Week disclosure

Rambam LawSys existed before Build Week as an evolving legal-learning methodology and controlled Custom GPT workflow. The Source Coverage Validator implementation, automated tests, visible defect register, and run manifest documented here are the repository work completed during this Build Week implementation session.

See `BUILD_WEEK_LOG.md` for the dated implementation record and verification evidence.

## License and rights

The demonstration code is provided under the MIT License. The Rambam LawSys name, methodology, proprietary prompts, internal governance documents, course materials, and non-public knowledge artifacts are not licensed by this repository.
