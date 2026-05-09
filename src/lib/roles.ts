import type { UserRole } from "@/generated/prisma/client";

export function isSystemAdminRole(role: UserRole) {
  return role === "super_admin";
}

export function formatAdminRole(role: UserRole) {
  return isSystemAdminRole(role) ? "System Admin" : "Editor";
}

export function describeAdminRole(role: UserRole) {
  return isSystemAdminRole(role)
    ? "Full system access, user administration, and CMS control."
    : "Website content management and publishing access."
}
