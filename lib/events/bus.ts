import { EventEmitter } from "node:events";
import type { Events } from "./types";

/**
 * Atado a globalThis a propósito: instrumentation.ts registra los listeners
 * vía import() dinámico mientras que los servicios importan `emit` de forma
 * estática. Si el bundler los separa en chunks distintos, cada uno puede
 * terminar con su propia instancia de este módulo — on() y emit() apuntando
 * a EventEmitters diferentes, sin que ninguno tire error. globalThis
 * garantiza una única instancia real sin importar cómo se resuelvan los chunks.
 */
const g = globalThis as unknown as {
  __eventBus?: EventEmitter;
  __eventBusRegistrados?: Set<string>;
};
const emitter = g.__eventBus ?? (g.__eventBus = new EventEmitter());
emitter.setMaxListeners(50);

/** Eventos que ya tienen su listener puesto, para que onUnaVez() no duplique. */
const registrados = (g.__eventBusRegistrados ??= new Set<string>());

export function on<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
  emitter.on(event, fn);
}

/**
 * on() idempotente por nombre de evento: el segundo registro del mismo evento
 * se ignora.
 *
 * El emitter vive en globalThis y sobrevive a que el módulo se vuelva a
 * evaluar, pero on() no: si listeners.ts se importa dos veces en el mismo
 * proceso (HMR en desarrollo, o cualquier import que no sea el de
 * instrumentation.ts) cada evento quedaba con dos handlers y salía todo
 * duplicado — dos push por el mismo mensaje. El setMaxListeners(50) de arriba
 * encima tapaba el warning de Node que lo habría delatado.
 *
 * Contrapartida: solo admite un listener por evento. Si alguna vez hacen falta
 * dos handlers para el mismo evento, van dentro de la misma función.
 */
export function onUnaVez<K extends keyof Events>(
  event: K,
  fn: (payload: Events[K]) => void,
) {
  if (registrados.has(event)) {
    console.log(`[bus] onUnaVez "${event}" ignorado — ya estaba registrado`);
    return;
  }
  registrados.add(event);
  emitter.on(event, fn);
}

export function emit<K extends keyof Events>(event: K, payload: Events[K]) {
  console.log(`[bus] emit "${event}" — listeners:`, emitter.listenerCount(event));
  emitter.emit(event, payload);
}
