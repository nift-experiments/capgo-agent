// Recovered node_modules/@astrojs/starlight/dist/components-internals/TableOfContents/starlight-toc.js; MIT Starlight / AGPL Capgo, see frontend/licenses.
const PAGE_TITLE_ID = "_top";
var StarlightTOC = class extends HTMLElement {
  _current = this.querySelector('a[aria-current="true"]');
  minH = parseInt(this.dataset.minH || "2", 10);
  maxH = parseInt(this.dataset.maxH || "3", 10);
  /**
  * CSS selector string that matches only headings that can appear in the table of contents.
  * Generates a selector like `h1#_top,:where(h2,h3)[id]`.
  */
  tocHeadingSelector = `h1#${PAGE_TITLE_ID},:where(${[...Array.from({ length: 1 + this.maxH - this.minH }).map((_, index) => `h${this.minH + index}`)].join()})[id]`;
  set current(link) {
    if (link === this._current) return;
    if (this._current) this._current.removeAttribute("aria-current");
    link.setAttribute("aria-current", "true");
    this._current = link;
  }
  onIdle = (cb) => (window.requestIdleCallback || ((cb2) => setTimeout(cb2, 1)))(cb);
  constructor() {
    super();
    this.onIdle(() => this.init());
  }
  init = () => {
    const links = [...this.querySelectorAll("a")];
    const isHeading = (el) => el.matches(this.tocHeadingSelector);
    const getElementHeading = (el) => {
      while (el) {
        if (el.matches(".sl-markdown-content, main > *")) return document.getElementById(PAGE_TITLE_ID);
        if (isHeading(el)) return el;
        const childHeading = el.querySelector(this.tocHeadingSelector);
        if (childHeading) return childHeading;
        let prev = el.previousElementSibling;
        while (prev?.lastElementChild) prev = prev.lastElementChild;
        el = prev ?? el.parentElement;
      }
      return null;
    };
    const setCurrent = (entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        const heading = getElementHeading(target);
        if (!heading) continue;
        const link = links.find((link2) => link2.hash === "#" + encodeURIComponent(heading.id));
        if (link) {
          this.current = link;
          break;
        }
      }
    };
    const toObserve = document.querySelectorAll([
      `main :where(${this.tocHeadingSelector})`,
      `main :where(${this.tocHeadingSelector}, .sl-heading-wrapper) ~ *:not(:has(${this.tocHeadingSelector}))`,
      `main .sl-markdown-content > *:not(:has(${this.tocHeadingSelector}))`,
      `main > *:not(:has(${this.tocHeadingSelector}))`
    ].join());
    let observer;
    const observe = () => {
      if (observer) return;
      observer = new IntersectionObserver(setCurrent, { rootMargin: this.getRootMargin() });
      toObserve.forEach((h) => observer.observe(h));
    };
    observe();
    let timeout;
    window.addEventListener("resize", () => {
      if (observer) {
        observer.disconnect();
        observer = void 0;
      }
      clearTimeout(timeout);
      timeout = setTimeout(() => this.onIdle(observe), 200);
    });
  };
  getRootMargin() {
    const top = (document.querySelector("header")?.getBoundingClientRect().height || 0) + (this.querySelector("summary")?.getBoundingClientRect().height || 0) + 32;
    return `-${top}px 0% ${top + 53 - document.documentElement.clientHeight}px`;
  }
};
customElements.define("starlight-toc", StarlightTOC);
export {
  StarlightTOC
};
