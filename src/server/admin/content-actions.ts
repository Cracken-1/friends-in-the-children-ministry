"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import slugify from "slugify";

import { writeAdminAuditLog } from "@/server/admin/audit-log";
import { requireSystemAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";
import {
  createOrUpdateSupabaseAdminUser,
  deleteSupabaseAdminUserByEmail,
  hasSupabaseAdmin,
  updateSupabaseAdminUserByEmail
} from "@/server/services/supabase-admin";

function guardDatabase(path: string) {
  if (!isDatabaseConfigured) {
    redirect(`${path}?error=database-not-configured` as any);
  }
}

function buildSlug(title: string) {
  const base = slugify(title, { lower: true, strict: true }) || "content";
  return `${base}-${Date.now().toString(36)}`;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readOptionalInt(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function readOptionalDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? new Date(value) : null;
}

function readPassword(formData: FormData, key = "password") {
  return readString(formData, key);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

function readStatus(formData: FormData) {
  const value = readString(formData, "status");
  return value === "published" || value === "archived" ? value : "draft";
}

export async function createLessonAction(formData: FormData) {
  guardDatabase("/admin/lessons");
  const title = readString(formData, "title");
  if (!title) redirect("/admin/lessons/new?error=title-required" as any);
  const status = readStatus(formData);
  const lesson = await db.lesson.create({
    data: {
      title,
      slug: buildSlug(title),
      summary: readNullableString(formData, "summary"),
      content: readString(formData, "content"),
      ageGroup: readString(formData, "ageGroup") || "General",
      className: readNullableString(formData, "className"),
      duration: readOptionalInt(formData, "duration"),
      difficulty: readNullableString(formData, "difficulty"),
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
  await writeAdminAuditLog({
    action: "create",
    entityType: "lesson",
    entityId: lesson.id,
    metadata: { title: lesson.title, status: lesson.status }
  });
  redirect("/admin/lessons?success=created" as any);
}

export async function updateLessonAction(id: string, formData: FormData) {
  guardDatabase("/admin/lessons");
  const status = readStatus(formData);
  const lesson = await db.lesson.update({
    where: { id },
    data: {
      title: readString(formData, "title"),
      summary: readNullableString(formData, "summary"),
      content: readString(formData, "content"),
      ageGroup: readString(formData, "ageGroup") || "General",
      className: readNullableString(formData, "className"),
      duration: readOptionalInt(formData, "duration"),
      difficulty: readNullableString(formData, "difficulty"),
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
  await writeAdminAuditLog({
    action: "update",
    entityType: "lesson",
    entityId: lesson.id,
    metadata: { title: lesson.title, status: lesson.status }
  });
  redirect("/admin/lessons?success=updated" as any);
}

export async function deleteLessonAction(id: string) {
  guardDatabase("/admin/lessons");
  const lesson = await db.lesson.delete({ where: { id } });
  await writeAdminAuditLog({
    action: "delete",
    entityType: "lesson",
    entityId: lesson.id,
    metadata: { title: lesson.title }
  });
  redirect("/admin/lessons?success=deleted" as any);
}

export async function addLessonAttachmentAction(lessonId: string, formData: FormData) {
  guardDatabase(`/admin/lessons/${lessonId}/edit`);
  const url = readString(formData, "attachmentUrl");
  if (!url) {
    redirect(`/admin/lessons/${lessonId}/edit?error=attachment-url-required` as any);
  }

  const filename = readString(formData, "attachmentFilename") || url.split("/").pop() || "attachment";
  const mimeType = readString(formData, "attachmentMimeType") || "application/octet-stream";
  const size = readOptionalInt(formData, "attachmentSize") ?? 0;

  const attachment = await db.lessonAttachment.create({
    data: {
      lessonId,
      filename,
      url,
      mimeType,
      size
    }
  });

  await writeAdminAuditLog({
    action: "create",
    entityType: "lesson_attachment",
    entityId: attachment.id,
    metadata: { lessonId, filename: attachment.filename, mimeType: attachment.mimeType }
  });

  redirect(`/admin/lessons/${lessonId}/edit?success=attachment-added` as any);
}

export async function deleteLessonAttachmentAction(lessonId: string, attachmentId: string) {
  guardDatabase(`/admin/lessons/${lessonId}/edit`);
  const attachment = await db.lessonAttachment.delete({
    where: { id: attachmentId }
  });

  await writeAdminAuditLog({
    action: "delete",
    entityType: "lesson_attachment",
    entityId: attachment.id,
    metadata: { lessonId, filename: attachment.filename }
  });

  redirect(`/admin/lessons/${lessonId}/edit?success=attachment-deleted` as any);
}

export async function createBlogPostAction(formData: FormData) {
  guardDatabase("/admin/blog");
  const title = readString(formData, "title");
  if (!title) redirect("/admin/blog/new?error=title-required" as any);
  const status = readStatus(formData);
  const post = await db.blogPost.create({
    data: {
      title,
      slug: buildSlug(title),
      excerpt: readNullableString(formData, "excerpt"),
      content: readString(formData, "content"),
      premium: readBoolean(formData, "premium"),
      priceCents: readOptionalInt(formData, "priceCents"),
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
  await writeAdminAuditLog({
    action: "create",
    entityType: "blog_post",
    entityId: post.id,
    metadata: { title: post.title, status: post.status, premium: post.premium }
  });
  redirect("/admin/blog?success=created" as any);
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  guardDatabase("/admin/blog");
  const status = readStatus(formData);
  const post = await db.blogPost.update({
    where: { id },
    data: {
      title: readString(formData, "title"),
      excerpt: readNullableString(formData, "excerpt"),
      content: readString(formData, "content"),
      premium: readBoolean(formData, "premium"),
      priceCents: readOptionalInt(formData, "priceCents"),
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
  await writeAdminAuditLog({
    action: "update",
    entityType: "blog_post",
    entityId: post.id,
    metadata: { title: post.title, status: post.status, premium: post.premium }
  });
  redirect("/admin/blog?success=updated" as any);
}

export async function deleteBlogPostAction(id: string) {
  guardDatabase("/admin/blog");
  const post = await db.blogPost.delete({ where: { id } });
  await writeAdminAuditLog({
    action: "delete",
    entityType: "blog_post",
    entityId: post.id,
    metadata: { title: post.title }
  });
  redirect("/admin/blog?success=deleted" as any);
}

export async function createBibleStudyAction(formData: FormData) {
  guardDatabase("/admin/bible-studies");
  const title = readString(formData, "title");
  if (!title) redirect("/admin/bible-studies/new?error=title-required" as any);
  const status = readStatus(formData);
  const study = await db.bibleStudy.create({
    data: {
      title,
      slug: buildSlug(title),
      summary: readNullableString(formData, "summary"),
      content: readString(formData, "content"),
      featured: readBoolean(formData, "featured"),
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
  await writeAdminAuditLog({
    action: "create",
    entityType: "bible_study",
    entityId: study.id,
    metadata: { title: study.title, status: study.status, featured: study.featured }
  });
  redirect("/admin/bible-studies?success=created" as any);
}

export async function updateBibleStudyAction(id: string, formData: FormData) {
  guardDatabase("/admin/bible-studies");
  const status = readStatus(formData);
  const study = await db.bibleStudy.update({
    where: { id },
    data: {
      title: readString(formData, "title"),
      summary: readNullableString(formData, "summary"),
      content: readString(formData, "content"),
      featured: readBoolean(formData, "featured"),
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
  await writeAdminAuditLog({
    action: "update",
    entityType: "bible_study",
    entityId: study.id,
    metadata: { title: study.title, status: study.status, featured: study.featured }
  });
  redirect("/admin/bible-studies?success=updated" as any);
}

export async function deleteBibleStudyAction(id: string) {
  guardDatabase("/admin/bible-studies");
  const study = await db.bibleStudy.delete({ where: { id } });
  await writeAdminAuditLog({
    action: "delete",
    entityType: "bible_study",
    entityId: study.id,
    metadata: { title: study.title }
  });
  redirect("/admin/bible-studies?success=deleted" as any);
}

export async function createResourceAction(formData: FormData) {
  guardDatabase("/admin/resources");
  const title = readString(formData, "title");
  if (!title) redirect("/admin/resources/new?error=title-required" as any);
  const resource = await db.resource.create({
    data: {
      title,
      slug: buildSlug(title),
      description: readNullableString(formData, "description"),
      fileUrl: readString(formData, "fileUrl"),
      fileType: readString(formData, "fileType") || "PDF",
      status: readStatus(formData)
    }
  });
  await writeAdminAuditLog({
    action: "create",
    entityType: "resource",
    entityId: resource.id,
    metadata: { title: resource.title, status: resource.status, fileType: resource.fileType }
  });
  redirect("/admin/resources?success=created" as any);
}

export async function updateResourceAction(id: string, formData: FormData) {
  guardDatabase("/admin/resources");
  const resource = await db.resource.update({
    where: { id },
    data: {
      title: readString(formData, "title"),
      description: readNullableString(formData, "description"),
      fileUrl: readString(formData, "fileUrl"),
      fileType: readString(formData, "fileType") || "PDF",
      status: readStatus(formData)
    }
  });
  await writeAdminAuditLog({
    action: "update",
    entityType: "resource",
    entityId: resource.id,
    metadata: { title: resource.title, status: resource.status, fileType: resource.fileType }
  });
  redirect("/admin/resources?success=updated" as any);
}

export async function deleteResourceAction(id: string) {
  guardDatabase("/admin/resources");
  const resource = await db.resource.delete({ where: { id } });
  await writeAdminAuditLog({
    action: "delete",
    entityType: "resource",
    entityId: resource.id,
    metadata: { title: resource.title }
  });
  redirect("/admin/resources?success=deleted" as any);
}

export async function createEventAction(formData: FormData) {
  guardDatabase("/admin/events");
  const title = readString(formData, "title");
  if (!title) redirect("/admin/events/new?error=title-required" as any);
  const event = await db.event.create({
    data: {
      title,
      slug: buildSlug(title),
      description: readString(formData, "description"),
      startsAt: readOptionalDate(formData, "startsAt") ?? new Date(),
      location: readNullableString(formData, "location"),
      status: readStatus(formData)
    }
  });
  await writeAdminAuditLog({
    action: "create",
    entityType: "event",
    entityId: event.id,
    metadata: { title: event.title, status: event.status, startsAt: event.startsAt.toISOString() }
  });
  redirect("/admin/events?success=created" as any);
}

export async function updateEventAction(id: string, formData: FormData) {
  guardDatabase("/admin/events");
  const event = await db.event.update({
    where: { id },
    data: {
      title: readString(formData, "title"),
      description: readString(formData, "description"),
      startsAt: readOptionalDate(formData, "startsAt") ?? new Date(),
      location: readNullableString(formData, "location"),
      status: readStatus(formData)
    }
  });
  await writeAdminAuditLog({
    action: "update",
    entityType: "event",
    entityId: event.id,
    metadata: { title: event.title, status: event.status, startsAt: event.startsAt.toISOString() }
  });
  redirect("/admin/events?success=updated" as any);
}

export async function deleteEventAction(id: string) {
  guardDatabase("/admin/events");
  const event = await db.event.delete({ where: { id } });
  await writeAdminAuditLog({
    action: "delete",
    entityType: "event",
    entityId: event.id,
    metadata: { title: event.title }
  });
  redirect("/admin/events?success=deleted" as any);
}

export async function createTeachingTipAction(formData: FormData) {
  guardDatabase("/admin/teaching-tips");
  const title = readString(formData, "title");
  if (!title) redirect("/admin/teaching-tips/new?error=title-required" as any);
  const tip = await db.teachingTip.create({
    data: {
      title,
      content: readString(formData, "content"),
      status: readStatus(formData)
    }
  });
  await writeAdminAuditLog({
    action: "create",
    entityType: "teaching_tip",
    entityId: tip.id,
    metadata: { title: tip.title, status: tip.status }
  });
  redirect("/admin/teaching-tips?success=created" as any);
}

export async function updateTeachingTipAction(id: string, formData: FormData) {
  guardDatabase("/admin/teaching-tips");
  const tip = await db.teachingTip.update({
    where: { id },
    data: {
      title: readString(formData, "title"),
      content: readString(formData, "content"),
      status: readStatus(formData)
    }
  });
  await writeAdminAuditLog({
    action: "update",
    entityType: "teaching_tip",
    entityId: tip.id,
    metadata: { title: tip.title, status: tip.status }
  });
  redirect("/admin/teaching-tips?success=updated" as any);
}

export async function deleteTeachingTipAction(id: string) {
  guardDatabase("/admin/teaching-tips");
  const tip = await db.teachingTip.delete({ where: { id } });
  await writeAdminAuditLog({
    action: "delete",
    entityType: "teaching_tip",
    entityId: tip.id,
    metadata: { title: tip.title }
  });
  redirect("/admin/teaching-tips?success=deleted" as any);
}

export async function createUserAction(formData: FormData) {
  await requireSystemAdminSession();
  guardDatabase("/admin/users");
  const email = normalizeEmail(readString(formData, "email"));
  const password = readPassword(formData);
  const role = readString(formData, "role") === "super_admin" ? "super_admin" : "admin";
  const displayName = readNullableString(formData, "displayName");
  if (!email) redirect("/admin/users/new?error=email-required" as any);
  if (password.length < 8) redirect("/admin/users/new?error=password-too-short" as any);

  let user:
    | Awaited<ReturnType<typeof db.user.create>>
    | null = null;

  try {
    user = await db.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        displayName,
        role
      }
    });

    if (hasSupabaseAdmin) {
      await createOrUpdateSupabaseAdminUser({
        email,
        password,
        displayName,
        role
      });
    }
  } catch (error) {
    if (user) {
      await db.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
    redirect("/admin/users/new?error=user-create-failed" as any);
  }

  if (!user) {
    redirect("/admin/users/new?error=user-create-failed" as any);
  }

  await writeAdminAuditLog({
    action: "create",
    entityType: "user",
    entityId: user.id,
    metadata: { email: user.email, role: user.role }
  });
  redirect("/admin/users?success=created" as any);
}

export async function updateUserAction(id: string, formData: FormData) {
  await requireSystemAdminSession();
  guardDatabase("/admin/users");
  const email = normalizeEmail(readString(formData, "email"));
  const displayName = readNullableString(formData, "displayName");
  const role = readString(formData, "role") === "super_admin" ? "super_admin" : "admin";
  const password = readPassword(formData);
  if (password && password.length < 8) redirect(`/admin/users/${id}/edit?error=password-too-short` as any);

  const existingUser = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      passwordHash: true
    }
  });

  if (!existingUser) {
    redirect("/admin/users?error=user-not-found" as any);
  }

  const updatedPasswordHash = password ? await hashPassword(password) : existingUser.passwordHash;
  let user;

  try {
    user = await db.user.update({
      where: { id },
      data: {
        email,
        displayName,
        role,
        passwordHash: updatedPasswordHash
      }
    });

    if (hasSupabaseAdmin) {
      await updateSupabaseAdminUserByEmail(existingUser.email, {
        email,
        password: password || undefined,
        displayName,
        role
      });
    }
  } catch (error) {
    await db.user
      .update({
        where: { id },
        data: {
          email: existingUser.email,
          displayName: existingUser.displayName,
          role: existingUser.role,
          passwordHash: existingUser.passwordHash
        }
      })
      .catch(() => undefined);
    redirect(`/admin/users/${id}/edit?error=user-update-failed` as any);
  }

  if (!user) {
    redirect(`/admin/users/${id}/edit?error=user-update-failed` as any);
  }

  await writeAdminAuditLog({
    action: "update",
    entityType: "user",
    entityId: user.id,
    metadata: { email: user.email, role: user.role, passwordUpdated: Boolean(password) }
  });
  redirect("/admin/users?success=updated" as any);
}

export async function deleteUserAction(id: string) {
  await requireSystemAdminSession();
  guardDatabase("/admin/users");
  const existingUser = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      passwordHash: true,
      displayName: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!existingUser) {
    redirect("/admin/users?error=user-not-found" as any);
  }

  let user;
  try {
    user = await db.user.delete({ where: { id } });
    if (hasSupabaseAdmin) {
      await deleteSupabaseAdminUserByEmail(existingUser.email);
    }
  } catch (error) {
    const restoredUser = await db.user.findUnique({ where: { id } });
    if (!restoredUser) {
      await db.user
        .create({
          data: {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
            passwordHash: existingUser.passwordHash,
            displayName: existingUser.displayName,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt
          }
        })
        .catch(() => undefined);
    }
    redirect("/admin/users?error=user-delete-failed" as any);
  }

  if (!user) {
    redirect("/admin/users?error=user-delete-failed" as any);
  }

  await writeAdminAuditLog({
    action: "delete",
    entityType: "user",
    entityId: user.id,
    metadata: { email: user.email }
  });
  redirect("/admin/users?success=deleted" as any);
}
