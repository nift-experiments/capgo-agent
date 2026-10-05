// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { setupPricingCalculator } from "./recovered/components/pricing/pricing-calculator.client.js";
function initPricingCalculator() {
  const config = window.__pricingCalculatorConfig;
  if (config) setupPricingCalculator({...config,apiBaseUrl:import.meta.env.PUBLIC_BASE_API_URL || config.apiBaseUrl});
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPricingCalculator);
} else {
  initPricingCalculator();
}
