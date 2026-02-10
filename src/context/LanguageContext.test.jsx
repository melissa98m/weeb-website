import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "./LanguageContext";

function Consumer() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <button type="button" onClick={toggleLanguage}>
        toggle
      </button>
    </div>
  );
}

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("lang");
    delete document.documentElement.dataset.lang;
  });

  it("uses localStorage value when present", () => {
    localStorage.setItem("language", "en");

    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("toggles language and updates html attributes", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>
    );

    expect(document.documentElement.getAttribute("lang")).toBe("fr");

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.documentElement.dataset.lang).toBe("en");
  });

  it("persists language to localStorage", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(localStorage.getItem("language")).toBe("en");
  });

  it("throws when used outside provider", () => {
    function Bad() {
      useLanguage();
      return null;
    }

    expect(() => render(<Bad />)).toThrow(/useLanguage must be used within <LanguageProvider>/);
  });
});
