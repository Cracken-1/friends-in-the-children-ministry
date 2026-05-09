"use client";

import { FolderUp, LoaderCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type MediaImporterProps = {
  storageMode: "supabase" | "local-fallback";
};

type UploadResponse = {
  ok: true;
  storage: "supabase" | "local-fallback";
  url: string;
  filename: string;
  mimeType: string;
  bucket?: string;
  folder?: string;
  path?: string;
  token?: string;
};

type UploadErrorResponse = {
  error?: string;
};

type ManifestResponse =
  | {
      ok: true;
      uploadedFiles: number;
      matchedImports: number;
      matchedFiles: number;
    }
  | {
      error?: string;
    };

type UploadedEntry = {
  relativePath: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export function TelegramMediaImporter({ storageMode }: MediaImporterProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState(
    storageMode === "supabase"
      ? "Choose the exported Telegram media folder. Files will upload directly to Supabase Storage and then be matched to staged imports."
      : "Choose the exported Telegram media folder. Files will use local fallback storage in this environment."
  );
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const progressLabel = useMemo(() => {
    if (!progress.total || status !== "uploading") {
      return null;
    }

    return `Uploading ${progress.current} of ${progress.total}`;
  }, [progress, status]);

  async function uploadSingleFile(file: File, relativePath: string) {
    if (storageMode === "supabase") {
      const response = await fetch("/api/upload/direct", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          folder: "attachments",
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size
        })
      });

      const directPayload = (await response.json()) as UploadResponse | UploadErrorResponse;
      if (!response.ok || !("ok" in directPayload) || !directPayload.bucket || !directPayload.path || !directPayload.token) {
        throw new Error("error" in directPayload ? directPayload.error : "Upload failed.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from(directPayload.bucket)
        .uploadToSignedUrl(directPayload.path, directPayload.token, file);

      if (error) {
        throw new Error(error.message || "Upload failed.");
      }

      return {
        relativePath,
        url: directPayload.url,
        fileName: file.name,
        mimeType: file.type || directPayload.mimeType,
        size: file.size
      } satisfies UploadedEntry;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "attachments");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as UploadResponse | UploadErrorResponse;
    if (!response.ok || !("ok" in payload)) {
      throw new Error("error" in payload ? payload.error : "Upload failed.");
    }

    return {
      relativePath,
      url: payload.url,
      fileName: file.name,
      mimeType: file.type || payload.mimeType,
      size: file.size
    } satisfies UploadedEntry;
  }

  async function handleFiles(files: FileList) {
    const queue = Array.from(files).filter((file) => file.name !== "result.json");

    if (!queue.length) {
      setStatus("error");
      setMessage("No media files were found in that folder selection.");
      return;
    }

    setStatus("uploading");
    setProgress({ current: 0, total: queue.length });
    setMessage("Preparing Telegram media import...");

    try {
      const uploaded: UploadedEntry[] = [];

      for (let index = 0; index < queue.length; index += 1) {
        const file = queue[index]!;
        const relativePath =
          typeof (file as File & { webkitRelativePath?: string }).webkitRelativePath === "string" &&
          (file as File & { webkitRelativePath?: string }).webkitRelativePath
            ? (file as File & { webkitRelativePath?: string }).webkitRelativePath!
            : file.name;

        setProgress({ current: index + 1, total: queue.length });
        setMessage(`Uploading ${relativePath}...`);
        uploaded.push(await uploadSingleFile(file, relativePath));
      }

      const manifestResponse = await fetch("/api/telegram/history-media", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ entries: uploaded })
      });

      const manifestPayload = (await manifestResponse.json()) as ManifestResponse;
      if (!manifestResponse.ok || !("ok" in manifestPayload)) {
        throw new Error("error" in manifestPayload ? manifestPayload.error : "Unable to match Telegram media.");
      }

      setStatus("success");
      setMessage(
        `${manifestPayload.uploadedFiles} media files uploaded. ${manifestPayload.matchedFiles} files matched across ${manifestPayload.matchedImports} staged imports.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Telegram media import failed.");
    }
  }

  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">Telegram media companion import</p>
          <p
            className={cn(
              "mt-1 text-xs leading-6",
              status === "error"
                ? "text-rose-600"
                : status === "success"
                  ? "text-emerald-700"
                  : "text-slate-500"
            )}
          >
            {message}
          </p>
          {progressLabel ? <p className="mt-1 text-[11px] font-medium text-slate-400">{progressLabel}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                void handleFiles(event.target.files);
              }
            }}
            {...({ webkitdirectory: "true", directory: "true" } as Record<string, string>)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            {status === "uploading" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <FolderUp size={16} />
            )}
            {status === "uploading" ? "Uploading..." : "Import media folder"}
          </button>
        </div>
      </div>
    </div>
  );
}
