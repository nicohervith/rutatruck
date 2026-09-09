import { NextRequest } from "next/server";
import { getSession } from "@/lib/dal";
import { findPostulacionParaChat, findMensajesDeHilo, marcarLeidos } from "@/lib/repositories/mensaje.repository";
import { chatSubscribe, chatUnsubscribe, chatPushLeido } from "@/lib/sse";

export const dynamic = "force-dynamic";
// Ver app/api/events/route.ts: sin esto el timeout default de Vercel (10s en
// Hobby) mata el stream antes de que llegue a tickear el polling.
export const maxDuration = 60;

const enc = new TextEncoder();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postulacionId: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { postulacionId: postulacionIdParam } = await params;
  const postulacionId = parseInt(postulacionIdParam);
  if (isNaN(postulacionId)) return new Response("Not found", { status: 404 });

  const postulacion = await findPostulacionParaChat(postulacionId, session.userId);
  if (!postulacion) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  let lastId = parseInt(url.searchParams.get("after") ?? "0") || 0;

  let ctrl: ReadableStreamDefaultController<Uint8Array>;
  let pollId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      ctrl = controller;
      chatSubscribe(postulacionId, ctrl);

      // Marcar leído al abrir el hilo. Vivía en el render del Server Component
      // de la página, o sea una escritura como efecto de renderizar, que se
      // repetía en cada router.refresh(). Acá corre cuando el usuario realmente
      // abre la conversación (y en cada reconexión, que es idempotente).
      const alAbrir = await marcarLeidos(postulacionId, session.userId);
      if (alAbrir > 0) chatPushLeido(postulacionId, session.userId, new Date().toISOString());

      // El push cross-instancia de chatPush (ver lib/sse.ts) puede no llegar
      // si el POST que crea el mensaje cae en otra instancia serverless. Este
      // polling cada 2.5s dentro de la MISMA conexión es lo que garantiza que
      // el mensaje llegue igual, sin depender de esa suerte — es el mecanismo
      // confiable, el push es solo el atajo cuando funciona.
      pollId = setInterval(() => {
        (async () => {
          try {
            const nuevos = await findMensajesDeHilo(postulacionId, lastId);
            if (nuevos.length > 0) {
              lastId = nuevos[nuevos.length - 1].id;
              const marcados = await marcarLeidos(postulacionId, session.userId);
              if (marcados > 0) chatPushLeido(postulacionId, session.userId, new Date().toISOString());
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
      chatUnsubscribe(postulacionId, ctrl);
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
