import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("oauth providers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("./env");
  });

  it("returns no provider when oauth env vars are missing", async () => {
    vi.doMock("./env", () => ({
      appEnv: {
        VITE_API_URL: undefined,
        VITE_OAUTH_GITHUB_URL: undefined,
        DEV: false,
      },
    }));

    const { getEnabledOAuthProviders } = await import("./api");
    expect(getEnabledOAuthProviders()).toEqual([]);
  });

  it("returns configured providers with trimmed urls", async () => {
    vi.doMock("./env", () => ({
      appEnv: {
        VITE_API_URL: "https://api.example.com/api",
        VITE_OAUTH_GITHUB_URL: "https://api.example.com/api/auth/oauth/github/",
        DEV: false,
      },
    }));

    const { getEnabledOAuthProviders } = await import("./api");
    expect(getEnabledOAuthProviders()).toEqual([
      {
        id: "github",
        label: "GitHub",
        url: "https://api.example.com/api/auth/oauth/github/",
      },
    ]);
  });
});
