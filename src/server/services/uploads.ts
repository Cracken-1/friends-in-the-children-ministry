import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { fileTypeFromBuffer } from "file-type";
import slugify from "slugify";

import { allowedMimeTypes, uploadConfig } from "@/lib/schemas/upload";
import { getSupabaseAdminClient, hasSupabaseAdmin } from "@/server/services/supabase-admin";

export async function validateUpload(buffer: Buffer, declaredMimeType: string) {
  if (buffer.byteLength > uploadConfig.maxBytes) {
    throw new Error("File is larger than the configured upload limit.");
  }

  const detected = await fileTypeFromBuffer(buffer);
  const mimeType = detected?.mime ?? declaredMimeType;

  if (!allowedMimeTypes.includes(mimeType as (typeof allowedMimeTypes)[number])) {
    throw new Error("File type is not allowed.");
  }

  return { mimeType, extension: detected?.ext };
}

function resolveExtension(fileName: string, detectedExtension?: string) {
  if (detectedExtension) {
    return detectedExtension;
  }

  const ext = path.extname(fileName).replace(".", "").toLowerCase();
  return ext || "bin";
}

function buildFilename(fileName: string, detectedExtension?: string) {
  const baseName = slugify(path.parse(fileName).name, { lower: true, strict: true }) || "file";
  const extension = resolveExtension(fileName, detectedExtension);
  return `${baseName}-${randomUUID()}.${extension}`;
}

export function getUploadStorageMode() {
  return hasSupabaseAdmin ? "supabase" : "local-fallback";
}

async function ensureSupabaseBucket() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase storage is not configured.");
  }

  const bucket = process.env.SUPABASE_UPLOAD_BUCKET || "ministry-assets";

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    throw new Error(`Unable to inspect storage buckets: ${bucketsError.message}`);
  }

  const bucketExists = buckets.some((entry) => entry.name === bucket);
  if (!bucketExists) {
    const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: `${uploadConfig.maxBytes}`,
      allowedMimeTypes: [...allowedMimeTypes]
    });

    if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
      throw new Error(`Unable to create storage bucket: ${createBucketError.message}`);
    }
  }

  return { supabase, bucket };
}

async function uploadToSupabaseStorage(input: {
  buffer: Buffer;
  folder: string;
  fileName: string;
  mimeType: string;
  detectedExtension?: string;
}) {
  const { supabase, bucket } = await ensureSupabaseBucket();
  const objectName = buildFilename(input.fileName, input.detectedExtension);
  const objectPath = `${input.folder}/${objectName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, input.buffer, {
    contentType: input.mimeType,
    upsert: false
  });

  if (uploadError) {
    throw new Error(`Unable to upload file to Supabase Storage: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return {
    ok: true as const,
    storage: "supabase" as const,
    bucket,
    folder: input.folder,
    filename: objectName,
    size: input.buffer.byteLength,
    mimeType: input.mimeType,
    path: objectPath,
    url: publicUrlData.publicUrl
  };
}

function validateDeclaredMimeType(mimeType: string) {
  if (!allowedMimeTypes.includes(mimeType as (typeof allowedMimeTypes)[number])) {
    throw new Error("File type is not allowed.");
  }
}

export async function createDirectUploadTarget(input: {
  folder: string;
  fileName: string;
  mimeType: string;
  size: number;
}) {
  if (input.size > uploadConfig.maxBytes) {
    throw new Error("File is larger than the configured upload limit.");
  }

  validateDeclaredMimeType(input.mimeType);
  const { supabase, bucket } = await ensureSupabaseBucket();
  const objectName = buildFilename(input.fileName);
  const objectPath = `${input.folder}/${objectName}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) {
    throw new Error(`Unable to prepare direct upload: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return {
    ok: true as const,
    storage: "supabase" as const,
    bucket,
    folder: input.folder,
    filename: objectName,
    mimeType: input.mimeType,
    path: objectPath,
    token: data.token,
    signedUrl: data.signedUrl,
    url: publicUrlData.publicUrl
  };
}

async function uploadToLocalStorage(input: {
  buffer: Buffer;
  folder: string;
  fileName: string;
  mimeType: string;
  detectedExtension?: string;
}) {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads", input.folder);
  await mkdir(uploadsRoot, { recursive: true });

  const filename = buildFilename(input.fileName, input.detectedExtension);
  const diskPath = path.join(uploadsRoot, filename);

  await writeFile(diskPath, input.buffer);

  return {
    ok: true as const,
    storage: "local-fallback" as const,
    folder: input.folder,
    filename,
    size: input.buffer.byteLength,
    mimeType: input.mimeType,
    url: `/uploads/${input.folder}/${filename}`
  };
}

export async function persistUpload(input: {
  buffer: Buffer;
  folder: string;
  fileName: string;
  mimeType: string;
  detectedExtension?: string;
}) {
  if (getUploadStorageMode() === "supabase") {
    return uploadToSupabaseStorage(input);
  }

  return uploadToLocalStorage(input);
}
