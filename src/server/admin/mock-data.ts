export const adminOverviewFallback = {
  stats: {
    totalLessons: 24,
    publishedLessons: 18,
    totalBibleStudies: 8,
    totalBlogPosts: 12,
    totalResources: 31,
    totalEvents: 6,
    totalSubscribers: 142,
    telegramImports: { total: 17, queued: 2, pending: 3, processing: 1, completed: 9, failed: 2 }
  },
  activities: [
    { title: "Telegram import queued", meta: "3 minutes ago" },
    { title: "Blog post updated", meta: "20 minutes ago" },
    { title: "Lesson draft published", meta: "Today" }
  ]
} as const;

export const adminFallbackLessons = [
  { id: "lesson-1", title: "David and Goliath", ageGroup: "Ages 7-10", status: "published", duration: 35, views: 384 },
  { id: "lesson-2", title: "Creation and God's Good World", ageGroup: "Ages 3-6", status: "draft", duration: 25, views: 201 },
  { id: "lesson-3", title: "The Good Samaritan", ageGroup: "Ages 10-12", status: "published", duration: 40, views: 275 }
] as const;

export const adminFallbackPosts = [
  { id: "post-1", title: "Keeping Children Engaged During Bible Story Time", premium: false, status: "published" },
  { id: "post-2", title: "Building Better Lesson Flow for Multi-Age Groups", premium: true, status: "draft" },
  { id: "post-3", title: "Helping Parents Continue the Lesson at Home", premium: false, status: "published" }
] as const;

export const adminFallbackResources = [
  { id: "resource-1", title: "David and Goliath Worksheet Pack", type: "Worksheet", fileType: "PDF", size: "1.2 MB", downloads: 83, featured: true },
  { id: "resource-2", title: "Creation Coloring Pages", type: "Printable", fileType: "PDF", size: "860 KB", downloads: 67, featured: false },
  { id: "resource-3", title: "Teacher Slide Starter", type: "Presentation", fileType: "PPTX", size: "2.8 MB", downloads: 31, featured: true }
] as const;

export const adminFallbackBibleStudies = [
  { id: "study-1", title: "Faith Under Pressure", featured: true, status: "published", format: "Teacher + Student Guides" },
  { id: "study-2", title: "Walking with Jesus", featured: false, status: "draft", format: "Comprehensive Study" }
] as const;

export const adminFallbackEvents = [
  { id: "event-1", title: "Teachers Prayer and Planning Morning", date: "14 Jun 2026", location: "Nairobi Central Fellowship", status: "upcoming" },
  { id: "event-2", title: "Holiday Bible Club Orientation", date: "02 Jul 2026", location: "Community Hall", status: "upcoming" }
] as const;

export const adminTelegramFallback = {
  mode: "polling",
  imports: [
    { id: "tg-1", messageId: "24091", mediaType: "video", caption: "David and Goliath lesson video", status: "completed", createdAt: "Today, 10:14" },
    { id: "tg-2", messageId: "24092", mediaType: "document", caption: "Worksheet PDF", status: "pending", createdAt: "Today, 10:21" },
    { id: "tg-3", messageId: "24093", mediaType: "text", caption: "New lesson outline", status: "failed", createdAt: "Today, 11:03" }
  ]
} as const;

export const adminFallbackUsers = [
  { id: "user-1", email: "admin@friendsofchildrenministries.org", displayName: "Lead Administrator", role: "super_admin" },
  { id: "user-2", email: "editor@friendsofchildrenministries.org", displayName: "Content Editor", role: "admin" }
] as const;

export const adminFallbackAuditLogs = [
  {
    id: "audit-1",
    action: "login",
    entityType: "auth_session",
    entityId: "user-1",
    createdAt: "Today, 08:12",
    actorName: "Lead Administrator",
    actorEmail: "admin@friendsofchildrenministries.org"
  },
  {
    id: "audit-2",
    action: "update",
    entityType: "lesson",
    entityId: "lesson-1",
    createdAt: "Today, 09:05",
    actorName: "Content Editor",
    actorEmail: "editor@friendsofchildrenministries.org"
  },
  {
    id: "audit-3",
    action: "create",
    entityType: "resource",
    entityId: "resource-2",
    createdAt: "Today, 10:31",
    actorName: "Lead Administrator",
    actorEmail: "admin@friendsofchildrenministries.org"
  }
] as const;
