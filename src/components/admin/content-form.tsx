import type { ReactNode } from "react";

export function DatabaseNotice({ configured }: { configured: boolean }) {
  if (configured) {
    return null;
  }

  return (
    <div className="mb-6 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
      Database is not configured yet. You can review the full editor UI now, and these actions will
      become live as soon as PostgreSQL is connected.
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  children
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="h-11 rounded-md border border-slate-300 px-3 font-normal text-slate-900 outline-none ring-0 transition focus:border-blue-500"
      />
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <span className="text-xs leading-6 text-slate-500">{children}</span>;
}

export function TextareaField({
  label,
  name,
  defaultValue,
  rows = 6,
  required,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-slate-300 px-3 py-3 font-normal text-slate-900 outline-none transition focus:border-blue-500"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]?.value ?? ""}
        className="h-11 rounded-md border border-slate-300 px-3 font-normal text-slate-900 outline-none transition focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
      />
      <span>{label}</span>
    </label>
  );
}

export function FormActions({ submitLabel }: { submitLabel: string }) {
  return (
    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
      >
        {submitLabel}
      </button>
    </div>
  );
}
