import { getSession } from "@/lib/dal";
import { sseSubscribe, sseUnsubscribe, notifyTransportista, notifyEmpresa } from "@/lib/sse";
import { isTransportista, isEmpresa } from "@/lib/roles";

export const dynamic = "force-dynamic";

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

      // Keep-alive ping every 25s (browsers close idle SSE after 30s)
      pingId = setInterval(() => {
        try { controller.enqueue(enc.encode(": ping\n\n")); }
        catch { clearInterval(pingId); }
      }, 25000);
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
