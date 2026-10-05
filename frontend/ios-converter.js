// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { downloadFile } from "./recovered/scripts/tool-client.js";
const p12Form = document.getElementById("p12-form");
const p12Status = document.getElementById("p12-status");
const p12Error = document.getElementById("p12-error");
const p12Result = document.getElementById("p12-result");
const p12Summary = document.getElementById("p12-summary");
const p12Download = document.getElementById("p12-download");
const p12Base64 = document.getElementById("p12-base64");
const p12Copy = document.getElementById("p12-copy");
let p12File = null;
const showP12Error = (message) => {
  if (!p12Error) return;
  p12Error.textContent = message;
  p12Error.classList.remove("hidden");
};
const addSummaryItem = (label, value) => {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const detail = document.createElement("dd");
  term.className = "text-xs uppercase tracking-[0.25em] text-cyan-300";
  term.textContent = label;
  detail.className = "mt-2 text-sm leading-7 break-words text-white";
  detail.textContent = value;
  wrapper.append(term, detail);
  p12Summary?.append(wrapper);
};
p12Form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!p12Form || !p12Status || !p12Error || !p12Result || !p12Summary || !p12Base64) return;
  const formData = new FormData(p12Form);
  const certificate = formData.get("certificate");
  const privateKey = formData.get("privateKey");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  p12Error.classList.add("hidden");
  p12Error.textContent = "";
  if (!(certificate instanceof File) || certificate.size === 0) {
    showP12Error("Select the .cer certificate file you downloaded from Apple Developer.");
    return;
  }
  if (!(privateKey instanceof File) || privateKey.size === 0) {
    showP12Error("Select the private key .pem file from step 1.");
    return;
  }
  if (!password) {
    showP12Error("Enter a password to protect the .p12 file.");
    return;
  }
  if (password !== passwordConfirm) {
    showP12Error("The two passwords do not match.");
    return;
  }
  const submitButton = p12Form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent || "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Building .p12...";
  }
  p12Status.textContent = "Building your .p12 locally in this browser...";
  try {
    const { convertCertificateToP12 } = await import("./recovered/lib/tools/p12.js");
    const result = await convertCertificateToP12({
      certificate: new Uint8Array(await certificate.arrayBuffer()),
      privateKey: await privateKey.text(),
      password
    });
    p12File = { fileName: result.fileName, base64: result.base64 };
    p12Summary.replaceChildren();
    addSummaryItem("Certificate", result.summary.commonName);
    if (result.summary.teamId) addSummaryItem("Team ID", result.summary.teamId);
    addSummaryItem("Expires", result.summary.expiresAt.toISOString().slice(0, 10));
    addSummaryItem("Encryption", "3DES, SHA-1 MAC");
    p12Base64.value = result.base64;
    p12Result.classList.remove("hidden");
    p12Status.textContent = result.summary.expired ? `Built ${result.fileName}, but this certificate has expired. Create a new certificate in Apple Developer before signing.` : `Built ${result.fileName}. The certificate matches your private key. Download it or copy the base64 value below.`;
  } catch (error) {
    p12Result.classList.add("hidden");
    p12File = null;
    p12Status.textContent = "The .p12 could not be built.";
    showP12Error(error instanceof Error ? error.message : "The .p12 conversion failed.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});
p12Download?.addEventListener("click", () => {
  if (!p12File) return;
  downloadFile({ fileName: p12File.fileName, mimeType: "application/x-pkcs12", encoding: "base64", content: p12File.base64 });
});
p12Copy?.addEventListener("click", async () => {
  if (!p12Base64 || !p12Status) return;
  try {
    await navigator.clipboard.writeText(p12Base64.value);
    p12Status.textContent = "Base64 copied to the clipboard.";
  } catch {
    p12Base64.select();
    p12Status.textContent = "Copy failed. The base64 value is selected so you can copy it manually.";
  }
});
