import React from "react";
import NotificationDropdown from "./NotificationDropdown";
import { NotificationContext } from "../context/NotificationContext";

const NOTIFICATIONS_SAMPLE = [
  {
    id: 1,
    type: "inscription",
    message: "Vous êtes inscrit à la formation React Avancé.",
    read: false,
    created_at: "2025-03-18T10:30:00Z",
  },
  {
    id: 2,
    type: "feedback",
    message: "Votre feedback a bien été enregistré.",
    read: true,
    created_at: "2025-03-17T14:15:00Z",
  },
  {
    id: 3,
    type: "info",
    message: "Nouvelle formation disponible : Docker & Kubernetes.",
    read: false,
    created_at: "2025-03-16T08:00:00Z",
  },
];

function withNotificationContext({ notifications = [], unreadCount = 0 } = {}) {
  const value = {
    notifications,
    unreadCount,
    markRead: () => {},
    markAllRead: async () => {},
  };
  return (Story) => (
    <NotificationContext.Provider value={value}>
      <div className="relative flex justify-end p-6">
        <Story />
      </div>
    </NotificationContext.Provider>
  );
}

const meta = {
  title: "Components/NotificationDropdown",
  component: NotificationDropdown,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    theme: "light",
    onClose: () => {},
  },
};

export default meta;

export const Empty = {
  decorators: [withNotificationContext({ notifications: [], unreadCount: 0 })],
};

export const WithNotifications = {
  decorators: [
    withNotificationContext({ notifications: NOTIFICATIONS_SAMPLE, unreadCount: 2 }),
  ],
};

export const AllRead = {
  decorators: [
    withNotificationContext({
      notifications: NOTIFICATIONS_SAMPLE.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }),
  ],
};

export const DarkTheme = {
  args: { theme: "dark" },
  decorators: [
    withNotificationContext({ notifications: NOTIFICATIONS_SAMPLE, unreadCount: 2 }),
  ],
};
