const UDID_RESULT_ENDPOINT = "/api/tools/ios-udid-finder/result";
const fields = [
  ["UDID", "udid"],
  ["Device name", "deviceName"],
  ["Product", "product"],
  ["iOS version", "version"],
  ["Serial number", "serial"],
  ["IMEI", "imei"],
  ["MEID", "meid"]
];
const statusRegion = document.querySelector("#copy-status");
const description = document.querySelector("#result-description");
const rowsRoot = document.querySelector("#result-rows");
const emptyState = document.querySelector("#result-empty");
const emailLink = document.querySelector("#result-email");
function updateEmailLink(rows) {
  if (!emailLink) return;
  const body = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  emailLink.href = `mailto:?subject=${encodeURIComponent("My iOS device UDID")}&body=${encodeURIComponent(body)}`;
  emailLink.classList.remove("hidden");
  emailLink.classList.add("inline-flex");
}
function announceCopyStatus(message) {
  if (statusRegion) {
    statusRegion.textContent = message;
  }
}
function buildRow(label, value) {
  const card = document.createElement("div");
  card.className = "rounded-2xl border border-white/10 bg-slate-950/70 p-5";
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";
  const text = document.createElement("div");
  const labelElement = document.createElement("p");
  labelElement.className = "text-xs tracking-[0.25em] text-fuchsia-300 uppercase";
  labelElement.textContent = label;
  const valueElement = document.createElement("p");
  valueElement.className = "mt-2 font-mono text-sm break-all text-white";
  valueElement.textContent = value;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-fuchsia-300/60 hover:bg-white/5";
  button.dataset.copyValue = value;
  button.textContent = "Copy";
  text.append(labelElement, valueElement);
  wrapper.append(text, button);
  card.append(wrapper);
  return card;
}
function renderPayload(payload) {
  if (!rowsRoot || !emptyState || !description) return;
  rowsRoot.replaceChildren();
  const rows = fields.map(([label, key]) => [label, payload?.[key] ?? ""]).filter(([, value]) => Boolean(value));
  if (payload?.udid && rows.length > 0) {
    document.title = "iOS UDID Finder Result | Device Identifier Received";
    description.textContent = "The backend received the device payload successfully. Copy the values you need for Apple Developer or your tester registry below.";
    emptyState.classList.add("hidden");
    rows.forEach(([label, value]) => rowsRoot.append(buildRow(label, value)));
    updateEmailLink(rows);
    bindCopyButtons();
    return;
  }
  document.title = "iOS UDID Finder Result";
  description.textContent = "Waiting for a device response. If you just installed the profile, this page will populate automatically after the redirect completes.";
  emptyState.classList.remove("hidden");
}
function payloadFromQuery() {
  const value = new URLSearchParams(window.location.search).get("p");
  if (!value) return null;
  try {
    const bytes = Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || typeof parsed.udid !== "string" || !parsed.udid) {
      return null;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("p")) {
      url.searchParams.delete("p");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
    return {
      udid: String(parsed.udid ?? ""),
      deviceName: String(parsed.deviceName ?? ""),
      product: String(parsed.product ?? ""),
      version: String(parsed.version ?? ""),
      serial: String(parsed.serial ?? ""),
      imei: String(parsed.imei ?? ""),
      meid: String(parsed.meid ?? "")
    };
  } catch {
    return null;
  }
}
async function loadPayload() {
  const fromQuery = payloadFromQuery();
  if (fromQuery) {
    void fetch(UDID_RESULT_ENDPOINT, { credentials: "same-origin", headers: { Accept: "application/json" } }).catch(() => void 0);
    return fromQuery;
  }
  try {
    const response = await fetch(UDID_RESULT_ENDPOINT, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || typeof data !== "object" || !("payload" in data)) return null;
    const payload = data.payload;
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}
async function copyText(value) {
  const fallbackCopy = () => {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "true");
    helper.style.position = "absolute";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const legacyCopy = Reflect.get(document, "execCommand");
    const copied = typeof legacyCopy === "function" ? legacyCopy.call(document, "copy") : false;
    helper.remove();
    if (!copied) {
      throw new Error("Copy failed");
    }
  };
  if (!navigator.clipboard?.writeText) {
    fallbackCopy();
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    fallbackCopy();
  }
}
function bindCopyButtons() {
  document.querySelectorAll("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue;
      if (!value) return;
      const original = button.textContent || "Copy";
      try {
        await copyText(value);
        button.textContent = "Copied";
        announceCopyStatus("Value copied to clipboard.");
      } catch {
        button.textContent = "Copy failed";
        announceCopyStatus("Copy to clipboard failed.");
      }
      window.setTimeout(() => {
        button.textContent = original;
        announceCopyStatus("");
      }, 1600);
    });
  });
}
void loadPayload().then((payload) => {
  renderPayload(payload);
});
