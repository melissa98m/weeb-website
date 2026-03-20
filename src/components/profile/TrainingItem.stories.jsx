import React from "react";
import TrainingItem from "./TrainingItem";

const T_FR = {
  feedback: "Donner un avis",
  already_sent: "Avis envoyé",
  your_feedback: "Votre avis",
};

const FORMATION = { id: 1, name: "React Avancé" };

const FEEDBACK = {
  id: 10,
  feedback_content: "Formation très complète, je recommande !",
};

const meta = {
  title: "Profile/TrainingItem",
  component: TrainingItem,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    existingFeedback: { control: "object" },
  },
  args: {
    theme: "light",
    formation: FORMATION,
    existingFeedback: null,
    t: T_FR,
    onGiveFeedback: () => {},
  },
};

export default meta;

export const WithoutFeedback = {};

export const WithFeedback = {
  args: { existingFeedback: FEEDBACK },
};

export const DarkWithoutFeedback = {
  args: { theme: "dark" },
};

export const DarkWithFeedback = {
  args: { theme: "dark", existingFeedback: FEEDBACK },
};

export const LongFeedback = {
  args: {
    existingFeedback: {
      id: 11,
      feedback_content:
        "Excellente formation. J'ai beaucoup appris sur les hooks avancés, le context, et les stratégies d'optimisation des rendus avec React.memo et useMemo. Le formateur est très pédagogue.",
    },
  },
};
