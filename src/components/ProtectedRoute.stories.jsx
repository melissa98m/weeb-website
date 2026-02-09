import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { StoryProviders, buildMockAuth } from "../stories/StoryProviders";

const meta = {
  title: "Components/ProtectedRoute",
  component: ProtectedRoute,
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
    loggedIn: { control: "boolean" },
  },
  args: {
    theme: "dark",
    language: "fr",
    loggedIn: true,
  },
};

export default meta;

const PrivateContent = () => (
  <div className="p-6 text-sm text-white bg-emerald-600 rounded-lg">
    Contenu prive accessible
  </div>
);

const LoginPage = () => (
  <div className="p-6 text-sm text-white bg-slate-800 rounded-lg">
    Redirection vers /login
  </div>
);

export const Preview = {
  render: (args) => {
    const user = args.loggedIn ? { id: 1, username: "member" } : null;
    const auth = buildMockAuth({ user, loading: false });
    return (
      <StoryProviders theme={args.theme} language={args.language} auth={auth}>
        <MemoryRouter initialEntries={["/"]}>
          <div className="min-h-screen p-6 bg-slate-50">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <PrivateContent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </MemoryRouter>
      </StoryProviders>
    );
  },
};
