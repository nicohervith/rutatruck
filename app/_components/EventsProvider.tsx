"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLiveStream } from "./useLiveStream";
import { useRouter } from "next/navigation";

type EventsState = {
  notifCount: number;
  privCount: number;
  hash: string;
  perfilIncompleto: boolean;
  mensajesNoLeidos: number;
  otroRolPendiente: number;
  /** Cosas que exigen una acción y no se limpian mirándolas (cargas EN_CONFIRMACION). */
  accionesPendientes: number;
};

const EventsContext = createContext<EventsState>({
  notifCount: 0,
  privCount: 0,
  hash: "",
  perfilIncompleto: false,
  mensajesNoLeidos: 0,
  otroRolPendiente: 0,
  accionesPendientes: 0,
});

export function useNotifCount() {
  return useContext(EventsContext).notifCount;
}

export function usePrivCount() {
  return useContext(EventsContext).privCount;
}

export function usePerfilIncompleto() {
  return useContext(EventsContext).perfilIncompleto;
}

export function useMensajesNoLeidos() {
  return useContext(EventsContext).mensajesNoLeidos;
}

/** Pendientes del otro lado (empresa/transportista) para cuentas duales — usado en el badge del switcher. */
export function useOtroRolPendiente() {
  return useContext(EventsContext).otroRolPendiente;
}

/** Acciones pendientes del lado empresa: se limpian actuando, no mirando. */
export function useAccionesPendientes() {
  return useContext(EventsContext).accionesPendientes;
}

export function EventsProvider({
  children,
  vista,
}: {
  children: React.ReactNode;
  vista: "empresa" | "transportista";
}) {
  const router = useRouter();
  const [state, setState] = useState<EventsState>({
    notifCount: 0,
    privCount: 0,
    hash: "",
    perfilIncompleto: false,
    mensajesNoLeidos: 0,
    otroRolPendiente: 0,
    accionesPendientes: 0,
  });
  const hashRef = useRef<string | null>(null);

  useLiveStream(
    vista,
    () => `/api/events?vista=${vista}`,
    (es) => {
      es.addEventListener("update", (e: MessageEvent) => {
        const payload = JSON.parse(e.data) as {
          count?: number;
          privCount?: number;
          hash?: string;
          perfilIncompleto?: boolean;
          mensajesNoLeidos?: number;
          otroRolPendiente?: number;
          accionesPendientes?: number;
        };

        setState((prev) => ({
          notifCount: payload.count ?? prev.notifCount,
          privCount: payload.privCount ?? prev.privCount,
          hash: payload.hash ?? prev.hash,
          perfilIncompleto: payload.perfilIncompleto ?? prev.perfilIncompleto,
          mensajesNoLeidos: payload.mensajesNoLeidos ?? prev.mensajesNoLeidos,
          otroRolPendiente: payload.otroRolPendiente ?? prev.otroRolPendiente,
          accionesPendientes: payload.accionesPendientes ?? prev.accionesPendientes,
        }));

        if (payload.hash !== undefined) {
          if (hashRef.current !== null && hashRef.current !== payload.hash) {
            router.refresh();
          }
          hashRef.current = payload.hash;
        }
      });
    },
  );

  // Numerito sobre el ícono de la app. En la TWA de Android es la señal de
  // "tenés algo pendiente" que se ve sin abrir nada. No está en todos los
  // navegadores y puede tirar si el origen no tiene permiso, de ahí el guard.
  const pendientes =
    state.notifCount + state.privCount + state.mensajesNoLeidos + state.accionesPendientes;
  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;
    const nav = navigator as Navigator & {
      setAppBadge: (n?: number) => Promise<void>;
      clearAppBadge: () => Promise<void>;
    };
    const accion = pendientes > 0 ? nav.setAppBadge(pendientes) : nav.clearAppBadge();
    accion.catch(() => {});
  }, [pendientes]);

  return (
    <EventsContext.Provider value={state}>
      {children}
    </EventsContext.Provider>
  );
}
