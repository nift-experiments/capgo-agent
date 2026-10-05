// Recovered apps/docs/node_modules/@astrojs/starlight-docsearch/dist/DocSearch.astro; MIT Starlight / AGPL Capgo, see frontend/licenses.
const config = { appId: "R0TIQUJRSN", apiKey: "039b8d50eaa068b9ff8726d912c6f388", indexName: "capgo" };
class StarlightDocSearch extends HTMLElement {
  constructor() {
    super();
    window.addEventListener("DOMContentLoaded", async () => {
      const { default: docsearch } = await import("@docsearch/js");
      const options = { ...config, container: "sl-doc-search" };
      try {
        const translations = JSON.parse(this.dataset.translations || "{}");
        Object.assign(options, translations);
      } catch {
      }
      docsearch(options);
    });
  }
}
customElements.define("sl-doc-search", StarlightDocSearch);
