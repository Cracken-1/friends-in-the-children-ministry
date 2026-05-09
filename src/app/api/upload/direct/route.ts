import { NextResponse } from "next/server";
import { z } from "zod";

import { uploadRequestSchema } from "@/lib/schemas/upload";
import { getAdminSession } from "@/server/auth/session";
import { createDirectUploadTarget, getUploadStorageMode } from "@/server/services/uploads";

const directUploadSchema = uploadRequestSchema.extend({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(255),
  size: z.number().int().positive()
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (getUploadStorageMode() !== "supabase") {
    return NextResponse.json(
      { error: "Direct upload is only available when Supabase Storage is active." },
      { status: 400 }
    );
  }

  const payload = directUploadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Upload request is invalid." }, { status: 400 });
  }

  try {
    const target = await createDirectUploadTarget(payload.data);
    return NextResponse.json(target, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to prepare upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
