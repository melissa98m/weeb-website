import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrainingsList from "./TrainingsList";

vi.mock("./TrainingItem", () => ({
  default: ({ formation }) => <div>TrainingItem {formation.name}</div>,
}));

describe("TrainingsList", () => {
  const t = {
    trainings: "Trainings",
    trainings_error: "Error",
    trainings_empty: "Empty",
  };

  it("shows loading skeletons", () => {
    const { container } = render(
      <TrainingsList
        formations={[]}
        fbMap={{}}
        loading
        error={null}
        theme="light"
        t={t}
        onGiveFeedback={vi.fn()}
      />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty state", () => {
    render(
      <TrainingsList
        formations={[]}
        fbMap={{}}
        loading={false}
        error={null}
        theme="light"
        t={t}
        onGiveFeedback={vi.fn()}
      />
    );

    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders items", () => {
    render(
      <TrainingsList
        formations={[{ id: 1, name: "React" }]}
        fbMap={{}}
        loading={false}
        error={null}
        theme="light"
        t={t}
        onGiveFeedback={vi.fn()}
      />
    );

    expect(screen.getByText("TrainingItem React")).toBeInTheDocument();
  });
});
