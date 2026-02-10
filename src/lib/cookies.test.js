import { describe, it, expect, beforeEach } from "vitest";
import { getCookie, setCookie, deleteCookie } from "./cookies";

function clearCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

describe("cookies utils", () => {
  beforeEach(() => {
    clearCookie("test");
  });

  it("sets and gets cookies with decoding", () => {
    setCookie("test", "hello world", 60);
    expect(getCookie("test")).toBe("hello world");
  });

  it("returns null when cookie missing", () => {
    expect(getCookie("missing")).toBe(null);
  });

  it("deletes cookie", () => {
    setCookie("test", "value", 60);
    deleteCookie("test");
    expect(getCookie("test")).toBe(null);
  });
});
