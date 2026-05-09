import Link from "next/link";
import { BookOpen, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/bible-study", label: "Bible Study" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" }
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="page-shell flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-blue-800">
          <BookOpen size={30} />
          <span>Friends in the Children Ministries</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-semibold text-[#2d6a4f]">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href as any} className="hover:text-blue-800">
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
            <Settings size={16} />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
