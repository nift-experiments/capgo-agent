// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function decodeBase64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}
function downloadFile(file) {
  const blob = file.encoding === "base64" ? decodeBase64ToBlob(file.content, file.mimeType) : new Blob([file.content], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : "The request failed. Please review your values and try again.";
    throw new Error(message);
  }
  if (payload === null) {
    throw new Error("The server returned an empty or invalid JSON response.");
  }
  return payload;
}
export {
  decodeBase64ToBlob,
  downloadFile,
  escapeHtml,
  postJson
};
