const env = (() => {
  try {
    const viteEnv = import.meta.env;
    return {
      VITE_API_URL: viteEnv?.VITE_API_URL,
      VITE_SENTRY_DSN: viteEnv?.VITE_SENTRY_DSN,
      VITE_GOOGLE_CLIENT_ID: viteEnv?.VITE_GOOGLE_CLIENT_ID,
      VITE_OAUTH_GITHUB_URL: viteEnv?.VITE_OAUTH_GITHUB_URL,
      DEV: Boolean(viteEnv?.DEV),
      PROD: Boolean(viteEnv?.PROD),
      MODE: viteEnv?.MODE,
    };
  } catch {
    return {
      VITE_API_URL: undefined,
      VITE_SENTRY_DSN: undefined,
      VITE_GOOGLE_CLIENT_ID: undefined,
      VITE_OAUTH_GITHUB_URL: undefined,
      DEV: false,
      PROD: true,
      MODE: "production",
    };
  }
})();

export const appEnv = env;

export function getEnv(key, fallback) {
  const value = env?.[key];
  return value ?? fallback;
}
