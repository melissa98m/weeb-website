import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Profile from "./Profile";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("../components/profile/ProfileInfo", () => ({
  default: () => <div>ProfileInfo</div>,
}));
vi.mock("../components/profile/TrainingsList", () => ({
  default: () => <div>TrainingsList</div>,
}));
vi.mock("../components/FeedbackModal", () => ({
  default: () => <div>FeedbackModal</div>,
}));
vi.mock("../components/profile/DataRights", () => ({
  default: () => <div>DataRights</div>,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));
vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
});

describe("Profile page", () => {
  it("renders skeleton while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(<Profile />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders sections when user is present", () => {
    useAuth.mockReturnValue({
      user: { id: 1 },
      loading: false,
      reload: vi.fn(),
      logout: vi.fn(),
    });

    render(<Profile />);

    expect(screen.getByText("ProfileInfo")).toBeInTheDocument();
    expect(screen.getByText("TrainingsList")).toBeInTheDocument();
    expect(screen.getByText("DataRights")).toBeInTheDocument();
    expect(screen.getByText("FeedbackModal")).toBeInTheDocument();
  });
});
