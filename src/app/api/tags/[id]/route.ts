import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { idParamSchema } from "@/lib/validation/api.validation";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const parsed = await idParamSchema.safeParseAsync(resolvedParams);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  return new NextResponse(null, { status: 204 });
}
