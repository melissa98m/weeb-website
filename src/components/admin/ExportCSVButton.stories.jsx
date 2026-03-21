import React from "react";
import ExportCSVButton from "./ExportCSVButton";

const meta = {
  title: "Admin/ExportCSVButton",
  component: ExportCSVButton,
  argTypes: {
    type: {
      control: "select",
      options: ["registrations", "feedbacks", "messages"],
    },
    dateFrom: { control: "text" },
    dateTo: { control: "text" },
    label: { control: "text" },
  },
  args: {
    type: "registrations",
    dateFrom: "",
    dateTo: "",
    label: undefined,
    className: "border-gray-300 text-gray-700 hover:bg-gray-50",
  },
};

export default meta;

export const Registrations = {
  args: { type: "registrations" },
};

export const Feedbacks = {
  args: { type: "feedbacks" },
};

export const Messages = {
  args: { type: "messages" },
};

export const CustomLabel = {
  args: { type: "registrations", label: "Télécharger les registrations" },
};

export const WithDateRange = {
  args: {
    type: "feedbacks",
    dateFrom: "2025-01-01",
    dateTo: "2025-03-31",
  },
};

export const DarkStyle = {
  args: {
    type: "messages",
    className: "border-[#444] text-white bg-[#1c1c1c] hover:bg-[#2a2a2a]",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
