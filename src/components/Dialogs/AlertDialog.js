import React from "react";
import { useTranslation } from "react-i18next";

export default function AlertDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (open && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title || t("notification"), {
          body: message || "",
        });
        if (onConfirm) onConfirm();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title || t("notification"), {
              body: message || "",
            });
            if (onConfirm) onConfirm();
          }
        });
      }
    }
    // eslint-disable-next-line
  }, [open, title, message]);

  return null;
}
