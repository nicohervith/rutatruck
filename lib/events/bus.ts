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
const g = globalThis as unknown as { __eventBus?: EventEmitter };
const emitter = g.__eventBus ?? (g.__eventBus = new EventEmitter());
emitter.setMaxListeners(50);

export function on<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
  emitter.on(event, fn);
}

export function emit<K extends keyof Events>(event: K, payload: Events[K]) {
  console.log(`[bus] emit "${event}" — listeners:`, emitter.listenerCount(event));
  emitter.emit(event, payload);
}
