import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Footer from "./Footer";
import footerEn from "../../locales/en/footer.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { NewsletterApi } from "../lib/api";

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  NewsletterApi: {
    subscribe: vi.fn(),
  },
}));

beforeEach(() => {
  useTheme.mockReset();
  useLanguage.mockReset();
  NewsletterApi.subscribe.mockReset();
  useTheme.mockReturnValue({ theme: "dark" });
  useLanguage.mockReturnValue({ language: "en" });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer", () => {
  it("disables submit until consent is checked", async () => {
    const user = userEvent.setup();
    render(<Footer />);

    const submit = screen.getByRole("button", { name: footerEn.newsletter_cta });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(footerEn.newsletter_placeholder), "hello@example.com");
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: footerEn.newsletter_consent }));
    expect(submit).toBeEnabled();
  });

  it("submits newsletter and shows success state", async () => {
    const user = userEvent.setup();

    NewsletterApi.subscribe.mockResolvedValue({ ok: true });

    render(<Footer />);

    await user.type(screen.getByLabelText(footerEn.newsletter_placeholder), " test@example.com ");
    await user.click(screen.getByRole("checkbox", { name: footerEn.newsletter_consent }));
    await user.click(screen.getByRole("button", { name: footerEn.newsletter_cta }));

    await waitFor(() => {
      expect(NewsletterApi.subscribe).toHaveBeenCalledTimes(1);
    });

    const payload = NewsletterApi.subscribe.mock.calls[0][0];
    expect(payload.email).toBe("test@example.com");
    expect(payload.consent).toBe(true);
    expect(typeof payload.consented_at).toBe("string");

    expect(await screen.findByText(footerEn.newsletter_success)).toBeInTheDocument();
  });
});
