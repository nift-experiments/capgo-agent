// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { defineTool } from "@nekuda/webmcp-sdk";
const SIGNUP_PREFILL_KEY = "capgo:webmcp:signup-prefill";
const STOP_WORDS = /* @__PURE__ */ new Set(["the", "and", "for", "with", "how", "what", "does", "can", "you", "your", "are", "capgo", "use", "from", "that", "this", "into", "about"]);
let docsPromise;
function terms(query) {
  return [...new Set(query.toLowerCase().match(/[\p{L}\p{N}+#.-]{2,}/gu) ?? [])].filter((term) => !STOP_WORDS.has(term));
}
function score(text, queryTerms) {
  const haystack = text.toLowerCase();
  return queryTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
}
function topMatches(items, rank, limit) {
  return items.map((item) => ({ item, score: rank(item) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((entry) => entry.item);
}
function splitSections(markdown) {
  const sections = [];
  let page = "";
  let title = "";
  let lines = [];
  const flush = () => {
    const text = lines.join("\n").trim();
    if (text) sections.push({ title, text });
  };
  for (const line of markdown.split("\n")) {
    const heading = /^(#{1,2})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      if (heading[1] === "#") page = heading[2];
      title = heading[1] === "#" ? page : `${page} \u203A ${heading[2]}`;
      lines = [];
    } else if (!line.startsWith("[Section titled")) {
      lines.push(line);
    }
  }
  flush();
  return sections;
}
function loadDocs() {
  docsPromise ??= Promise.all(
    ["/llms.txt", "/llms-full.txt"].map(async (path) => {
      const response = await fetch(path, { headers: { accept: "text/plain" } });
      if (!response.ok) throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
      return splitSections(await response.text());
    })
  ).then((parts) => parts.flat());
  docsPromise.catch(() => docsPromise = void 0);
  return docsPromise;
}
function localePath(path) {
  const lang = document.documentElement.lang;
  const prefix = lang && lang !== "en" ? `/${lang}` : "";
  return `${prefix}${path}`;
}
function applySignupPrefill(prefill) {
  const form = document.getElementById("registerForm");
  if (!form) throw new Error("Signup form not found on this page");
  const filled = [];
  for (const [field, value] of Object.entries(prefill)) {
    const input = form.querySelector(`#${field}`);
    if (!input || typeof value !== "string" || !value) continue;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    filled.push(field);
  }
  form.querySelector("#password")?.focus();
  return filled;
}
const askCapgo = defineTool({
  stableKey: "site.ask",
  name: "ask_capgo",
  title: "Ask Capgo",
  source: "merchant_authored",
  intent: "answer",
  description: "Answer a question about Capgo (Capacitor live updates, native iOS/Android builds, CLI, public API, plugins, when Capgo fits) from the Capgo documentation (llms.txt and llms-full.txt). Use this before guessing about Capgo features, setup steps, or limits. Returns the most relevant documentation sections (page and heading, text excerpt); compose the answer from them.",
  inputSchema: {
    type: "object",
    properties: {
      question: { type: "string", minLength: 2, description: 'The visitor question, e.g. "How do I roll back a live update?"' }
    },
    required: ["question"],
    additionalProperties: false
  },
  annotations: { readOnlyHint: true },
  async execute({ question }) {
    const queryTerms = terms(question);
    const matches = topMatches(await loadDocs(), (section) => score(section.title, queryTerms) * 2 + score(section.text, queryTerms), 4).map((section) => ({
      title: section.title,
      excerpt: section.text.slice(0, 1500)
    }));
    if (!matches.length) {
      return { question, matches, note: "No Capgo documentation matched this question. Try different keywords, or contact support@capgo.app / sales@capgo.app." };
    }
    return { question, matches, source: `${location.origin}/llms-full.txt`, docs: `${location.origin}/docs/` };
  }
});
const searchPlugins = defineTool({
  stableKey: "plugins.search",
  name: "search_capacitor_plugins",
  title: "Search Capacitor plugins",
  source: "merchant_authored",
  intent: "answer",
  description: 'Search the Capgo Capacitor plugin directory (150+ plugins) by capability or name, e.g. "barcode scanner", "background geolocation", "in-app purchase". Use when a visitor asks whether a native feature is available for Capacitor or Ionic. Returns matching plugins with npm package name, description, weekly downloads, and Capgo page and docs URLs.',
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", minLength: 2, description: "Capability or plugin name to look for" },
      limit: { type: "integer", minimum: 1, maximum: 20, default: 8 }
    },
    required: ["query"],
    additionalProperties: false
  },
  annotations: { readOnlyHint: true },
  async execute({ query, limit }) {
    const response = await fetch("/plugins.json");
    if (!response.ok) throw new Error(`Failed to load plugin directory: HTTP ${response.status}`);
    const directory = await response.json();
    const queryTerms = terms(query);
    const plugins = topMatches(directory.plugins, (plugin) => score(plugin.searchText, queryTerms), limit ?? 8).map((plugin) => ({
      title: plugin.title,
      packageName: plugin.packageName,
      description: plugin.description,
      npmWeeklyDownloads: plugin.metrics?.npmWeeklyDownloads,
      page: plugin.urls.capgo,
      docs: plugin.urls.docs
    }));
    if (!plugins.length) return { query, plugins, note: "No plugin in the Capgo directory matches this query.", directory: `${location.origin}/plugins/` };
    return { query, plugins };
  }
});
const startSignup = defineTool({
  stableKey: "signup.start",
  name: "start_capgo_signup",
  title: "Start Capgo signup",
  source: "merchant_authored",
  intent: "act",
  description: "Open the Capgo free account signup form and prefill the visitor email, first name, and last name when provided. Use when the visitor wants to create a Capgo account or start a trial. Does NOT create the account: the visitor must choose a password, pass the captcha, and press the submit button themselves. Returns the signup URL and which fields were prefilled.",
  inputSchema: {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      firstName: { type: "string" },
      lastName: { type: "string" }
    },
    additionalProperties: false
  },
  async execute(prefill) {
    const url = new URL(localePath("/register/"), location.origin);
    const nextStep = "Visitor must enter a password, complete the captcha, and submit the form.";
    if (document.getElementById("registerForm")) {
      return { status: "awaiting_user", url: url.toString(), prefilled: applySignupPrefill(prefill), nextStep };
    }
    sessionStorage.setItem(SIGNUP_PREFILL_KEY, JSON.stringify(prefill));
    location.assign(url);
    return { status: "navigating", url: url.toString(), prefilled: Object.keys(prefill), nextStep };
  }
});
const PAGES = {
  pricing: "/pricing/",
  "live-updates": "/live-update/",
  "native-build": "/native-build/",
  plugins: "/plugins/",
  "signing-tools": "/tools/",
  docs: "/docs/",
  "public-api-docs": "/docs/public-api/",
  "ai-skills": "/skills/",
  enterprise: "/enterprise/",
  contact: "/contact/"
};
const openPage = defineTool({
  stableKey: "site.open_page",
  name: "open_capgo_page",
  title: "Open Capgo page",
  source: "merchant_authored",
  intent: "act",
  description: "Navigate the visitor to a key Capgo page: pricing (plans and credits), live-updates, native-build (cloud iOS/Android builds), plugins directory, signing-tools (iOS certificates, UDID, Android keystore), docs, public-api-docs, ai-skills (agent skills and MCP), enterprise, or contact (support and sales emails). Use when the visitor wants to see that page. Returns the destination URL.",
  inputSchema: {
    type: "object",
    properties: {
      page: { type: "string", enum: Object.keys(PAGES) }
    },
    required: ["page"],
    additionalProperties: false
  },
  async execute({ page }) {
    const path = PAGES[page];
    if (!path) throw new Error(`Unknown page: ${page}`);
    const url = new URL(localePath(path), location.origin);
    location.assign(url);
    return { status: "navigating", url: url.toString() };
  }
});
export {
  SIGNUP_PREFILL_KEY,
  applySignupPrefill,
  askCapgo,
  openPage,
  searchPlugins,
  startSignup
};
