import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "./ContactForm";
import contactEn from "../../../locales/en/contact.json";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

vi.mock("framer-motion", () => ({
  motion: {
    form: (props) => <form {...props} />,
  },
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  useTheme.mockReset();
  useLanguage.mockReset();
  fetchMock.mockReset();
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  localStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ContactForm", () => {
  it("loads subjects into the select", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "Support" }],
    });

    render(<ContactForm />);

    expect(await screen.findByRole("option", { name: "Support" })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const user = userEvent.setup();
    const nowSpy = vi.spyOn(Date, "now");
    let now = 0;
    nowSpy.mockImplementation(() => now);

    render(<ContactForm />);

    now = 3000;
    await user.click(screen.getByRole("button", { name: contactEn.contact_cta }));

    expect(await screen.findByText(contactEn.lastname_error)).toBeInTheDocument();
    expect(screen.getByText(contactEn.firstname_error)).toBeInTheDocument();
    expect(screen.getByText(contactEn.email_error)).toBeInTheDocument();
    expect(screen.getByText(contactEn.message_error)).toBeInTheDocument();
    expect(screen.getByText(contactEn.consent_error)).toBeInTheDocument();
  });

  it("submits successfully with valid data", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "Support" }],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({}),
      });

    const nowSpy = vi.spyOn(Date, "now");
    let now = 0;
    nowSpy.mockImplementation(() => now);

    const user = userEvent.setup();
    render(<ContactForm />);

    await screen.findByRole("option", { name: "Support" });

    await user.type(screen.getByLabelText(contactEn.name), "Doe");
    await user.type(screen.getByLabelText(contactEn.firstname), "Jane");
    await user.type(screen.getByLabelText(contactEn.email), " jane@example.com ");
    await user.type(screen.getByLabelText(contactEn.phone), "123456");
    await user.selectOptions(screen.getByRole("combobox"), "1");
    await user.type(screen.getByLabelText(contactEn.message), "Hello there");
    await user.click(screen.getByRole("checkbox", { name: contactEn.consent_label }));

    now = 3000;
    await user.click(screen.getByRole("button", { name: contactEn.contact_cta }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const postCall = fetchMock.mock.calls.find(([url, options]) =>
      String(url).includes("/messages/") && options?.method === "POST"
    );
    expect(postCall).toBeTruthy();

    const body = JSON.parse(postCall[1].body);
    expect(body.email).toBe("jane@example.com");
    expect(body.first_name).toBe("Jane");
    expect(body.last_name).toBe("Doe");
    expect(body.subject).toBe(1);

    expect(await screen.findByText(contactEn.sent_ok)).toBeInTheDocument();
  });
});
