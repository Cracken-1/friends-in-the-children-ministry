import type { UserRole } from "@/generated/prisma/client";
import {
  Archive,
  BarChart3,
  BookOpen,
  BookText,
  CalendarDays,
  FileCog,
  Files,
  LayoutDashboard,
  Lightbulb,
  MessageCircleMore,
  ScrollText,
  Settings,
  Users
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export const adminSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }]
  },
  {
    title: "Content Management",
    items: [
      { href: "/admin/lessons", label: "Lessons", icon: BookOpen },
      { href: "/admin/bible-studies", label: "Bible Studies", icon: BookText },
      { href: "/admin/blog", label: "Blog Posts", icon: Files },
      { href: "/admin/resources", label: "Resources", icon: FileCog },
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/teaching-tips", label: "Teaching Tips", icon: Lightbulb }
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ["super_admin"] },
      { href: "/admin/users", label: "Users", icon: Users, roles: ["super_admin"] },
      { href: "/admin/newsletter", label: "Newsletter", icon: Users },
      { href: "/admin/telegram-imports", label: "Telegram Imports", icon: MessageCircleMore },
      { href: "/admin/backups", label: "Backups", icon: Archive, roles: ["super_admin"] },
      { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["super_admin"] }
    ]
  }
] as const;
