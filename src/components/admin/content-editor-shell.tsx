import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

type ContentEditorShellProps = {
  title: string;
  description: string;
  backHref: string;
  children: ReactNode;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteLabel?: string;
};

export function ContentEditorShell({
  title,
  description,
  backHref,
  children,
  deleteAction,
  deleteLabel = "Delete"
}: ContentEditorShellProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Link href={backHref as any} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              <ArrowLeft size={16} />
              Back to list
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
          </div>
          {deleteAction ? (
            <form action={deleteAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                <Trash2 size={16} />
                {deleteLabel}
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">{children}</section>
    </div>
  );
}
