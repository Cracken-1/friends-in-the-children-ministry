import { NextResponse } from "next/server";

import { uploadConfig, uploadRequestSchema } from "@/lib/schemas/upload";
import { getAdminSession } from "@/server/auth/session";
import { getUploadStorageMode, persistUpload, validateUpload } from "@/server/services/uploads";

export async function GET() {
  const storage = getUploadStorageMode();
  return NextResponse.json({
    ...uploadConfig,
    enabled: true,
    storage,
    note:
      storage === "supabase"
        ? "Supabase Storage is active for uploads, with direct browser upload available."
        : "Local fallback uploads are enabled until Supabase Storage is connected."
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  const parsed = uploadRequestSchema.safeParse({ folder: formData.get("folder") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Upload folder is invalid." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const validation = await validateUpload(buffer, file.type);
    const folder = parsed.data.folder;
    const stored = await persistUpload({
      buffer,
      folder,
      fileName: file.name,
      mimeType: validation.mimeType,
      detectedExtension: validation.extension
    });

    return NextResponse.json(
      stored,
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
