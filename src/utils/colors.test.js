import { describe, it, expect } from "vitest";
import { hexToRgba, safeChipStyle } from "./colors";

describe("colors utils", () => {
  it("converts valid hex to rgba", () => {
    expect(hexToRgba("#ff8800", 0.5)).toBe("rgba(255, 136, 0, 0.5)");
  });

  it("falls back to white rgba on invalid hex", () => {
    expect(hexToRgba("invalid", 0.2)).toBe("rgba(255,255,255,0.2)");
  });

  it("builds safe chip style for valid hex in dark theme", () => {
    const style = safeChipStyle("#336699", "dark");
    expect(style).toEqual({
      backgroundColor: "rgba(51, 102, 153, 0.2)",
      borderColor: "#336699",
      color: "#f9fafb",
    });
  });

  it("builds safe chip style fallback for invalid color", () => {
    const style = safeChipStyle("bad", "light");
    expect(style).toEqual({
      backgroundColor: "transparent",
      borderColor: "#e5e7eb",
      color: "#111827",
    });
  });
});
