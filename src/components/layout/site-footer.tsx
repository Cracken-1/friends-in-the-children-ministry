import Link from "next/link";
import { BookOpen, Facebook, Instagram, Mail, MapPin, Phone, Send, Twitter, Youtube } from "lucide-react";

const ageGroups = [
  "Class A (Ages 3-5)",
  "Class B (Ages 6-9)",
  "Class C (Ages 10-12)",
  "Teens 13+"
] as const;

export function SiteFooter() {
  return (
    <>
      <section className="blue-hero py-12 text-white">
        <div className="page-shell text-center">
          <h2 className="text-3xl font-semibold text-white">Stay Updated</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/90">
            Stay updated with our latest news, events, new lessons, and teaching resources.
          </p>
          <form action="/api/public/newsletter/subscribe" method="post" className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-[1fr_1.2fr_auto]">
            <input
              name="name"
              type="text"
              placeholder="Your name (optional)"
              className="h-12 rounded-md border-0 px-4 text-slate-900"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email address"
              className="h-12 rounded-md border-0 px-4 text-slate-900"
            />
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 font-semibold text-blue-800" type="submit">
              <Send size={18} />
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-[#10233f] py-12 text-white">
        <div className="page-shell grid gap-8 md:grid-cols-4">
          <section>
            <div className="flex items-center gap-2 font-serif text-xl font-bold">
              <BookOpen size={26} className="text-blue-300" />
              <span>Friends in the Children Ministries</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/75">
              Empowering Sunday school teachers with quality biblical education resources.
            </p>
            <div className="mt-5 flex gap-4 text-blue-300">
              <Facebook size={20} />
              <Twitter size={20} />
              <Instagram size={20} />
              <Youtube size={20} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 grid gap-2 text-sm text-white/75">
              <li><Link href="/lessons">Browse Lessons</Link></li>
              <li><Link href="/blog">Teaching Blog</Link></li>
              <li><Link href="/resources">Resources</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white">Categories</h3>
            <ul className="mt-4 grid gap-2 text-sm text-white/75">
              {ageGroups.map((ageGroup) => (
                <li key={ageGroup}>
                  <Link href="/lessons">{ageGroup}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="mt-4 grid gap-3 text-sm text-white/75">
              <li className="flex gap-2"><Mail size={16} className="mt-1 shrink-0 text-blue-300" /> contact@friendsofchildrenministries.org</li>
              <li className="flex gap-2"><Phone size={16} className="mt-1 shrink-0 text-blue-300" /> (555) 123-4567</li>
              <li className="flex gap-2"><MapPin size={16} className="mt-1 shrink-0 text-blue-300" /> Serving churches nationwide</li>
            </ul>
          </section>
        </div>
        <div className="page-shell mt-10 border-t border-white/15 pt-6 text-center text-xs text-white/65">
          &copy; 2026 Friends in the Children Ministries. All rights reserved.
        </div>
      </footer>
    </>
  );
}
