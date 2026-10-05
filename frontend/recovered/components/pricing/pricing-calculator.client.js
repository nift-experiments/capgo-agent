// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import {
  deriveUsage,
  getIncludedUsage,
  getOverageUsage,
  getPlanBillingPrice,
  getPlanMonthlyPrice,
  recommendPlan,
  usageToCreditPayload
} from "../../lib/pricingCalculator.js";
function setupPricingCalculator(config) {
  const plans = JSON.parse(config.plansJson);
  const copy = JSON.parse(config.copyJson);
  const modalElement = document.getElementById("pricing-calculator-modal");
  if (!(modalElement instanceof HTMLDialogElement)) return;
  const modal = modalElement;
  const openButton = document.querySelector("[data-pricing-calculator-open]");
  const openCreditsButton = document.querySelector("[data-pricing-calculator-open-credits]");
  const mauInput = document.querySelector("[data-pricing-calculator-mau]");
  const updatesInput = document.querySelector("[data-pricing-calculator-updates]");
  const sizeInput = document.querySelector("[data-pricing-calculator-size]");
  const modeInputs = document.querySelectorAll("[data-pricing-calculator-mode]");
  const planPanel = document.querySelector("[data-pricing-calculator-plan-panel]");
  const planSelect = document.querySelector("[data-pricing-calculator-plan-select]");
  const includedLabel = document.querySelector("[data-pricing-calculator-included-label]");
  const planLineLabel = document.querySelector("[data-pricing-calculator-plan-line-label]");
  const billingInputs = document.querySelectorAll("[data-pricing-calculator-billing]");
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  let debounceTimer;
  let selectedPlanId = null;
  let userChangedPlan = false;
  function formatNumber(num) {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}k`;
    return Math.round(num).toLocaleString("en-US");
  }
  function formatGiB(num) {
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)} TB`;
    if (num >= 10) return `${Math.round(num)} GiB`;
    if (num >= 1) return `${num.toFixed(1)} GiB`;
    return `${num.toFixed(2)} GiB`;
  }
  function formatPrice(price) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function isYearlyBilling() {
    const checked = document.querySelector("[data-pricing-calculator-billing]:checked");
    if (checked instanceof HTMLInputElement) return checked.value === "yearly";
    const yearly = document.getElementById("yearly");
    return yearly instanceof HTMLInputElement && yearly.checked;
  }
  function syncBillingFromPage() {
    const pageYearly = document.getElementById("yearly");
    const yearlySelected = pageYearly instanceof HTMLInputElement && pageYearly.checked;
    billingInputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = yearlySelected ? input.value === "yearly" : input.value === "monthly";
      }
    });
  }
  function formatAmountWithPeriod(amount, yearly) {
    return `$${formatPrice(amount)}${yearly ? copy.perYear : copy.perMonth}`;
  }
  function getCreditsAmount(monthlyCreditsCost, yearly) {
    return yearly ? monthlyCreditsCost * 12 : monthlyCreditsCost;
  }
  function updateBillingLabels(yearly) {
    setText("[data-pricing-calculator-estimated-total-label]", yearly ? copy.estimatedAnnualTotal : copy.estimatedTotal);
    setText("[data-pricing-calculator-total-period]", yearly ? copy.annualTotal : copy.monthlyTotal);
    const planPriceNote = document.querySelector("[data-pricing-calculator-plan-price-note]");
    if (planPriceNote instanceof HTMLElement) {
      planPriceNote.classList.toggle("hidden", !yearly);
    }
  }
  function includePlanMode() {
    const checked = document.querySelector("[data-pricing-calculator-mode]:checked");
    return checked instanceof HTMLInputElement && checked.value === "plan";
  }
  function getSelectedPlan(usage) {
    if (!includePlanMode()) return null;
    if (!userChangedPlan || !selectedPlanId) {
      const recommended = recommendPlan(plans, usage, isYearlyBilling());
      selectedPlanId = recommended.id;
      if (planSelect instanceof HTMLSelectElement) planSelect.value = recommended.id;
      return recommended;
    }
    return plans.find((plan) => plan.id === selectedPlanId) || recommendPlan(plans, usage, isYearlyBilling());
  }
  async function fetchCreditCost(usage, plan) {
    const payload = usageToCreditPayload(usage, plan);
    const response = await fetch(`${config.apiBaseUrl}/private/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Failed to calculate credits");
    const data = await response.json();
    return data.total_cost || 0;
  }
  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }
  async function updateCalculator() {
    const mau = Number(mauInput instanceof HTMLInputElement ? mauInput.value : 0) || 0;
    const updatesByMonth = Number(updatesInput instanceof HTMLInputElement ? updatesInput.value : 0) || 0;
    const updateSizeMb = Number(sizeInput instanceof HTMLInputElement ? sizeInput.value : 0) || 0;
    const usage = deriveUsage(mau, updatesByMonth, updateSizeMb);
    const withPlan = includePlanMode();
    const plan = getSelectedPlan(usage);
    const included = plan ? getIncludedUsage(usage, plan) : { mau: 0, bandwidthGiB: 0, storageGiB: 0 };
    const overage = plan ? getOverageUsage(usage, plan) : usage;
    const billableUsage = withPlan ? overage : usage;
    if (planPanel instanceof HTMLElement) {
      planPanel.hidden = !withPlan;
    }
    if (includedLabel) {
      includedLabel.textContent = withPlan ? copy.includedInPlan : "\u2014";
    }
    const yearly = isYearlyBilling();
    updateBillingLabels(yearly);
    setText("[data-pricing-calculator-plan-label]", withPlan ? userChangedPlan ? copy.selectedPlan : copy.recommendedPlan : copy.recommendedPlan);
    if (withPlan && plan) {
      setText("[data-pricing-calculator-plan-name]", plan.name);
      setText("[data-pricing-calculator-plan-price]", formatAmountWithPeriod(getPlanMonthlyPrice(plan, yearly), false));
      const planPriceNote = document.querySelector("[data-pricing-calculator-plan-price-note]");
      if (planPriceNote) {
        planPriceNote.textContent = yearly ? `${copy.billedAnnuallyAt} $${formatPrice(getPlanBillingPrice(plan, yearly))}` : "";
      }
    } else {
      const planPriceNote = document.querySelector("[data-pricing-calculator-plan-price-note]");
      if (planPriceNote) planPriceNote.textContent = "";
    }
    setText("[data-pricing-calculator-usage-mau]", formatNumber(usage.mau));
    setText("[data-pricing-calculator-usage-bandwidth]", formatGiB(usage.bandwidthGiB));
    setText("[data-pricing-calculator-usage-storage]", formatGiB(usage.storageGiB));
    setText("[data-pricing-calculator-included-mau]", withPlan ? formatNumber(included.mau) : "\u2014");
    setText("[data-pricing-calculator-included-bandwidth]", withPlan ? formatGiB(included.bandwidthGiB) : "\u2014");
    setText("[data-pricing-calculator-included-storage]", withPlan ? formatGiB(included.storageGiB) : "\u2014");
    setText("[data-pricing-calculator-overage-mau]", formatNumber(billableUsage.mau));
    setText("[data-pricing-calculator-overage-bandwidth]", formatGiB(billableUsage.bandwidthGiB));
    setText("[data-pricing-calculator-overage-storage]", formatGiB(billableUsage.storageGiB));
    setText("[data-pricing-calculator-plan-line-value]", "...");
    setText("[data-pricing-calculator-credits-value]", "...");
    setText("[data-pricing-calculator-total-value]", "...");
    if (planLineLabel) {
      planLineLabel.textContent = withPlan ? copy.planSubscription : copy.creditsOnly;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const yearly2 = isYearlyBilling();
        const creditsCostMonthly = await fetchCreditCost(billableUsage, withPlan ? plan : null);
        const creditsCost = getCreditsAmount(creditsCostMonthly, yearly2);
        const planCost = withPlan && plan ? getPlanBillingPrice(plan, yearly2) : 0;
        setText("[data-pricing-calculator-plan-line-value]", withPlan ? formatAmountWithPeriod(planCost, yearly2) : formatAmountWithPeriod(0, yearly2));
        setText("[data-pricing-calculator-credits-value]", formatAmountWithPeriod(creditsCost, yearly2));
        if (yearly2) {
          setText("[data-pricing-calculator-total-value]", formatAmountWithPeriod(planCost + creditsCost, true));
        } else {
          const total = (withPlan && plan ? getPlanMonthlyPrice(plan, false) : 0) + creditsCostMonthly;
          setText("[data-pricing-calculator-total-value]", formatAmountWithPeriod(total, false));
        }
      } catch {
        setText("[data-pricing-calculator-credits-value]", "\u2014");
        setText("[data-pricing-calculator-total-value]", "\u2014");
      }
    }, 350);
  }
  function populatePlanSelect() {
    if (!(planSelect instanceof HTMLSelectElement)) return;
    planSelect.innerHTML = plans.map((plan) => `<option value="${plan.id}">${plan.name}</option>`).join("");
  }
  function openModal(options) {
    userChangedPlan = false;
    syncBillingFromPage();
    if (options?.creditsOnly) {
      const creditsRadio = document.querySelector('[data-pricing-calculator-mode][value="credits"]');
      if (creditsRadio instanceof HTMLInputElement) creditsRadio.checked = true;
    }
    if (!modal.open) {
      modal.showModal();
      document.body.style.overflow = "hidden";
    }
    updateCalculator();
  }
  function closeModal() {
    if (modal.open) modal.close();
  }
  populatePlanSelect();
  openButton?.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });
  openCreditsButton?.addEventListener("click", (event) => {
    event.preventDefault();
    openModal({ creditsOnly: true });
  });
  document.querySelectorAll("[data-pricing-calculator-close]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener("close", () => {
    document.body.style.overflow = "";
  });
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });
  mauInput?.addEventListener("input", updateCalculator);
  updatesInput?.addEventListener("input", updateCalculator);
  sizeInput?.addEventListener("input", updateCalculator);
  modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      userChangedPlan = false;
      updateCalculator();
    });
  });
  planSelect?.addEventListener("change", () => {
    if (planSelect instanceof HTMLSelectElement) {
      selectedPlanId = planSelect.value;
      userChangedPlan = true;
      updateCalculator();
    }
  });
  billingInputs.forEach((input) => {
    input.addEventListener("change", updateCalculator);
  });
  updateCalculator();
  if (window.location.hash === "#calculator") openModal();
  if (window.location.hash === "#calculator-credits") openModal({ creditsOnly: true });
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#calculator") openModal();
    if (window.location.hash === "#calculator-credits") openModal({ creditsOnly: true });
  });
}
export {
  setupPricingCalculator
};
