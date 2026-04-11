import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookies";
import { handleRouteError } from "@/lib/api/errors";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
