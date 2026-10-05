// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import Bowser from "bowser";
function getRegistrationDevice(userAgent, maxTouchPoints) {
  const parsed = Bowser.parse(userAgent);
  const isIPadOS = /iPad/.test(userAgent) || /Macintosh/.test(userAgent) && maxTouchPoints > 1;
  return {
    registration_device_type: isIPadOS ? "tablet" : parsed.platform.type ?? "unknown",
    registration_os: isIPadOS ? "iPadOS" : parsed.os.name ?? "unknown",
    registration_browser: parsed.browser.name ?? "unknown"
  };
}
export {
  getRegistrationDevice
};
