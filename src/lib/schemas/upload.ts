import { z } from "zod";

export const uploadFolderSchema = z.enum(["lessons", "blog", "resources", "attachments", "general"]);

export const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ,
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
  "audio/wav",
  "video/mp4",
  "video/quicktime",
  "video/webm"
] as const;

export const uploadConfig = {
  maxBytes: 20 * 1024 * 1024,
  allowedMimeTypes,
  folders: uploadFolderSchema.options
};

export const uploadRequestSchema = z.object({
  folder: uploadFolderSchema.default("general")
});
