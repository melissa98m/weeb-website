import { describe, it, expect } from "vitest";
import { appEnv, getEnv } from "./env";

describe("env utils", () => {
  it("returns fallback for missing key", () => {
    expect(getEnv("__MISSING__", "fallback")).toBe("fallback");
  });

  it("returns existing value when present", () => {
    expect(getEnv("MODE")).toBe(appEnv.MODE);
  });
});
