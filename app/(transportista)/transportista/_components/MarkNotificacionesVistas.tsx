"use client";

import { useEffect } from "react";

export default function MarkNotificacionesVistas() {
  useEffect(() => {
    fetch("/api/notificaciones/mark-seen", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
