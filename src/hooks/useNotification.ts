"use client";

import { useState, useCallback } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const add = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).slice(2, 11);
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        remove(id);
      }, notification.duration || 3000);
    }

    return id;
  }, [remove]);

  const success = useCallback(
    (message: string, duration?: number) => {
      return add({ type: "success", message, duration });
    },
    [add]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return add({ type: "error", message, duration });
    },
    [add]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return add({ type: "warning", message, duration });
    },
    [add]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return add({ type: "info", message, duration });
    },
    [add]
  );

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warning,
    info,
    clear,
  };
}
