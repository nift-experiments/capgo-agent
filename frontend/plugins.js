document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("plugin-search");
  const categorySelect = document.getElementById("plugin-category-select");
  const categoryFilterButtons = Array.from(document.querySelectorAll("[data-category-filter]"));
  const sortDropdown = document.getElementById("plugin-sort-dropdown");
  const sortButton = document.getElementById("plugin-sort-button");
  const sortButtonLabel = document.getElementById("plugin-sort-current-label");
  const sortMenu = document.getElementById("plugin-sort-menu");
  const sortChevron = document.getElementById("plugin-sort-chevron");
  const sortOptionButtons = Array.from(document.querySelectorAll("[data-sort-option]"));
  const pluginsGrid = document.getElementById("plugins-grid");
  const pluginCards = document.querySelectorAll(".plugin-card");
  const resultsCount = document.getElementById("search-results-count");
  const totalPlugins = pluginCards.length;
  let currentSort = sortButton?.dataset.sortValue || "downloads";
  let currentCategory = "all";
  const activeSortClasses = ["border-blue-400/40", "bg-blue-500/15", "text-white", "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"];
  const inactiveSortClasses = ["border-transparent", "text-slate-200", "hover:border-white/10", "hover:bg-white/5", "hover:text-white"];
  const activeCategoryClasses = ["bg-blue-500/15", "text-white"];
  const inactiveCategoryClasses = ["text-gray-300", "hover:bg-gray-900/80", "hover:text-white"];
  function isSortMenuOpen() {
    return sortButton?.getAttribute("aria-expanded") === "true";
  }
  function setSortMenuState(isOpen) {
    if (!sortButton || !sortMenu) return;
    sortButton.setAttribute("aria-expanded", String(isOpen));
    sortMenu.setAttribute("aria-hidden", String(!isOpen));
    sortMenu.classList.toggle("pointer-events-none", !isOpen);
    sortMenu.classList.toggle("invisible", !isOpen);
    sortMenu.classList.toggle("opacity-0", !isOpen);
    sortMenu.classList.toggle("translate-y-2", !isOpen);
    sortMenu.classList.toggle("opacity-100", isOpen);
    sortMenu.classList.toggle("translate-y-0", isOpen);
    sortChevron?.classList.toggle("rotate-180", isOpen);
  }
  function syncSortSelection(sortBy) {
    currentSort = sortBy;
    sortOptionButtons.forEach((button) => {
      const isActive = button.dataset.sortValue === sortBy;
      button.setAttribute("aria-pressed", String(isActive));
      activeSortClasses.forEach((className) => button.classList.toggle(className, isActive));
      inactiveSortClasses.forEach((className) => button.classList.toggle(className, !isActive));
      const checkIcon = button.querySelector("[data-sort-check]");
      checkIcon?.classList.toggle("opacity-100", isActive);
      checkIcon?.classList.toggle("opacity-0", !isActive);
    });
    const activeButton = sortOptionButtons.find((button) => button.dataset.sortValue === sortBy);
    if (sortButton) {
      sortButton.dataset.sortValue = sortBy;
    }
    if (sortButtonLabel && activeButton?.dataset.sortLabel) {
      sortButtonLabel.textContent = activeButton.dataset.sortLabel;
    }
  }
  function focusSortOption(index) {
    const option = index >= 0 ? sortOptionButtons[index] : void 0;
    option?.focus();
  }
  function updateResultsCount(visibleCount) {
    if (!resultsCount) return;
    const searchTerm = searchInput?.value.trim() ?? "";
    if (searchTerm === "" && currentCategory === "all") {
      resultsCount.textContent = "";
      return;
    }
    resultsCount.textContent = `Showing ${visibleCount} of ${totalPlugins} plugins`;
  }
  function filterPlugins() {
    const searchTerm = searchInput?.value.toLowerCase().trim() ?? "";
    let visibleCount = 0;
    pluginCards.forEach((card) => {
      const title = card.getAttribute("data-title") || "";
      const description = card.getAttribute("data-description") || "";
      const author = card.getAttribute("data-author") || "";
      const packageName = card.getAttribute("data-package") || "";
      const category = card.getAttribute("data-category") || "";
      const categoryLabel = card.getAttribute("data-category-label") || "";
      const matchesCategory = currentCategory === "all" || category === currentCategory;
      const matchesSearch = searchTerm === "" || title.includes(searchTerm) || description.includes(searchTerm) || author.includes(searchTerm) || packageName.includes(searchTerm) || categoryLabel.includes(searchTerm);
      if (matchesCategory && matchesSearch) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });
    updateResultsCount(visibleCount);
  }
  function syncCategorySelection(category) {
    currentCategory = category;
    if (categorySelect && categorySelect.value !== category) {
      categorySelect.value = category;
    }
    categoryFilterButtons.forEach((button) => {
      const isActive = button.dataset.category === category;
      button.setAttribute("aria-pressed", String(isActive));
      activeCategoryClasses.forEach((className) => button.classList.toggle(className, isActive));
      inactiveCategoryClasses.forEach((className) => button.classList.toggle(className, !isActive));
    });
    filterPlugins();
  }
  function sortPlugins(sortBy) {
    if (!pluginsGrid) return;
    const cardsArray = Array.from(pluginCards);
    cardsArray.sort((a, b) => {
      if (sortBy === "downloads") {
        const aDownloads = parseInt(a.getAttribute("data-downloads") || "0", 10);
        const bDownloads = parseInt(b.getAttribute("data-downloads") || "0", 10);
        return bDownloads - aDownloads;
      } else if (sortBy === "stars") {
        const aStars = parseInt(a.getAttribute("data-stars") || "0", 10);
        const bStars = parseInt(b.getAttribute("data-stars") || "0", 10);
        return bStars - aStars;
      } else {
        const aTitle = a.getAttribute("data-title") || "";
        const bTitle = b.getAttribute("data-title") || "";
        return aTitle.localeCompare(bTitle);
      }
    });
    cardsArray.forEach((card) => {
      pluginsGrid.appendChild(card);
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", filterPlugins);
  }
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      syncCategorySelection(categorySelect.value);
    });
  }
  categoryFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      syncCategorySelection(button.dataset.category || "all");
    });
  });
  if (sortButton && sortMenu && sortDropdown && sortOptionButtons.length > 0) {
    sortButton.addEventListener("click", () => {
      const nextOpenState = !isSortMenuOpen();
      setSortMenuState(nextOpenState);
      if (nextOpenState) {
        const activeIndex = sortOptionButtons.findIndex((button) => button.dataset.sortValue === currentSort);
        focusSortOption(activeIndex >= 0 ? activeIndex : 0);
      }
    });
    sortButton.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSortMenuState(true);
        const activeIndex = sortOptionButtons.findIndex((button) => button.dataset.sortValue === currentSort);
        focusSortOption(activeIndex >= 0 ? activeIndex : 0);
      }
    });
    sortMenu.addEventListener("keydown", (event) => {
      const focusedIndex = sortOptionButtons.findIndex((button) => button === document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        setSortMenuState(false);
        sortButton.focus();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusSortOption((focusedIndex + 1 + sortOptionButtons.length) % sortOptionButtons.length);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusSortOption((focusedIndex - 1 + sortOptionButtons.length) % sortOptionButtons.length);
      }
    });
    sortOptionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextSort = button.dataset.sortValue || "downloads";
        syncSortSelection(nextSort);
        sortPlugins(nextSort);
        setSortMenuState(false);
        sortButton.focus();
      });
    });
    document.addEventListener("click", (event) => {
      if (!sortDropdown.contains(event.target)) {
        setSortMenuState(false);
      }
    });
    sortDropdown.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!sortDropdown.contains(document.activeElement)) {
          setSortMenuState(false);
        }
      }, 0);
    });
  }
  syncSortSelection(currentSort);
  sortPlugins(currentSort);
  syncCategorySelection(currentCategory);
});
