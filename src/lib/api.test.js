import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthApi, ensureCsrf, getApiErrorMessage, getApiRetryAfter, mapApiFieldErrors } from "./api";

function clearCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

describe("api csrf", () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchSpy);
    clearCookie("csrftoken");
  });

  afterEach(() => {
    delete window.Cypress;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns existing csrftoken without fetching", async () => {
    document.cookie = "csrftoken=abc; Path=/";

    const token = await ensureCsrf();

    expect(token).toBe("abc");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns test token in Cypress mode and sets cookie", async () => {
    window.Cypress = true;

    const token = await ensureCsrf();

    expect(token).toBe("testtoken");
    expect(document.cookie).toContain("csrftoken=testtoken");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("normalizes backend auth errors into a stable client error", async () => {
    window.Cypress = true;
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({
        "content-type": "application/json",
        "x-request-id": "req_12345678",
      }),
      json: async () => ({
        detail: "too many login attempts",
        code: "login_locked",
        retry_after: 12,
      }),
    });

    await expect(
      AuthApi.login({ login: "user@example.com", password: "wrong" })
    ).rejects.toMatchObject({
      name: "ApiClientError",
      status: 429,
      code: "login_locked",
      requestId: "req_12345678",
      retryAfter: 12,
    });
  });
});

describe("api error helpers", () => {
  it("maps field and global messages from the normalized error payload", () => {
    const error = {
      details: {
        detail: "validation error",
        errors: {
          email: ["Email already taken."],
          password: ["Too weak."],
        },
      },
    };

    expect(mapApiFieldErrors(error, { email: "email", password: "password" })).toEqual({
      email: "Email already taken.",
      password: "Too weak.",
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("validation error");
  });

  it("reads retry_after from normalized error payload", () => {
    expect(getApiRetryAfter({ details: { retry_after: 9 } })).toBe(9);
    expect(getApiRetryAfter({ details: {} })).toBeNull();
  });
});
