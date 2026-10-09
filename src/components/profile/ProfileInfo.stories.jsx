import React from "react";
import ProfileInfo from "./ProfileInfo";

const T_FR = {
  title: "Mon profil",
  username: "Nom d'utilisateur",
  email: "Adresse e-mail",
  firstName: "Prénom",
  lastName: "Nom",
};

const FULL_USER = {
  username: "melissa42",
  email: "melissa@example.com",
  first_name: "Melissa",
  last_name: "Martin",
};

const meta = {
  title: "Profile/ProfileInfo",
  component: ProfileInfo,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    theme: "light",
    t: T_FR,
    user: FULL_USER,
    onRefresh: () => {},
    onSignout: () => {},
  },
};

export default meta;

export const Default = {};

export const DarkTheme = {
  args: { theme: "dark" },
};

export const EmptyFields = {
  args: {
    user: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
    },
  },
};

export const LongEmail = {
  args: {
    user: {
      ...FULL_USER,
      email: "utilisateur.avec.un.tres.long.email@sous-domaine.example.com",
    },
  },
};
