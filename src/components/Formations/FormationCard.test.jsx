import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormationCard from "./FormationCard";

const formation = { name: "React Basics", description: "Learn React" };

describe("FormationCard", () => {
  it("renders details and triggers onView", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();

    render(<FormationCard f={formation} theme="light" onView={onView} />);

    expect(screen.getByText("React Basics")).toBeInTheDocument();
    expect(screen.getByText("Learn React")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /voir les détails de la formation/i }));
    expect(onView).toHaveBeenCalledWith(formation);
  });
});
