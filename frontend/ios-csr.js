// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { downloadFile, postJson } from "./recovered/scripts/tool-client.js";
const form = document.getElementById("ios-certificate-form");
const errorBox = document.getElementById("ios-certificate-error");
const emptyState = document.getElementById("ios-certificate-empty");
const result = document.getElementById("ios-certificate-result");
const summary = document.getElementById("ios-certificate-summary");
const downloads = document.getElementById("ios-certificate-downloads");
let generatedFiles = [];
const createSummaryItem = (label, value) => {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const detail = document.createElement("dd");
  term.className = "text-xs uppercase tracking-[0.25em] text-cyan-300";
  term.textContent = label;
  detail.className = "mt-2 text-sm leading-7 text-white";
  detail.textContent = value;
  wrapper.append(term, detail);
  return wrapper;
};
const renderSummary = (response) => {
  const list = document.createElement("dl");
  list.className = "grid gap-4 sm:grid-cols-3";
  list.append(
    createSummaryItem("Subject", response.summary.subject),
    createSummaryItem("Key type", response.summary.keyType),
    createSummaryItem("Hash", response.summary.hashAlgorithm)
  );
  summary?.replaceChildren(list);
};
const renderDownloads = (files) => {
  const buttons = files.map((file, index) => {
    const button = document.createElement("button");
    const name = document.createElement("span");
    const hint = document.createElement("span");
    button.type = "button";
    button.dataset.fileIndex = String(index);
    button.className = "rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-cyan-300/50 hover:bg-white/8";
    name.className = "block text-sm font-semibold text-white";
    name.textContent = file.fileName;
    hint.className = "mt-2 block text-xs uppercase tracking-[0.2em] text-cyan-300";
    hint.textContent = "Download file";
    button.append(name, hint);
    return button;
  });
  downloads?.replaceChildren(...buttons);
};
downloads?.addEventListener("click", (event) => {
  const target = event.target.closest("[data-file-index]");
  if (!target) return;
  const file = generatedFiles[Number.parseInt(target.dataset.fileIndex || "-1", 10)];
  if (file) downloadFile(file);
});
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form || !errorBox || !emptyState || !result || !summary || !downloads) return;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent || "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Generating...";
  }
  errorBox.classList.add("hidden");
  try {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const response = await postJson("/api/tools/ios-certificate-generator", payload);
    generatedFiles = response.files;
    renderSummary(response);
    renderDownloads(response.files);
    emptyState.classList.add("hidden");
    result.classList.remove("hidden");
  } catch (error) {
    errorBox.textContent = error instanceof Error ? error.message : "The CSR generation failed.";
    errorBox.classList.remove("hidden");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});
