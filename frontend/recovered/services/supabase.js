// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { useRuntimeConfig } from "../../runtime-config.js";
import { createClient } from "@supabase/supabase-js";
let supaClient = null;
function parseSupabaseProjectId(supaHost) {
  if (!supaHost) return "";
  return supaHost.split("//")[1]?.split(".")[0]?.split(":")[0] || "";
}
function isSupabaseConfigured(config2) {
  return Boolean(config2.supaHost?.trim() && config2.supaKey?.trim());
}
const getLocalConfig = () => {
  const supaHost = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
  const supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
  return {
    supaHost,
    supaKey,
    supbaseId: parseSupabaseProjectId(supaHost)
  };
};
let config = getLocalConfig();
const remoteConfigTimeoutMs = 1e4;
async function getRemoteConfig() {
  const runtimeConfig = useRuntimeConfig();
  const localConfig = getLocalConfig();
  try {
    const res = await fetch(`${runtimeConfig.public.baseApiUrl}/private/config`, {
      signal: AbortSignal.timeout(remoteConfigTimeoutMs)
    });
    if (!res.ok) throw new Error("Failed to fetch config");
    const remoteConfig = await res.json();
    config = { ...localConfig, ...remoteConfig };
  } catch {
    console.log("Local config", localConfig);
    config = localConfig;
  }
  return config;
}
function useSupabase() {
  if (!isSupabaseConfigured(config)) {
    throw new Error("Supabase is not configured");
  }
  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  };
  if (supaClient) return supaClient;
  supaClient = createClient(config.supaHost, config.supaKey, options);
  return supaClient;
}
export {
  getRemoteConfig,
  isSupabaseConfigured,
  parseSupabaseProjectId,
  useSupabase
};
