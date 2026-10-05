// Native browser configuration. Keep public values here; never place server secrets in browser assets.
// Defaults reproduce pinned Capgo's public production endpoints.
const overrides = import.meta.env;
export function useRuntimeConfig() {
  return {public:{brand:'Capgo',baseUrl:overrides.PUBLIC_BASE_URL || 'https://capgo.app',baseApiUrl:overrides.PUBLIC_BASE_API_URL || 'https://api.capgo.app'}};
}
