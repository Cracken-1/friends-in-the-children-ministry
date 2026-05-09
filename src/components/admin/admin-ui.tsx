import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, meta, actions }: AdminPageHeaderProps) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 lg:text-4xl">{title}</h1>
          {description ? <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p> : null}
          {meta ? <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

type AdminPanelProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function AdminPanel({ title, description, actions, className, children }: AdminPanelProps) {
  return (
    <section className={cn("rounded-[18px] border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

type AdminKpiCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: "dark" | "blue" | "amber" | "slate" | "green" | "rose";
  note?: string;
};

const toneClasses: Record<NonNullable<AdminKpiCardProps["tone"]>, string> = {
  dark: "bg-slate-950 text-white",
  blue: "bg-blue-700 text-white",
  amber: "bg-amber-500 text-slate-950",
  slate: "bg-slate-700 text-white",
  green: "bg-emerald-600 text-white",
  rose: "bg-rose-600 text-white"
};

export function AdminKpiCard({
  label,
  value,
  icon,
  tone = "dark",
  note
}: AdminKpiCardProps) {
  return (
    <article className={cn("rounded-[18px] p-6 shadow-sm", toneClasses[tone])}>
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">{icon}</div>
      </div>
      <p className="mt-6 text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-sm font-medium opacity-90">{label}</p>
      {note ? <p className="mt-2 text-xs opacity-80">{note}</p> : null}
    </article>
  );
}

type AdminEmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function AdminEmptyState({ title, body, action }: AdminEmptyStateProps) {
  return (
    <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-500">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

type AdminNoticeProps = {
  tone?: "info" | "success" | "warning";
  title: string;
  body: string;
  action?: ReactNode;
};

const noticeStyles: Record<NonNullable<AdminNoticeProps["tone"]>, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950"
};

const noticeIcons: Record<NonNullable<AdminNoticeProps["tone"]>, ReactNode> = {
  info: <Info size={18} className="text-blue-700" />,
  success: <CheckCircle2 size={18} className="text-emerald-700" />,
  warning: <AlertTriangle size={18} className="text-amber-700" />
};

export function AdminNotice({ tone = "info", title, body, action }: AdminNoticeProps) {
  return (
    <div className={cn("rounded-[18px] border p-4 shadow-sm", noticeStyles[tone])}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5">{noticeIcons[tone]}</div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-7 opacity-85">{body}</p>
          </div>
        </div>
        {action ? <div className="flex shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

type AdminActionCardProps = {
  title: string;
  body: string;
  icon: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function AdminActionCard({ title, body, icon, action, className }: AdminActionCardProps) {
  return (
    <article className={cn("rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </article>
  );
}

type AdminChecklistItem = {
  label: string;
  status: "ready" | "fallback" | "pending";
  note: string;
};

type AdminChecklistProps = {
  items: readonly AdminChecklistItem[];
};

export function AdminChecklist({ items }: AdminChecklistProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const tone =
          item.status === "ready"
            ? "bg-emerald-50 text-emerald-700"
            : item.status === "fallback"
              ? "bg-blue-50 text-blue-700"
              : "bg-amber-50 text-amber-700";

        return (
          <div
            key={item.label}
            className="flex flex-col gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.note}</p>
            </div>
            <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide", tone)}>
              {item.status === "ready" ? <CheckCircle2 size={14} /> : item.status === "fallback" ? <Info size={14} /> : <Clock3 size={14} />}
              {item.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
