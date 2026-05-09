"use client";

import { LoaderCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ImportResponse =
  | {
      ok: true;
      channelName: string | null;
      created: number;
      updated: number;
      total: number;
    }
  | {
      error?: string;
    };

export function TelegramHistoryImporter() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState(
    "Upload Telegram Desktop's result.json to stage historical posts before the bot starts handling new ones."
  );

  async function handleFile(file: File) {
    setStatus("uploading");
    setMessage(`Importing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/telegram/history-import", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as ImportResponse;
      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Import failed.");
      }

      setStatus("success");
      setMessage(
        `${payload.total} messages staged from ${payload.channelName || "the Telegram export"} (${payload.created} new, ${payload.updated} refreshed).`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Import failed.");
    }
  }

  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">Historical Telegram import</p>
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
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            {status === "uploading" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {status === "uploading" ? "Importing..." : "Import result.json"}
          </button>
        </div>
      </div>
    </div>
  );
}
