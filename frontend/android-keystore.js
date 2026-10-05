// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { downloadFile, postJson } from "./recovered/scripts/tool-client.js";
const form = document.getElementById("android-keystore-form");
const errorBox = document.getElementById("android-keystore-error");
const emptyState = document.getElementById("android-keystore-empty");
const result = document.getElementById("android-keystore-result");
const summary = document.getElementById("android-keystore-summary");
const downloads = document.getElementById("android-keystore-downloads");
let generatedFiles = [];
const createSummaryItem = (label, value, className = "") => {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const detail = document.createElement("dd");
  wrapper.className = className;
  term.className = "text-xs uppercase tracking-[0.25em] text-emerald-300";
  term.textContent = label;
  detail.className = "mt-2 text-sm leading-7 text-white";
  detail.textContent = value;
  wrapper.append(term, detail);
  return wrapper;
};
const renderSummary = (response) => {
  const list = document.createElement("dl");
  list.className = "grid gap-4 sm:grid-cols-2";
  const sha1 = createSummaryItem("SHA-1", response.summary.fingerprintSha1);
  const sha256 = createSummaryItem("SHA-256", response.summary.fingerprintSha256);
  sha1.lastElementChild?.classList.add("break-all");
  sha256.lastElementChild?.classList.add("break-all");
  list.append(
    createSummaryItem("Subject", response.summary.subject, "sm:col-span-2"),
    createSummaryItem("Alias", response.summary.alias),
    createSummaryItem("Validity", `${response.summary.validityYears} years`),
    sha1,
    sha256
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
    button.className = "rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-emerald-300/50 hover:bg-white/8";
    name.className = "block text-sm font-semibold text-white";
    name.textContent = file.fileName;
    hint.className = "mt-2 block text-xs uppercase tracking-[0.2em] text-emerald-300";
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
    const response = await postJson("/api/tools/android-keystore-generator", payload);
    generatedFiles = response.files;
    renderSummary(response);
    renderDownloads(response.files);
    emptyState.classList.add("hidden");
    result.classList.remove("hidden");
  } catch (error) {
    errorBox.textContent = error instanceof Error ? error.message : "The keystore generation failed.";
    errorBox.classList.remove("hidden");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});
