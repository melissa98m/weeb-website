import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SummaryModal from "./SummaryModal";

vi.mock("framer-motion", () => {
  const MotionDiv = React.forwardRef(function MotionDiv(props, ref) {
    return <div ref={ref} {...props} />;
  });

  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const basePost = {
  id: 42,
  title: "Hello World",
  excerpt: "Short summary for tests.",
  date: "2024-01-15",
  author: "Ada",
  cover: "https://example.com/cover.jpg",
  _genres: [{ id: 1, name: "Tech", color: "#ff0000" }],
};

const t = {
  author_label: "Author:",
  date_label: "Date:",
  genres_label: "Genres:",
  reading_time_label: "Reading:",
  minutes_label: "min",
  summary_title: "Summary",
  key_points: "Key points",
  close: "Close",
  read_more: "Read more",
};

describe("SummaryModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <SummaryModal open={false} onClose={() => {}} post={basePost} theme="light" language="en" t={t} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders content and responds to Escape", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SummaryModal open onClose={onClose} post={basePost} theme="light" language="en" t={t} />
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getAllByText(/~1 min/i).length).toBeGreaterThanOrEqual(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <SummaryModal open onClose={onClose} post={basePost} theme="light" language="en" t={t} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
