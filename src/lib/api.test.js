import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ensureCsrf } from "./api";

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
});
