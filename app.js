const sources = [];

const titleInput = document.querySelector("#source-title");
const typeInput = document.querySelector("#source-type");
const statusInput = document.querySelector("#source-status");
const tableBody = document.querySelector("#source-table");
const decision = document.querySelector("#decision");

function renderSources() {
  tableBody.innerHTML = "";

  sources.forEach((source, index) => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = source.title;

    const typeCell = document.createElement("td");
    typeCell.textContent = source.type;

    const statusCell = document.createElement("td");
    statusCell.textContent = source.status;
    statusCell.className = "status";

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
    row.append(titleCell, typeCell, statusCell, actionCell);
    tableBody.appendChild(row);
  });
}

function resetDecision() {
  decision.className = "decision neutral";
  decision.textContent = "Evaluate the updated source pack.";
}

function addSource(title, type, status) {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    alert("Enter a source title.");
    return;
  }

  sources.push({
    id: crypto.randomUUID(),
    title: cleanTitle,
    type,
    status
  });

  titleInput.value = "";
  renderSources();
  resetDecision();
}

function evaluateReadiness() {
  if (sources.length === 0) {
    decision.className = "decision no-go";
    decision.textContent = "NO-GO: No active sources were identified. Source intake is required before synthesis.";
    return;
  }

  const blocked = sources.filter(source => source.status !== "available");
  if (blocked.length > 0) {
    const titles = blocked.map(source => source.title).join(", ");
    decision.className = "decision no-go";
    decision.textContent = `NO-GO: ${blocked.length} source(s) are missing or uncertain: ${titles}. Complete or resolve the source pack before integrated synthesis.`;
    return;
  }

  decision.className = "decision go";
  decision.textContent = `GO FOR CONTROLLED SYNTHESIS: ${sources.length} source(s) are available. Source-specific processing and quality review are still required before release.`;
}

function exportManifest() {
  const manifest = {
    project: "Rambam LawSys",
    generated_at: new Date().toISOString(),
    source_count: sources.length,
    ready_for_controlled_synthesis:
      sources.length > 0 && sources.every(source => source.status === "available"),
    sources
  };

  const blob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rambam-lawsys-source-manifest.json";
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#add-source").addEventListener("click", () => {
  addSource(titleInput.value, typeInput.value, statusInput.value);
});

document.querySelector("#load-sample").addEventListener("click", () => {
  sources.splice(0, sources.length,
    {
      id: crypto.randomUUID(),
      title: "Course syllabus",
      type: "Syllabus",
      status: "available"
    },
    {
      id: crypto.randomUUID(),
      title: "Hart, The Concept of Law",
      type: "Academic article",
      status: "available"
    },
    {
      id: crypto.randomUUID(),
      title: "Lecture 4 transcript",
      type: "Lecture transcript",
      status: "missing"
    }
  );
  renderSources();
  resetDecision();
});

document.querySelector("#evaluate").addEventListener("click", evaluateReadiness);
document.querySelector("#export-manifest").addEventListener("click", exportManifest);

renderSources();
