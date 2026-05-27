import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ role: null });
  return NextResponse.json({ role: session.role });
}
