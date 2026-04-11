import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { handleRouteError } from "@/lib/api/errors";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    return handleRouteError(e);
  }
}
