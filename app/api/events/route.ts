import { getSession } from "@/lib/dal";
import { sseSubscribe, sseUnsubscribe, notifyTransportista, notifyEmpresa } from "@/lib/sse";
import { isTransportista, isEmpresa } from "@/lib/roles";

export const dynamic = "force-dynamic";
// Without this, Vercel's default serverless timeout (10s on Hobby) kills the
// stream before the first 10s poll tick even fires, forcing a client
// reconnect loop. 60s is the max allowed on Hobby; raise if the plan allows more.
export const maxDuration = 60;

const enc = new TextEncoder();

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { userId, role } = session;
  let ctrl: ReadableStreamDefaultController<Uint8Array>;
  let pingId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      ctrl = controller;
      sseSubscribe(userId, ctrl);

      // Send initial state immediately
      if (isTransportista(role)) await notifyTransportista(userId);
      else if (isEmpresa(role)) await notifyEmpresa(userId);

      // Recompute from DB every 10s instead of a plain keep-alive ping.
      // Deployed on Vercel, the request that mutates data (nueva postulación,
      // aceptación, etc.) can land on a different serverless instance than
      // the one holding this open connection, so the in-memory push in
      // lib/sse.ts silently misses it. Polling the real state from within
      // this same connection self-heals that within ~10s regardless of
      // which instance handled the write, and doubles as the keep-alive.
      pingId = setInterval(() => {
        (async () => {
          try {
            if (isTransportista(role)) await notifyTransportista(userId);
            else if (isEmpresa(role)) await notifyEmpresa(userId);
            else controller.enqueue(enc.encode(": ping\n\n"));
          } catch {
            clearInterval(pingId);
          }
        })();
      }, 10000);
    },
    cancel() {
      sseUnsubscribe(userId, ctrl);
      clearInterval(pingId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
