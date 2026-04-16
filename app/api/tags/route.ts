import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { createTag, listTags } from "@/services/tag.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import { zHexColor } from "@/lib/constants/validation";

export async function GET() {
  try {
    await requireAuth();
    const tags = await listTags();
    return NextResponse.json({ tags });
  } catch (e) {
    return handleRouteError(e);
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  color: zHexColor,
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!isAdmin(user.role)) return jsonError("Accès refusé", 403);
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400, { details: parsed.error.flatten() });
    const tag = await createTag(parsed.data.name, parsed.data.color);
    return NextResponse.json({ tag }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
