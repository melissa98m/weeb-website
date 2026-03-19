import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import OfflineBanner from "./OfflineBanner";

describe("OfflineBanner", () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(window.navigator, "onLine");

  function setOnLine(value) {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get: () => value,
    });
  }

  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(window.navigator, "onLine", originalOnLine);
    }
  });

  it("ne s'affiche pas quand l'utilisateur est en ligne", () => {
    setOnLine(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("s'affiche quand l'utilisateur est hors-ligne dès le montage", () => {
    setOnLine(false);
    render(<OfflineBanner />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/mode hors-ligne/i)).toBeInTheDocument();
  });

  it("apparaît quand l'événement offline est déclenché", () => {
    setOnLine(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole("alert")).toBeNull();

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("disparaît quand l'événement online est déclenché", () => {
    setOnLine(false);
    render(<OfflineBanner />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("a aria-live=assertive pour annoncer aux lecteurs d'écran", () => {
    setOnLine(false);
    render(<OfflineBanner />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("retire les écouteurs d'événements au démontage", () => {
    setOnLine(true);
    const { unmount } = render(<OfflineBanner />);
    unmount();

    // Après démontage, l'événement offline ne doit plus rien afficher
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
