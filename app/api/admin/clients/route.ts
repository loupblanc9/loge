import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/get-session";
import { listClientsForAdmin } from "@/services/admin-clients.service";
import { handleRouteError } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const { data, meta } = await listClientsForAdmin({ q, page });
    return NextResponse.json({
      data: data.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      meta,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
