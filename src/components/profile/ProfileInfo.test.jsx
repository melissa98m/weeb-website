import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileInfo from "./ProfileInfo";

describe("ProfileInfo", () => {
  it("renders user fields", () => {
    const t = {
      title: "Profile",
      username: "Username",
      email: "Email",
      firstName: "First name",
      lastName: "Last name",
    };

    render(
      <ProfileInfo
        user={{ username: "ada", email: "ada@example.com", first_name: "Ada", last_name: "Lovelace" }}
        t={t}
        theme="light"
      />
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("ada")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Lovelace")).toBeInTheDocument();
  });
});
