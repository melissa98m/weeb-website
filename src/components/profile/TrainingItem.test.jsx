import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TrainingItem from "./TrainingItem";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TrainingItem", () => {
  const t = {
    feedback: "Give feedback",
    already_sent: "Already sent",
    your_feedback: "Your feedback",
  };

  it("calls onGiveFeedback when no feedback exists", async () => {
    const user = userEvent.setup();
    const onGiveFeedback = vi.fn();
    const formation = { id: 1, name: "React", progress_percent: 100 };

    render(
      <MemoryRouter>
        <TrainingItem
          formation={formation}
          existingFeedback={null}
          theme="light"
          t={t}
          onGiveFeedback={onGiveFeedback}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Give feedback" }));
    expect(onGiveFeedback).toHaveBeenCalledWith(formation);
  });

  it("shows existing feedback", () => {
    render(
      <MemoryRouter>
        <TrainingItem
          formation={{ id: 2, name: "Node", progress_percent: 100 }}
          existingFeedback={{ feedback_content: "Great" }}
          theme="light"
          t={t}
          onGiveFeedback={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Already sent/)).toBeInTheDocument();
    expect(screen.getByText("Your feedback")).toBeInTheDocument();
    expect(screen.getByText("Great")).toBeInTheDocument();
  });
});
