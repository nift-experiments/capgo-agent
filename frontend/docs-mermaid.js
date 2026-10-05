// Recovered apps/docs/src/components/MermaidGraph.astro; MIT Starlight / AGPL Capgo, see frontend/licenses.
import mermaid from "mermaid";
function initializeMermaid() {
  const isDarkTheme = document.documentElement.dataset.theme === "dark";
  mermaid.initialize({
    startOnLoad: true,
    theme: isDarkTheme ? "dark" : "default",
    fontSize: 18
  });
}
function saveOriginalContent() {
  document.querySelectorAll(".mermaid").forEach((element) => {
    if (!element.getAttribute("data-original-content")) {
      element.setAttribute("data-original-content", element.innerHTML);
    }
  });
}
function resetAndRender() {
  document.querySelectorAll(".mermaid").forEach((element) => {
    const originalContent = element.getAttribute("data-original-content");
    if (originalContent) {
      element.removeAttribute("data-processed");
      element.innerHTML = originalContent;
    }
  });
  const isDarkTheme = document.documentElement.dataset.theme === "dark";
  mermaid.initialize({
    startOnLoad: false,
    theme: isDarkTheme ? "dark" : "default",
    fontSize: 18
  });
  mermaid.run();
}
document.addEventListener("DOMContentLoaded", () => {
  initializeMermaid();
  saveOriginalContent();
});
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "data-theme") {
      resetAndRender();
    }
  });
});
if (typeof document !== "undefined") {
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
