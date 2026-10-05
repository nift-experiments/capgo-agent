// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { parse, canParse, compare } from "@std/semver";
const strategyDescriptions = {
  major: "Major: blocks target major greater than version_build. Allows 1.2.3 -> 1.9.0, blocks 1.2.3 -> 2.0.0.",
  minor: "Minor: target must keep the same major and minor as version_build. Allows 1.2.3 -> 1.2.4, blocks 1.2.3 -> 1.3.0.",
  patch: "Patch: target must keep the exact same MAJOR.MINOR.PATCH as version_build. Only suffix changes are allowed, like 1.0.0-beta.1 -> 1.0.0-beta.2 or 1.0.0+build.1 -> 1.0.0+build.2. Blocks 1.0.0 -> 1.0.1.",
  metadata: "Metadata: target bundle must define min_update_version, and version_build must be greater than or equal to it.",
  none: "None: channel semver policy does not block updates. Downgrade protection and platform settings can still block them."
};
function validateVersion(version) {
  if (!version.trim()) {
    return { valid: false, error: "Version cannot be empty" };
  }
  if (version.startsWith("v") || version.startsWith("V")) {
    return { valid: false, error: 'Leading "v" is not allowed in semantic versions' };
  }
  try {
    const isValid = canParse(version);
    if (isValid) {
      return { valid: true };
    } else {
      return { valid: false, error: "Invalid semantic version format" };
    }
  } catch (error) {
    return { valid: false, error: "Invalid semantic version format" };
  }
}
function updateVersionStatus(inputId, statusId) {
  const input = document.getElementById(inputId);
  const status = document.getElementById(statusId);
  if (!input || !status) return;
  const version = input.value.trim();
  if (!version) {
    status.textContent = "";
    input.className = "py-2 px-3 w-full font-mono text-lg rounded-md border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-gray-500 focus:outline-none";
    return;
  }
  const validation = validateVersion(version);
  if (validation.valid) {
    status.textContent = "\u2713 Valid";
    status.className = "mt-1 text-sm text-green-600";
    input.className = "py-2 px-3 w-full font-mono text-lg rounded-md border border-green-500 focus:border-transparent focus:ring-2 focus:ring-gray-500 focus:outline-none";
  } else {
    status.textContent = `\u2717 ${validation.error || "Invalid semantic version format"}`;
    status.className = "mt-1 text-sm text-red-600";
    input.className = "py-2 px-3 w-full font-mono text-lg rounded-md border border-red-500 focus:border-transparent focus:ring-2 focus:ring-gray-500 focus:outline-none";
  }
}
function compareVersions() {
  const version1 = document.getElementById("version1").value.trim();
  const version2 = document.getElementById("version2").value.trim();
  if (!version1 || !version2) return;
  const valid1 = validateVersion(version1);
  const valid2 = validateVersion(version2);
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;
  if (!valid1.valid || !valid2.valid) {
    resultsDiv.innerHTML = `
          <div class="py-4 text-center text-red-500">
            Both versions must be valid to compare
          </div>
        `;
    return;
  }
  try {
    const comparison = compare(parse(version1), parse(version2));
    const updateStrategy = document.getElementById("update-strategy").value;
    const disableDowngrade = document.getElementById("disable-downgrade-toggle").getAttribute("aria-checked") === "true";
    let resultIcon = "";
    let resultText = "";
    let resultColor = "";
    let updateInfo = "";
    let canUpdate = false;
    if (version1 === version2) {
      resultIcon = "=";
      resultText = "Version strings are equal";
      resultColor = "text-gray-600";
      updateInfo = "No version jump";
      canUpdate = false;
    } else if (comparison === 0) {
      resultIcon = "=";
      resultText = "Versions have equal semver precedence";
      resultColor = "text-blue-600";
      canUpdate = checkUpdateAllowed(version1, version2, updateStrategy) && checkPlatformCompatibility();
      updateInfo = canUpdate ? "Channel policy allows this version core" : getBlockReason(version1, version2, updateStrategy);
    } else {
      const isUpgrade = comparison < 0;
      if (isUpgrade) {
        resultIcon = "<";
        resultText = `${version1} is older than ${version2}`;
        resultColor = "text-blue-600";
        canUpdate = checkUpdateAllowed(version1, version2, updateStrategy) && checkPlatformCompatibility();
      } else {
        resultIcon = ">";
        resultText = `${version1} is newer than ${version2}`;
        resultColor = "text-orange-600";
        if (disableDowngrade) {
          canUpdate = false;
          updateInfo = "Downgrade blocked by channel settings";
        } else {
          canUpdate = checkUpdateAllowed(version1, version2, updateStrategy) && checkPlatformCompatibility();
        }
      }
      if (canUpdate && !updateInfo) {
        updateInfo = isUpgrade ? "Update would be applied" : "Downgrade would be applied";
      } else if (!canUpdate && !updateInfo) {
        const blockReason = getBlockReason(version1, version2, updateStrategy);
        updateInfo = blockReason;
      }
    }
    const statusColor = canUpdate ? "text-green-600" : "text-red-600";
    const statusIcon = canUpdate ? "\u2713" : "\u2717";
    const downgradeStatus = disableDowngrade ? "ON" : "OFF";
    resultsDiv.innerHTML = `
          <div class="text-center">
            <div class="text-6xl font-bold ${resultColor} mb-4">${resultIcon}</div>
            <div class="text-xl font-semibold ${resultColor} mb-2">${resultText}</div>
            <div class="text-sm ${statusColor} mb-2">${statusIcon} ${updateInfo}</div>
            <div class="text-xs text-gray-500">Strategy: ${updateStrategy} | Downgrade protection: ${downgradeStatus}</div>
          </div>
        `;
  } catch (error) {
    resultsDiv.innerHTML = `
          <div class="py-4 text-center text-red-500">
            Error comparing versions
          </div>
        `;
  }
}
function checkUpdateAllowed(local, remote, strategy) {
  if (strategy === "none") return true;
  try {
    const localParsed = parse(local);
    const remoteParsed = parse(remote);
    switch (strategy) {
      case "major":
        return remoteParsed.major <= localParsed.major;
      case "minor":
        return localParsed.major === remoteParsed.major && localParsed.minor === remoteParsed.minor;
      case "patch":
        return localParsed.major === remoteParsed.major && localParsed.minor === remoteParsed.minor && localParsed.patch === remoteParsed.patch;
      case "metadata":
        const metadataInput = document.getElementById("metadata-value");
        const metadataValue = metadataInput?.value.trim();
        if (!metadataValue || !canParse(metadataValue)) {
          return false;
        }
        const comparison = compare(localParsed, parse(metadataValue));
        return comparison >= 0;
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}
function getBlockReason(local, remote, strategy) {
  try {
    const platformReason = getPlatformBlockReason();
    if (platformReason) return platformReason;
    const localParsed = parse(local);
    const remoteParsed = parse(remote);
    switch (strategy) {
      case "major":
        if (remoteParsed.major > localParsed.major) {
          return "Higher major version blocked by major strategy";
        }
        break;
      case "minor":
        if (localParsed.major !== remoteParsed.major) {
          return "Major version change blocked by minor strategy";
        }
        if (localParsed.minor !== remoteParsed.minor) {
          return "Minor version change blocked by minor strategy";
        }
        break;
      case "patch":
        if (localParsed.major !== remoteParsed.major) {
          return "Major version change blocked by patch strategy";
        }
        if (localParsed.minor !== remoteParsed.minor) {
          return "Minor version change blocked by patch strategy";
        }
        if (localParsed.patch !== remoteParsed.patch) {
          return "Patch version change blocked by patch strategy";
        }
        break;
      case "metadata":
        const metadataInput = document.getElementById("metadata-value");
        const metadataValue = metadataInput?.value.trim();
        if (!metadataValue || !canParse(metadataValue)) {
          return "Invalid metadata value";
        }
        const comparison = compare(localParsed, parse(metadataValue));
        if (comparison < 0) {
          return `Native baseline ${local} below minimum metadata requirement ${metadataValue}`;
        }
        break;
    }
    return `Update blocked by ${strategy} strategy`;
  } catch (error) {
    return "Error checking update rules";
  }
}
function checkPlatformCompatibility() {
  const platform = document.getElementById("platform-select").value;
  const isDevBuild = document.getElementById("is-dev-build").checked;
  const isEmulator = document.getElementById("is-emulator").checked;
  const iosEnabled = document.getElementById("ios-toggle").getAttribute("aria-checked") === "true";
  const androidEnabled = document.getElementById("android-toggle").getAttribute("aria-checked") === "true";
  const devBuildAllowed = document.getElementById("dev-build-toggle").getAttribute("aria-checked") === "true";
  const emulatorAllowed = document.getElementById("emulator-toggle").getAttribute("aria-checked") === "true";
  if (platform === "ios" && !iosEnabled) return false;
  if (platform === "android" && !androidEnabled) return false;
  if (isDevBuild && !devBuildAllowed) return false;
  if (isEmulator && !emulatorAllowed) return false;
  return true;
}
function getPlatformBlockReason() {
  const platform = document.getElementById("platform-select").value;
  const isDevBuild = document.getElementById("is-dev-build").checked;
  const isEmulator = document.getElementById("is-emulator").checked;
  const iosEnabled = document.getElementById("ios-toggle").getAttribute("aria-checked") === "true";
  const androidEnabled = document.getElementById("android-toggle").getAttribute("aria-checked") === "true";
  const devBuildAllowed = document.getElementById("dev-build-toggle").getAttribute("aria-checked") === "true";
  const emulatorAllowed = document.getElementById("emulator-toggle").getAttribute("aria-checked") === "true";
  if (platform === "ios" && !iosEnabled) return "iOS updates disabled in channel settings";
  if (platform === "android" && !androidEnabled) return "Android updates disabled in channel settings";
  if (isDevBuild && !devBuildAllowed) return "Development build updates disabled in channel settings";
  if (isEmulator && !emulatorAllowed) return "Emulator updates disabled in channel settings";
  return null;
}
function updateStrategyHelp() {
  const strategy = document.getElementById("update-strategy").value;
  const help = document.getElementById("strategy-help");
  if (help) help.textContent = strategyDescriptions[strategy] || "";
}
function toggleMetadataInput() {
  const strategy = document.getElementById("update-strategy").value;
  const metadataContainer = document.getElementById("metadata-input-container");
  updateStrategyHelp();
  if (strategy === "metadata") {
    metadataContainer.classList.remove("hidden");
  } else {
    metadataContainer.classList.add("hidden");
  }
}
function toggleSwitch(toggleId) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return;
  const isEnabled = toggle.getAttribute("aria-checked") === "true";
  const newState = !isEnabled;
  toggle.setAttribute("aria-checked", newState.toString());
  if (newState) {
    toggle.classList.add("bg-gray-900");
    toggle.classList.remove("bg-gray-200");
    toggle.querySelector("span")?.classList.add("translate-x-5");
    toggle.querySelector("span")?.classList.remove("translate-x-0");
  } else {
    toggle.classList.remove("bg-gray-900");
    toggle.classList.add("bg-gray-200");
    toggle.querySelector("span")?.classList.remove("translate-x-5");
    toggle.querySelector("span")?.classList.add("translate-x-0");
  }
  compareVersions();
}
function toggleAdvancedSettings() {
  const panel = document.getElementById("advanced-panel");
  const chevron = document.getElementById("advanced-chevron");
  if (!panel || !chevron) return;
  const isHidden = panel.classList.contains("hidden");
  if (isHidden) {
    panel.classList.remove("hidden");
    chevron.classList.add("rotate-180");
  } else {
    panel.classList.add("hidden");
    chevron.classList.remove("rotate-180");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const inputs = ["version1", "version2"];
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        updateVersionStatus(id, `${id}-status`);
        compareVersions();
      });
    }
  });
  const advancedToggle = document.getElementById("advanced-toggle");
  if (advancedToggle) {
    advancedToggle.addEventListener("click", toggleAdvancedSettings);
  }
  const strategySelect = document.getElementById("update-strategy");
  if (strategySelect) {
    strategySelect.addEventListener("change", () => {
      toggleMetadataInput();
      compareVersions();
    });
  }
  const metadataInput = document.getElementById("metadata-value");
  if (metadataInput) {
    metadataInput.addEventListener("input", compareVersions);
  }
  const toggleIds = ["ios-toggle", "android-toggle", "dev-build-toggle", "emulator-toggle", "disable-downgrade-toggle"];
  toggleIds.forEach((toggleId) => {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener("click", () => toggleSwitch(toggleId));
    }
  });
  const platformSelect = document.getElementById("platform-select");
  if (platformSelect) {
    platformSelect.addEventListener("change", compareVersions);
  }
  const isDevBuild = document.getElementById("is-dev-build");
  if (isDevBuild) {
    isDevBuild.addEventListener("change", compareVersions);
  }
  const isEmulator = document.getElementById("is-emulator");
  if (isEmulator) {
    isEmulator.addEventListener("change", compareVersions);
  }
  toggleMetadataInput();
});
