const test = require("node:test");
const assert = require("node:assert/strict");

const {
  READINESS,
  normalizeSourceTitle,
  evaluateSources,
  createRunManifest
} = require("../validator.js");

function source(overrides = {}) {
  return {
    id: overrides.id || "source-1",
    title: overrides.title || "Course syllabus",
    type: overrides.type || "Syllabus",
    requirement: overrides.requirement || "required",
    status: overrides.status || "available"
  };
}

test("normalizes source titles across case, punctuation, and whitespace", () => {
  assert.equal(
    normalizeSourceTitle("  HART:   The Concept of Law  "),
    normalizeSourceTitle("Hart, The Concept of Law")
  );
});

test("missing required sources create blocking defects and NO-GO", () => {
  const result = evaluateSources([source({ status: "missing" })]);

  assert.equal(result.readiness_status, READINESS.NO_GO);
  assert.equal(result.defects[0].type, "missing_required_source");
  assert.equal(result.defects[0].severity, "blocking");
});

test("uncertain required sources create blocking defects and NO-GO", () => {
  const result = evaluateSources([source({ status: "uncertain" })]);

  assert.equal(result.readiness_status, READINESS.NO_GO);
  assert.equal(result.defects[0].type, "uncertain_required_source");
});

test("missing optional sources create warnings without blocking readiness", () => {
  const result = evaluateSources([
    source(),
    source({ id: "source-2", title: "Recommended reading", requirement: "optional", status: "missing" })
  ]);

  assert.equal(result.readiness_status, READINESS.GO);
  assert.equal(result.defects.length, 0);
  assert.equal(result.warnings[0].type, "missing_optional_source");
});

test("duplicate title and type combinations require review", () => {
  const result = evaluateSources([
    source({ id: "source-1", title: "Hart, The Concept of Law", type: "Academic article" }),
    source({ id: "source-2", title: "HART: The Concept of Law", type: "Academic article" })
  ]);

  assert.equal(result.readiness_status, READINESS.REVIEW);
  assert.equal(result.defects[0].type, "duplicate_source");
  assert.deepEqual(result.defects[0].source_ids, ["source-1", "source-2"]);
});

test("matching normalized titles with different source types are not duplicates", () => {
  const result = evaluateSources([
    source({ id: "source-1", title: "Legal Reasoning", type: "Academic article" }),
    source({ id: "source-2", title: "Legal Reasoning", type: "Lecture transcript" })
  ]);

  assert.equal(result.readiness_status, READINESS.GO);
  assert.equal(result.defects.length, 0);
});

test("blocking required-source defects take precedence over duplicate review", () => {
  const result = evaluateSources([
    source({ id: "source-1", title: "Lecture 4", type: "Lecture transcript", status: "missing" }),
    source({ id: "source-2", title: "Lecture 4", type: "Lecture transcript" })
  ]);

  assert.equal(result.readiness_status, READINESS.NO_GO);
  assert.equal(result.defects.length, 2);
});

test("run manifest records deterministic audit fields and required coverage", () => {
  const manifest = createRunManifest([
    source({ id: "source-1" }),
    source({ id: "source-2", title: "Lecture 4", status: "uncertain" }),
    source({ id: "source-3", title: "Optional note", requirement: "optional" })
  ], {
    now: "2026-07-21T12:34:56.000Z",
    runId: "RLS-TEST-0001"
  });

  assert.equal(manifest.run_id, "RLS-TEST-0001");
  assert.equal(manifest.timestamp, "2026-07-21T12:34:56.000Z");
  assert.equal(manifest.source_count, 3);
  assert.deepEqual(manifest.required_source_coverage, {
    available: 1,
    total: 2,
    percentage: 50
  });
  assert.equal(manifest.open_defects.length, 1);
  assert.equal(manifest.readiness_status, READINESS.NO_GO);
  assert.equal(manifest.ready_for_controlled_synthesis, false);
});

test("an empty source pack remains NO-GO", () => {
  const result = evaluateSources([]);

  assert.equal(result.readiness_status, READINESS.NO_GO);
  assert.deepEqual(result.required_source_coverage, {
    available: 0,
    total: 0,
    percentage: 100
  });
});
