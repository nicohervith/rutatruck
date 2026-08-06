import { NextRequest } from "next/server";
import { getSession } from "@/lib/dal";
import { findCargaParaChat, findMensajesDeCarga, marcarLeidos } from "@/lib/repositories/mensaje.repository";
import { chatSubscribe, chatUnsubscribe, chatPushLeido } from "@/lib/sse";

export const dynamic = "force-dynamic";
// Ver app/api/events/route.ts: sin esto el timeout default de Vercel (10s en
// Hobby) mata el stream antes de que llegue a tickear el polling.
export const maxDuration = 60;

const enc = new TextEncoder();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cargaId: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { cargaId: cargaIdParam } = await params;
  const cargaId = parseInt(cargaIdParam);
  if (isNaN(cargaId)) return new Response("Not found", { status: 404 });

  const carga = await findCargaParaChat(cargaId, session.userId);
  if (!carga) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  let lastId = parseInt(url.searchParams.get("after") ?? "0") || 0;

  let ctrl: ReadableStreamDefaultController<Uint8Array>;
  let pollId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller;
      chatSubscribe(cargaId, ctrl);

      // El push cross-instancia de chatPush (ver lib/sse.ts) puede no llegar
      // si el POST que crea el mensaje cae en otra instancia serverless. Este
      // polling cada 2.5s dentro de la MISMA conexión es lo que garantiza que
      // el mensaje llegue igual, sin depender de esa suerte — es el mecanismo
      // confiable, el push es solo el atajo cuando funciona.
      pollId = setInterval(() => {
        (async () => {
          try {
            const nuevos = await findMensajesDeCarga(cargaId, lastId);
            if (nuevos.length > 0) {
              lastId = nuevos[nuevos.length - 1].id;
              const marcados = await marcarLeidos(cargaId, session.userId);
              if (marcados > 0) chatPushLeido(cargaId, session.userId, new Date().toISOString());
              controller.enqueue(enc.encode(`event: mensajes\ndata: ${JSON.stringify(nuevos)}\n\n`));
            } else {
              controller.enqueue(enc.encode(": ping\n\n"));
            }
          } catch {
            clearInterval(pollId);
          }
        })();
      }, 2500);
    },
    cancel() {
      chatUnsubscribe(cargaId, ctrl);
      clearInterval(pollId);
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
