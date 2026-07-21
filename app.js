const sources = [];

const titleInput = document.querySelector("#source-title");
const typeInput = document.querySelector("#source-type");
const statusInput = document.querySelector("#source-status");
const requirementInput = document.querySelector("#source-requirement");
const tableBody = document.querySelector("#source-table");
const defectTable = document.querySelector("#defect-table");
const decision = document.querySelector("#decision");

let currentManifest = null;

function newSourceId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `source-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function renderSources() {
  tableBody.innerHTML = "";

  sources.forEach((source, index) => {
    const row = document.createElement("tr");

    [source.title, source.type, source.requirement, source.status].forEach((value, cellIndex) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (cellIndex >= 2) {
        cell.className = "status";
      }
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.className = "remove";
    removeButton.addEventListener("click", () => {
      sources.splice(index, 1);
      renderSources();
      resetDecision();
    });

    actionCell.appendChild(removeButton);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });
}

function resetDecision() {
  currentManifest = null;
  decision.className = "decision neutral";
  decision.textContent = "Evaluate the updated source pack.";
  renderManifest(null);
  renderDefects([], []);
}

function addSource(title, type, status, requirement) {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    alert("Enter a source title.");
    return;
  }

  sources.push({
    id: newSourceId(),
    title: cleanTitle,
    type,
    status,
    requirement
  });

  titleInput.value = "";
  renderSources();
  resetDecision();
}

function renderManifest(manifest) {
  document.querySelector("#manifest-run-id").textContent = manifest?.run_id || "Not generated";
  document.querySelector("#manifest-timestamp").textContent = manifest?.timestamp || "Not generated";
  document.querySelector("#manifest-source-count").textContent = manifest?.source_count ?? sources.length;
  document.querySelector("#manifest-defects").textContent = manifest?.open_defects.length ?? 0;
  document.querySelector("#manifest-readiness").textContent = manifest?.readiness_status || "Not evaluated";

  const coverage = manifest?.required_source_coverage;
  document.querySelector("#manifest-coverage").textContent = coverage
    ? `${coverage.available}/${coverage.total} (${coverage.percentage}%)`
    : "Not evaluated";
}

function appendRegisterRow(entry) {
  const row = document.createElement("tr");
  const typeCell = document.createElement("td");
  const levelCell = document.createElement("td");
  const sourceCell = document.createElement("td");
  const detailCell = document.createElement("td");

  typeCell.textContent = entry.type.replaceAll("_", " ");
  levelCell.textContent = entry.severity;
  levelCell.className = `severity ${entry.severity}`;
  sourceCell.textContent = entry.source_titles.join("; ");
  detailCell.textContent = entry.message;

  row.append(typeCell, levelCell, sourceCell, detailCell);
  defectTable.appendChild(row);
}

function renderDefects(defects, warnings) {
  defectTable.innerHTML = "";
  const entries = [...defects, ...warnings];

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = currentManifest
      ? "No defects or warnings detected."
      : "No validation run has been generated.";
    row.appendChild(cell);
    defectTable.appendChild(row);
    return;
  }

  entries.forEach(appendRegisterRow);
}

function decisionMessage(manifest) {
  const coverage = manifest.required_source_coverage;
  const coverageText = `${coverage.available}/${coverage.total} required sources available`;

  if (manifest.readiness_status === SourceCoverageValidator.READINESS.NO_GO) {
    if (manifest.source_count === 0) {
      return "NO-GO: No active sources were identified. Source intake is required before synthesis.";
    }
    const blocking = manifest.open_defects.filter(defect => defect.severity === "blocking").length;
    return `NO-GO: ${blocking} blocking required-source defect(s); ${coverageText}. Resolve required coverage before synthesis.`;
  }

  if (manifest.readiness_status === SourceCoverageValidator.READINESS.REVIEW) {
    const duplicates = manifest.open_defects.filter(defect => defect.type === "duplicate_source").length;
    return `REVIEW REQUIRED: ${duplicates} duplicate group(s) detected; ${coverageText}. Reconcile duplicates before controlled synthesis.`;
  }

  const warningText = manifest.warnings.length > 0
    ? ` ${manifest.warnings.length} optional-source warning(s) remain non-blocking.`
    : "";
  return `GO FOR CONTROLLED SYNTHESIS: ${coverageText}.${warningText} Source-specific processing and quality review are still required.`;
}

function evaluateReadiness() {
  currentManifest = SourceCoverageValidator.createRunManifest(sources);
  const statusClass = currentManifest.readiness_status === SourceCoverageValidator.READINESS.GO
    ? "go"
    : currentManifest.readiness_status === SourceCoverageValidator.READINESS.REVIEW
      ? "review"
      : "no-go";

  decision.className = `decision ${statusClass}`;
  decision.textContent = decisionMessage(currentManifest);
  renderManifest(currentManifest);
  renderDefects(currentManifest.open_defects, currentManifest.warnings);
  return currentManifest;
}

function exportManifest() {
  const manifest = evaluateReadiness();
  const blob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${manifest.run_id}-source-manifest.json`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#add-source").addEventListener("click", () => {
  addSource(
    titleInput.value,
    typeInput.value,
    statusInput.value,
    requirementInput.value
  );
});

document.querySelector("#load-sample").addEventListener("click", () => {
  sources.splice(0, sources.length,
    {
      id: newSourceId(),
      title: "Course syllabus",
      type: "Syllabus",
      requirement: "required",
      status: "available"
    },
    {
      id: newSourceId(),
      title: "Hart, The Concept of Law",
      type: "Academic article",
      requirement: "required",
      status: "available"
    },
    {
      id: newSourceId(),
      title: "HART: The Concept of Law",
      type: "Academic article",
      requirement: "required",
      status: "available"
    },
    {
      id: newSourceId(),
      title: "Lecture 4 transcript",
      type: "Lecture transcript",
      requirement: "required",
      status: "missing"
    },
    {
      id: newSourceId(),
      title: "Recommended comparative reading",
      type: "Academic article",
      requirement: "optional",
      status: "missing"
    }
  );
  renderSources();
  resetDecision();
});

document.querySelector("#evaluate").addEventListener("click", evaluateReadiness);
document.querySelector("#export-manifest").addEventListener("click", exportManifest);

renderSources();
renderManifest(null);
