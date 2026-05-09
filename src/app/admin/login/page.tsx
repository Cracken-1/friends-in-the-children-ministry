import { LockKeyhole, ShieldCheck } from "lucide-react";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const messages: Record<string, string> = {
  "invalid-credentials": "The email or password did not match an admin account.",
  "access-denied": "This account is not allowed to enter the admin workspace.",
  "session-required": "Please sign in to continue.",
  "database-not-configured": "The database connection is not ready yet."
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorKey = typeof params.error === "string" ? params.error : "";
  const errorMessage = messages[errorKey];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <div className="rounded-[20px] border border-border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <LockKeyhole size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Admin Access</p>
            <h1 className="text-2xl font-bold text-slate-900">Sign in to the ministry workspace</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          Content, uploads, Telegram imports, and system controls live here.
        </p>
        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
        <form action="/api/auth/login" className="mt-6 grid gap-4" method="post">
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input
              className="h-11 rounded-md border border-border px-3 font-normal"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <input
              className="h-11 rounded-md border border-border px-3 font-normal"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={1}
              required
            />
          </label>
          <button className="h-11 rounded-md bg-primary font-semibold text-primary-foreground" type="submit">
            Sign in
          </button>
        </form>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck size={14} />
          Protected admin area
        </div>
      </div>
    </div>
  );
}
