import React from "react";
import { MemoryRouter } from "react-router-dom";
import DataRights from "./DataRights";

const T_FR = {
  gdpr_title: "Vos données personnelles",
  gdpr_intro: "Conformément au RGPD, vous pouvez accéder à vos données, les exporter ou supprimer votre compte.",
  gdpr_loading: "Chargement…",
  gdpr_view: "Voir mes données",
  gdpr_download: "Télécharger (JSON)",
  gdpr_view_title: "Données personnelles",
  gdpr_data_error: "Impossible de charger vos données.",
  gdpr_download_error: "Impossible de télécharger vos données.",
  gdpr_data_empty: "Aucune donnée personnelle enregistrée.",
  gdpr_delete_title: "Supprimer mon compte",
  gdpr_delete_intro:
    "Cette action est irréversible. Toutes vos données seront supprimées définitivement.",
  gdpr_delete_check: "Je comprends que cette action est irréversible.",
  gdpr_delete_type: "Tapez DELETE pour confirmer :",
  gdpr_delete_keyword: "DELETE",
  gdpr_delete_cta: "Supprimer mon compte",
  gdpr_delete_error: "Impossible de supprimer le compte.",
  gdpr_delete_success: "Compte supprimé.",
};

const meta = {
  title: "Profile/DataRights",
  component: DataRights,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    theme: "light",
    t: T_FR,
    onSignedOut: async () => {},
  },
};

export default meta;

export const Default = {};

export const DarkTheme = {
  args: { theme: "dark" },
};
