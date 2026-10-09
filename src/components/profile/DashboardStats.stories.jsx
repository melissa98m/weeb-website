import React from "react";
import DashboardStats from "./DashboardStats";

const SAMPLE_DATA = {
  formations_inscrites: 4,
  feedbacks_laisses: 2,
  articles_lus: 11,
  historique_formations: [
    {
      id: 1,
      name: "React Avancé",
      description: "Composants, hooks, performance",
      inscrit_le: "2025-03-10T09:00:00Z",
    },
    {
      id: 2,
      name: "Python Débutant",
      description: "",
      inscrit_le: "2025-01-20T14:00:00Z",
    },
    {
      id: 3,
      name: "Docker & Kubernetes",
      description: "Conteneurisation et orchestration",
      inscrit_le: "2024-11-05T08:30:00Z",
    },
  ],
};

const meta = {
  title: "Profile/DashboardStats",
  component: DashboardStats,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    loading: { control: "boolean" },
    error: { control: "text" },
  },
  args: {
    theme: "light",
    loading: false,
    error: null,
    data: SAMPLE_DATA,
  },
};

export default meta;

export const Default = {};

export const DarkTheme = {
  args: { theme: "dark" },
};

export const Loading = {
  args: { data: null, loading: true, error: null },
};

export const Error = {
  args: { data: null, loading: false, error: "Erreur réseau" },
};

export const EmptyHistory = {
  args: {
    data: { ...SAMPLE_DATA, historique_formations: [] },
  },
};

export const NullValues = {
  args: {
    data: {
      formations_inscrites: null,
      feedbacks_laisses: 0,
      articles_lus: null,
      historique_formations: [],
    },
  },
};
