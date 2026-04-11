import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { globalSearch } from "@/services/search.service";
import { handleRouteError } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const result = await globalSearch(q, {
      admin: isAdmin(user.role),
      userId: isAdmin(user.role) ? undefined : user.id,
      limit,
    });
    return NextResponse.json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
