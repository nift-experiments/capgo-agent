// Recovered node_modules/@astrojs/starlight/dist/components/MobileTableOfContents.astro; MIT Starlight / AGPL Capgo, see frontend/licenses.
import { StarlightTOC } from "./docs-toc.js";
class MobileStarlightTOC extends StarlightTOC {
  set current(link) {
    super.current = link;
    const display = this.querySelector(".display-current");
    if (display) display.textContent = link.textContent;
  }
  constructor() {
    super();
    const details = this.querySelector("details");
    if (!details) return;
    const closeToC = () => {
      details.open = false;
    };
    details.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeToC);
    });
    window.addEventListener("click", (e) => {
      if (!details.contains(e.target)) closeToC();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && details.open) {
        const hasFocus = details.contains(document.activeElement);
        closeToC();
        if (hasFocus) {
          const summary = details.querySelector("summary");
          if (summary) summary.focus();
        }
      }
    });
  }
}
customElements.define("mobile-starlight-toc", MobileStarlightTOC);
