import React from "react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import { StoryProviders, buildMockAuth } from "../stories/StoryProviders";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
    userType: { control: "radio", options: ["guest", "member", "admin"] },
    path: { control: "text" },
  },
  args: {
    theme: "dark",
    language: "fr",
    userType: "guest",
    path: "/",
  },
};

export default meta;

const makeUser = (userType) => {
  if (userType === "member") {
    return { id: 1, username: "yuki", email: "yuki@weeb.dev" };
  }
  if (userType === "admin") {
    return { id: 2, username: "admin", email: "admin@weeb.dev", is_staff: true };
  }
  return null;
};

export const Default = {
  render: (args) => {
    const auth = buildMockAuth({ user: makeUser(args.userType) });
    return (
      <StoryProviders theme={args.theme} language={args.language} auth={auth}>
        <MemoryRouter initialEntries={[args.path]}>
          <div className="min-h-screen bg-slate-50">
            <Header />
          </div>
        </MemoryRouter>
      </StoryProviders>
    );
  },
};
