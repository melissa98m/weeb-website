import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DataRights from "./DataRights";
import { AuthApi } from "../../lib/api";
import { useNavigate } from "react-router-dom";

vi.mock("../../lib/api", () => ({
  AuthApi: {
    data: vi.fn(),
    exportData: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: vi.fn() };
});

const t = {
  gdpr_title: "GDPR",
  gdpr_intro: "Intro",
  gdpr_loading: "Loading",
  gdpr_view: "View data",
  gdpr_download: "Download",
  gdpr_data_error: "Data error",
  gdpr_download_error: "Download error",
  gdpr_view_title: "Your data",
  gdpr_data_empty: "No data",
  gdpr_delete_title: "Delete account",
  gdpr_delete_intro: "Delete intro",
  gdpr_delete_check: "I understand",
  gdpr_delete_type: "Type keyword",
  gdpr_delete_cta: "Delete",
  gdpr_delete_error: "Delete error",
  gdpr_delete_success: "Deleted",
  gdpr_delete_keyword: "DELETE",
};

describe("DataRights", () => {
  beforeEach(() => {
    AuthApi.data.mockReset();
    AuthApi.exportData.mockReset();
    AuthApi.deleteAccount.mockReset();
    useNavigate.mockReturnValue(vi.fn());
  });

  it("loads data payload", async () => {
    const user = userEvent.setup();
    AuthApi.data.mockResolvedValue({ hello: "world" });

    render(<DataRights theme="light" t={t} onSignedOut={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "View data" }));
    expect(await screen.findByText(/"hello": "world"/)).toBeInTheDocument();
  });

  it("enables delete when keyword matches", async () => {
    const user = userEvent.setup();
    render(<DataRights theme="light" t={t} onSignedOut={vi.fn()} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    expect(deleteBtn).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "I understand" }));
    await user.type(screen.getByLabelText("Type keyword"), "DELETE");

    expect(deleteBtn).toBeEnabled();
  });
});
