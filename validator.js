(function exposeValidator(root, factory) {
  const validator = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = validator;
  } else {
    root.SourceCoverageValidator = validator;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function createValidator() {
  const READINESS = Object.freeze({
    GO: "GO",
    REVIEW: "REVIEW REQUIRED",
    NO_GO: "NO-GO"
  });

  function normalizeSourceTitle(title) {
    return String(title || "")
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/[\p{P}\p{S}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSourceType(type) {
    return String(type || "")
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ")
      .trim();
  }

  function canonicalizeSource(source, index) {
    const requirement = source.requirement === "optional" ? "optional" : "required";
    const status = ["available", "missing", "uncertain"].includes(source.status)
      ? source.status
      : "uncertain";

    return {
      id: source.id || `source-${index + 1}`,
      title: String(source.title || "").trim(),
      type: String(source.type || "").trim(),
      requirement,
      status
    };
  }

  function buildDefectRegister(sources) {
    const defects = [];
    const duplicateGroups = new Map();

    sources.forEach((source) => {
      if (source.requirement === "required" && source.status === "missing") {
        defects.push({
          id: `missing-required-${source.id}`,
          type: "missing_required_source",
          severity: "blocking",
          source_ids: [source.id],
          source_titles: [source.title],
          message: `Required source is missing: ${source.title}.`
        });
      }

      if (source.requirement === "required" && source.status === "uncertain") {
        defects.push({
          id: `uncertain-required-${source.id}`,
          type: "uncertain_required_source",
          severity: "blocking",
          source_ids: [source.id],
          source_titles: [source.title],
          message: `Required source availability is uncertain: ${source.title}.`
        });
      }

      const normalizedTitle = normalizeSourceTitle(source.title);
      const normalizedType = normalizeSourceType(source.type);
      const duplicateKey = `${normalizedTitle}::${normalizedType}`;

      if (normalizedTitle && normalizedType) {
        const group = duplicateGroups.get(duplicateKey) || [];
        group.push(source);
        duplicateGroups.set(duplicateKey, group);
      }
    });

    duplicateGroups.forEach((group) => {
      if (group.length < 2) {
        return;
      }

      const first = group[0];
      defects.push({
        id: `duplicate-source-${first.id}`,
        type: "duplicate_source",
        severity: "review",
        source_ids: group.map(source => source.id),
        source_titles: group.map(source => source.title),
        normalized_title: normalizeSourceTitle(first.title),
        normalized_type: normalizeSourceType(first.type),
        message: `${group.length} entries share the same normalized title and source type.`
      });
    });

    return defects;
  }

  function buildWarnings(sources) {
    return sources
      .filter(source => source.requirement === "optional" && source.status !== "available")
      .map(source => ({
        id: `${source.status}-optional-${source.id}`,
        type: source.status === "missing" ? "missing_optional_source" : "uncertain_optional_source",
        severity: "warning",
        source_ids: [source.id],
        source_titles: [source.title],
        message: `Optional source is ${source.status}: ${source.title}.`
      }));
  }

  function requiredCoverage(sources) {
    const requiredSources = sources.filter(source => source.requirement === "required");
    const available = requiredSources.filter(source => source.status === "available").length;
    const total = requiredSources.length;

    return {
      available,
      total,
      percentage: total === 0 ? 100 : Math.round((available / total) * 100)
    };
  }

  function evaluateSources(rawSources) {
    const sources = rawSources.map(canonicalizeSource);
    const defects = buildDefectRegister(sources);
    const warnings = buildWarnings(sources);
    const coverage = requiredCoverage(sources);
    const hasBlockingDefect = defects.some(defect => defect.severity === "blocking");
    const hasDuplicateDefect = defects.some(defect => defect.type === "duplicate_source");

    let readinessStatus = READINESS.GO;
    if (sources.length === 0 || hasBlockingDefect) {
      readinessStatus = READINESS.NO_GO;
    } else if (hasDuplicateDefect) {
      readinessStatus = READINESS.REVIEW;
    }

    return {
      sources,
      defects,
      warnings,
      required_source_coverage: coverage,
      readiness_status: readinessStatus
    };
  }

  function createRunId(timestamp, randomValue) {
    const datePart = timestamp.replace(/\D/g, "").slice(0, 14);
    const suffix = Math.floor(randomValue * 1679616)
      .toString(36)
      .padStart(4, "0")
      .slice(-4);
    return `RLS-${datePart}-${suffix}`;
  }

  function createRunManifest(rawSources, options = {}) {
    const now = options.now ? new Date(options.now) : new Date();
    const timestamp = now.toISOString();
    const analysis = evaluateSources(rawSources);
    const runId = options.runId || createRunId(timestamp, options.random ?? Math.random());

    return {
      project: "Rambam LawSys",
      run_id: runId,
      timestamp,
      source_count: analysis.sources.length,
      required_source_coverage: analysis.required_source_coverage,
      open_defects: analysis.defects,
      warnings: analysis.warnings,
      readiness_status: analysis.readiness_status,
      ready_for_controlled_synthesis: analysis.readiness_status === READINESS.GO,
      sources: analysis.sources
    };
  }

  return {
    READINESS,
    normalizeSourceTitle,
    normalizeSourceType,
    buildDefectRegister,
    evaluateSources,
    createRunManifest
  };
}));
