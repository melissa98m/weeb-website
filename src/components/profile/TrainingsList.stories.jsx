import React from "react";
import TrainingsList from "./TrainingsList";

const T_FR = {
  trainings: "Mes formations",
  trainings_error: "Impossible de charger vos formations.",
  trainings_empty: "Vous n'êtes inscrit à aucune formation pour l'instant.",
  feedback: "Donner un avis",
  already_sent: "Avis envoyé",
  your_feedback: "Votre avis",
};

const FORMATIONS = [
  { id: 1, name: "React Avancé" },
  { id: 2, name: "Python Débutant" },
  { id: 3, name: "Docker & Kubernetes" },
];

const FB_MAP = {
  2: { id: 10, feedback_content: "Très bon cours pour débuter !" },
};

const meta = {
  title: "Profile/TrainingsList",
  component: TrainingsList,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    loading: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    theme: "light",
    formations: FORMATIONS,
    fbMap: FB_MAP,
    loading: false,
    error: false,
    t: T_FR,
    onGiveFeedback: () => {},
  },
};

export default meta;

export const Default = {};

export const DarkTheme = {
  args: { theme: "dark" },
};

export const Loading = {
  args: { formations: [], loading: true, error: false },
};

export const ErrorState = {
  args: { formations: [], loading: false, error: true },
};

export const Empty = {
  args: { formations: [], loading: false, error: false, fbMap: {} },
};

export const AllFeedbackSent = {
  args: {
    fbMap: {
      1: { id: 1, feedback_content: "Super !" },
      2: { id: 2, feedback_content: "Très bien." },
      3: { id: 3, feedback_content: "Parfait." },
    },
  },
};
