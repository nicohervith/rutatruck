export async function register() {
  console.log("[instrumentation] register() llamado, runtime:", process.env.NEXT_RUNTIME);
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/notifications/listeners");
    console.log("[instrumentation] listeners.ts importado ok");
  }
}
