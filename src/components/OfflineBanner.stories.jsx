import React, { useEffect } from "react";
import OfflineBanner from "./OfflineBanner";

/**
 * Simule un état hors-ligne en émettant l'événement `offline` au montage
 * et en rétablissant `navigator.onLine` à true au démontage.
 */
function OfflineSimulator({ children }) {
  useEffect(() => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "onLine");
    Object.defineProperty(navigator, "onLine", {
      get: () => false,
      configurable: true,
    });
    window.dispatchEvent(new Event("offline"));
    return () => {
      if (originalDescriptor) {
        Object.defineProperty(navigator, "onLine", originalDescriptor);
      }
      window.dispatchEvent(new Event("online"));
    };
  }, []);
  return children;
}

const meta = {
  title: "Components/OfflineBanner",
  component: OfflineBanner,
  parameters: { layout: "fullscreen" },
};

export default meta;

/** Connecté — la bannière ne s'affiche pas */
export const Online = {
  render: () => (
    <div className="p-10 text-sm text-gray-500">
      (Connecté — aucune bannière visible)
      <OfflineBanner />
    </div>
  ),
};

/** Hors-ligne — la bannière est visible en bas de page */
export const Offline = {
  render: () => (
    <div style={{ minHeight: "300px", position: "relative" }}>
      <p className="p-10 text-sm text-gray-500">
        Simulation mode hors-ligne — bannière en bas de page.
      </p>
      <OfflineSimulator>
        <OfflineBanner />
      </OfflineSimulator>
    </div>
  ),
};
