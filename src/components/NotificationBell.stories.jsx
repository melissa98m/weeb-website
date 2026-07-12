import React from "react";
import NotificationBell from "./NotificationBell";
import { NotificationContext } from "../context/NotificationContext";

/**
 * Wrapper qui injecte un NotificationContext mocké sans WebSocket.
 */
function withNotifications({ unreadCount = 0, notifications = [] } = {}) {
  const value = {
    notifications,
    unreadCount,
    markRead: () => {},
    markAllRead: async () => {},
  };
  return (Story) => (
    <NotificationContext.Provider value={value}>
      <Story />
    </NotificationContext.Provider>
  );
}

const meta = {
  title: "Components/NotificationBell",
  component: NotificationBell,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: { theme: "light" },
};

export default meta;

export const NoNotifications = {
  decorators: [withNotifications({ unreadCount: 0 })],
};

export const OneUnread = {
  decorators: [
    withNotifications({
      unreadCount: 1,
      notifications: [
        {
          id: 1,
          type: "inscription",
          message: "Vous êtes inscrit à React Avancé.",
          read: false,
          created_at: new Date().toISOString(),
        },
      ],
    }),
  ],
};

export const ManyUnread = {
  decorators: [
    withNotifications({
      unreadCount: 5,
      notifications: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        type: i % 2 === 0 ? "inscription" : "feedback",
        message: `Notification ${i + 1}`,
        read: false,
        created_at: new Date().toISOString(),
      })),
    }),
  ],
};

export const OverLimit = {
  decorators: [withNotifications({ unreadCount: 100 })],
};

export const DarkNoNotifications = {
  args: { theme: "dark" },
  decorators: [withNotifications({ unreadCount: 0 })],
};

export const DarkWithUnread = {
  args: { theme: "dark" },
  decorators: [withNotifications({ unreadCount: 3 })],
};
