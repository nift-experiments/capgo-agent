// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { getRegistrationDevice } from "./recovered/services/registration-device.js";
import { getRemoteConfig, isSupabaseConfigured, useSupabase } from "./recovered/services/supabase.js";
import Toastify from "toastify-js";
const form = document.getElementById("registerForm");
const email = document.getElementById("email");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const password = document.getElementById("password");
const submitButton = form?.querySelector('button[type="submit"]');
const configReady = getRemoteConfig();
let isSubmitting = false;
if (submitButton) {
  submitButton.disabled = true;
}
configReady.then((cfg) => {
  if (isSupabaseConfigured(cfg)) {
    if (!isSubmitting && submitButton) {
      submitButton.disabled = false;
    }
    return;
  }
  if (!isSubmitting) {
    showConfigError();
  }
}).catch(() => {
  if (!isSubmitting) {
    showConfigError();
  }
});
function showConfigError() {
  return Toastify({
    text: "Unable to load registration service. Please refresh the page and try again.",
    style: {
      background: "#e7000b"
    }
  }).showToast();
}
function getCaptchaId() {
  if (!window.turnstile) {
    return void 0;
  }
  return window.turnstile.getResponse();
}
function isValidEmail(email2) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email2);
}
function isValidName(name) {
  const nameRegex = /^[\p{L}\s'-]+$/u;
  return nameRegex.test(name) && name.trim().length > 0;
}
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isSubmitting || submitButton.disabled) return;
  if (!isValidEmail(email.value.trim())) {
    return Toastify({
      text: "Please enter a valid email address",
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  if (!isValidName(firstName.value)) {
    return Toastify({
      text: "First name can only contain letters, spaces, hyphens, and apostrophes",
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  if (!isValidName(lastName.value)) {
    return Toastify({
      text: "Last name can only contain letters, spaces, hyphens, and apostrophes",
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  isSubmitting = true;
  submitButton.disabled = true;
  const cfg = await configReady;
  if (!isSupabaseConfigured(cfg)) {
    isSubmitting = false;
    return showConfigError();
  }
  let supabase;
  try {
    supabase = useSupabase();
  } catch {
    isSubmitting = false;
    return showConfigError();
  }
  const { data: deleted, error: errorDeleted } = await supabase.rpc("is_not_deleted", { email_check: email.value });
  if (errorDeleted) {
    console.error(errorDeleted);
    isSubmitting = false;
    submitButton.disabled = false;
    return Toastify({
      text: "Unable to verify account status. Please try again.",
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  if (!deleted) {
    isSubmitting = false;
    submitButton.disabled = false;
    return Toastify({
      text: "Account is in error, please contact support at support@capgo.app",
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  const registrationDevice = getRegistrationDevice(navigator.userAgent, navigator.maxTouchPoints);
  const { data: user, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      captchaToken: getCaptchaId(),
      data: {
        first_name: firstName.value,
        last_name: lastName.value,
        ...registrationDevice
      }
    }
  });
  if (error) {
    isSubmitting = false;
    submitButton.disabled = false;
    console.error("Supabase signup error", error);
    return Toastify({
      text: error.message,
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  if (error || !user) {
    isSubmitting = false;
    submitButton.disabled = false;
    return;
  }
  const session = await supabase.auth.getSession();
  if (session.error) {
    isSubmitting = false;
    submitButton.disabled = false;
    console.error("Supabase session error", session.error);
    return Toastify({
      text: session.error.message,
      style: {
        background: "#e7000b"
      }
    }).showToast();
  }
  if (window.datafast) {
    ;
    window.datafast("signup", { email: email.value });
  }
  if (window.posthog) {
    ;
    window.posthog.capture("user_signed_up", {
      email: email.value,
      first_name: firstName.value,
      last_name: lastName.value
    });
  }
  if (window.Affonso?.signup) {
    const fullName = `${firstName.value} ${lastName.value}`.trim();
    window.Affonso.signup({
      email: email.value,
      externalUserId: user?.user?.id,
      name: fullName || void 0
    });
  }
  const consoleUrl = `https://console.capgo.app/login/?access_token=${session.data.session?.access_token}&refresh_token=${session.data.session?.refresh_token}&to=/app`;
  await new Promise((resolve) => setTimeout(resolve, 400));
  window.location.href = consoleUrl;
});
