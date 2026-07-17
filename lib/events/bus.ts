import { EventEmitter } from "node:events";
import type { Events } from "./types";

const emitter = new EventEmitter();

export function on<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
  emitter.on(event, fn);
}

export function emit<K extends keyof Events>(event: K, payload: Events[K]) {
  emitter.emit(event, payload);
}
