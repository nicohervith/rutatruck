import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const externalReference = req.nextUrl.searchParams.get("external_reference");

  if (externalReference) {
    const match = externalReference.match(/^carga_(\d+)_post_\d+$/);
    if (match) {
      return NextResponse.redirect(
        new URL(`/empresa/cargas/${match[1]}?error=pago_cancelado`, req.nextUrl)
      );
    }
  }

  return NextResponse.redirect(new URL("/empresa/cargas", req.nextUrl));
}
