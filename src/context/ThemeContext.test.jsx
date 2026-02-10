import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./ThemeContext";

function Consumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
  });

  it("uses localStorage value when present", () => {
    localStorage.setItem("theme", "light");

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("toggles theme and updates html classes", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("persists theme to localStorage", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("throws when used outside provider", () => {
    function Bad() {
      useTheme();
      return null;
    }

    expect(() => render(<Bad />)).toThrow(/useTheme must be used within <ThemeProvider>/);
  });
});
