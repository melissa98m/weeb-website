import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SkeletonCard from "./SkeletonCard";

describe("SkeletonCard", () => {
  it("applies dark theme classes", () => {
    const { container } = render(<SkeletonCard theme="dark" />);

    expect(container.firstChild.className).toContain("bg-[#1c1c1c]");
    expect(container.firstChild.className).toContain("border-[#333]");
  });

  it("applies light theme classes", () => {
    const { container } = render(<SkeletonCard theme="light" />);

    expect(container.firstChild.className).toContain("bg-white");
    expect(container.firstChild.className).toContain("border-gray-200");
  });
});
