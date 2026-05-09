"use client";

import { LoaderCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type UploadFieldProps = {
  label: string;
  name: string;
  folder: "lessons" | "blog" | "resources" | "attachments" | "general";
  defaultValue?: string | null;
  storageMode: "supabase" | "local-fallback";
  required?: boolean;
  metadataFields?: {
    filenameName?: string;
    mimeTypeName?: string;
    sizeName?: string;
  };
};

type UploadResponse = {
  ok: true;
  storage: "supabase" | "local-fallback";
  url: string;
  filename: string;
  mimeType: string;
};

type DirectUploadResponse = UploadResponse & {
  bucket: string;
  folder: string;
  path: string;
  token: string;
  signedUrl: string;
};

type UploadErrorResponse = {
  error?: string;
};

export function UploadField({
  label,
  name,
  folder,
  defaultValue,
  storageMode,
  required,
  metadataFields
}: UploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [filename, setFilename] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "success">("idle");
  const [message, setMessage] = useState(
    storageMode === "supabase"
      ? "Uploads will be stored in Supabase Storage."
      : "Uploads will use local fallback storage until cloud storage is configured."
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelected(file: File) {
    setStatus("uploading");
    setMessage(`Uploading ${file.name}...`);

    try {
      let payload: UploadResponse;

      if (storageMode === "supabase") {
        const response = await fetch("/api/upload/direct", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            folder,
            fileName: file.name,
            mimeType: file.type,
            size: file.size
          })
        });

        const directPayload = (await response.json()) as DirectUploadResponse | UploadErrorResponse;
        if (!response.ok || !("ok" in directPayload)) {
          const message = "error" in directPayload ? directPayload.error : undefined;
          throw new Error(message || "Upload failed.");
        }

        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from(directPayload.bucket)
          .uploadToSignedUrl(directPayload.path, directPayload.token, file);

        if (error) {
          throw new Error(error.message || "Upload failed.");
        }

        payload = directPayload;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const localPayload = (await response.json()) as UploadResponse | UploadErrorResponse;
        if (!response.ok || !("ok" in localPayload)) {
          const message = "error" in localPayload ? localPayload.error : undefined;
          throw new Error(message || "Upload failed.");
        }

        payload = localPayload;
      }

      setValue(payload.url);
      setFilename(file.name || payload.filename);
      setMimeType(file.type || payload.mimeType);
      setSize(String(file.size));
      setStatus("success");
      setMessage(
        payload.storage === "supabase"
          ? `Uploaded to Supabase Storage as ${payload.filename}.`
          : `Uploaded locally as ${payload.filename}.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input type="hidden" name={name} value={value} />
      {metadataFields?.filenameName ? (
        <input type="hidden" name={metadataFields.filenameName} value={filename} />
      ) : null}
      {metadataFields?.mimeTypeName ? (
        <input type="hidden" name={metadataFields.mimeTypeName} value={mimeType} />
      ) : null}
      {metadataFields?.sizeName ? (
        <input type="hidden" name={metadataFields.sizeName} value={size} />
      ) : null}
      <div className="rounded-[16px] border border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {value || "No file uploaded yet"}
            </p>
            {filename ? (
              <p className="mt-1 truncate text-xs text-slate-400">
                {filename}{mimeType ? ` • ${mimeType}` : ""}{size ? ` • ${size} bytes` : ""}
              </p>
            ) : null}
            <p
              className={cn(
                "mt-1 text-xs",
                status === "error"
                  ? "text-rose-600"
                  : status === "success"
                    ? "text-emerald-600"
                    : "text-slate-500"
              )}
            >
              {message}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFileSelected(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              {status === "uploading" ? <LoaderCircle size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {status === "uploading" ? "Uploading..." : "Upload file"}
            </button>
          </div>
        </div>
      </div>
      {required ? <span className="text-xs text-slate-500">A file upload or file URL is required.</span> : null}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="https://... or /uploads/..."
        className="h-11 rounded-md border border-slate-300 px-3 font-normal text-slate-900 outline-none transition focus:border-blue-500"
      />
    </label>
  );
}
