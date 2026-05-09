import Image from "next/image";
import Link from "next/link";
import {
  Book,
  BookOpen,
  CheckCircle,
  Church,
  Cross,
  Download,
  FileText,
  PlayCircle,
  Rocket,
  ScrollText,
  Search,
  Star,
  Users,
  Video
} from "lucide-react";

const sections = [
  {
    title: "Today's Lesson",
    body: "Complete lesson plans with objectives, activities, and discussion questions ready to use.",
    href: "/lessons",
    icon: BookOpen,
    detail: "Featured: David and Goliath"
  },
  {
    title: "Age-Appropriate Content",
    body: "Lessons designed specifically for different age groups and teen classes.",
    href: "/lessons",
    icon: Users,
    detail: "Ages 3-5 | 6-9 | 10-12 | Teens"
  },
  {
    title: "Instant Downloads",
    body: "Worksheets, coloring pages, crafts, and activities ready to print and use.",
    href: "/resources",
    icon: Download,
    detail: "PDF resources and classroom files"
  },
  {
    title: "Multimedia Lessons",
    body: "Video stories, audio narrations, and interactive elements to engage students.",
    href: "/lessons",
    icon: Video,
    detail: "Video | Audio | Documents"
  }
] as const;

const heroChecks = ["100% Free", "No Registration Required", "Instant Access"] as const;

const stats = [
  { value: "0+", label: "Teachers Served", icon: Users },
  { value: "0+", label: "Bible Lessons", icon: Book },
  { value: "0+", label: "Resources Available", icon: Download },
  { value: "50+", label: "Churches Served", icon: Church }
] as const;

const topics = [
  {
    title: "Old Testament",
    body: "Creation, Noah's Ark, Moses, David and Goliath, and more foundational stories.",
    icon: ScrollText,
    href: "/lessons"
  },
  {
    title: "New Testament",
    body: "Jesus' birth, miracles, parables, and early church stories.",
    icon: Cross,
    href: "/lessons"
  },
  {
    title: "Parables",
    body: "Good Samaritan, Prodigal Son, and other teaching stories of Jesus.",
    icon: BookOpen,
    href: "/lessons"
  },
  {
    title: "Miracles",
    body: "Feeding 5000, walking on water, and God's amazing power.",
    icon: Star,
    href: "/lessons"
  }
] as const;

const testimonials = [
  {
    name: "Sarah Martinez",
    church: "First Baptist Church",
    initials: "SM",
    quote:
      "Friends in the Children Ministries has transformed my lesson planning. Everything I need is in one place."
  },
  {
    name: "James Thompson",
    church: "Grace Community Church",
    initials: "JT",
    quote: "The age-appropriate content is exactly what I needed. My kids are more engaged than ever before."
  },
  {
    name: "Lisa Williams",
    church: "St. Paul's Methodist",
    initials: "LW",
    quote: "The downloadable resources are professional, practical, and save me so much preparation time."
  }
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="blue-hero text-white">
        <div className="page-shell grid gap-12 py-16 md:grid-cols-[2fr_1fr] md:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <Star size={16} className="text-blue-100" />
              Growing Community of Teachers
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                Welcome to Friends in the Children Ministries
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-white/90 md:text-xl">
                Empowering Sunday school teachers with engaging biblical lessons, multimedia
                resources, and teaching tools designed to bring God's Word to life.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 rounded-md bg-blue-950 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-900"
              >
                <PlayCircle size={19} />
                Start Teaching Today
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/95 px-5 py-3 font-semibold text-blue-900 hover:bg-white"
              >
                <Download size={19} />
                Free Resources
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/90">
              {heroChecks.map((check) => (
                <li key={check} className="inline-flex items-center gap-2">
                  <CheckCircle size={17} className="text-blue-100" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-[15px] bg-white/10 p-2 legacy-shadow">
            <Image
              src="/ministry-hero.png"
              alt="Illustration of a Sunday School teacher guiding children around an open lesson book"
              width={1600}
              height={1000}
              priority
              className="aspect-[16/10] h-auto w-full rounded-[12px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b-[3px] border-blue-500 bg-white py-12">
        <div className="page-shell text-center">
          <h2 className="text-3xl font-semibold">Find the Perfect Lesson</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Search through our collection of Bible lessons by story, scripture, or theme.
          </p>
          <form
            action="/lessons"
            className="mx-auto mt-8 flex max-w-2xl items-center rounded-full border-[3px] border-border bg-white p-2 legacy-shadow"
          >
            <input
              name="q"
              placeholder="Search for David and Goliath, Genesis 1, courage..."
              className="min-w-0 flex-1 rounded-full px-5 py-3 text-base outline-none"
            />
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white" type="submit">
              <Search size={21} />
            </button>
          </form>
          <p className="mt-5 text-sm text-muted-foreground">
            Popular: David and Goliath, Creation, Courage, Miracles
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="page-shell">
          <h2 className="text-center text-3xl font-semibold">Start Teaching in Minutes</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Everything you need for an engaging Sunday school lesson.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-[10px] border border-border border-l-4 border-l-blue-500 bg-white p-6 text-center legacy-shadow transition hover:-translate-y-1"
              >
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white">
                  <section.icon size={34} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{section.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
                <p className="mt-4 rounded-md bg-sky-50 px-3 py-2 text-sm font-semibold text-blue-900">
                  {section.detail}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-800">
                  Explore <FileText size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="blue-hero py-16 text-white">
        <div className="page-shell">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white">Explore Bible Stories by Topic</h2>
            <p className="mt-3 text-white/90">
              Discover lessons organized by biblical themes and stories.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {topics.map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className="rounded-[15px] border border-white/20 bg-white/10 p-7 text-center backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
              >
                <topic.icon className="mx-auto" size={46} />
                <h3 className="mt-5 text-xl font-semibold text-white">{topic.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/85">{topic.body}</p>
                <span className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-800">
                  Explore Stories
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="page-shell">
          <h2 className="text-center text-3xl font-semibold">
            Why Teachers Love Friends in the Children Ministries
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-muted-foreground">
            Join our growing community of Sunday school teachers using our platform.
          </p>
          <div className="mt-10 grid gap-6 rounded-[20px] bg-gradient-to-br from-white to-sky-50 p-6 legacy-shadow md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="relative overflow-hidden rounded-[15px] bg-white p-6 text-center shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-800" />
                <stat.icon className="mx-auto text-blue-500" size={38} />
                <p className="mt-4 font-serif text-4xl font-bold text-blue-800">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky-50 py-16">
        <div className="page-shell">
          <h2 className="text-center text-3xl font-semibold">What Teachers Are Saying</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Real feedback from Sunday school teachers.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="relative rounded-[15px] border-t-4 border-blue-500 bg-white p-7 legacy-shadow"
              >
                <span className="absolute -top-3 left-7 rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white">
                  5 STARS
                </span>
                <p className="mt-4 text-sm italic leading-7 text-muted-foreground">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.church}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-[20px] bg-gradient-to-br from-blue-800 to-cyan-500 p-8 text-center text-white">
            <h2 className="text-3xl font-semibold text-white">Ready to Transform Your Teaching?</h2>
            <p className="mx-auto mt-3 max-w-3xl text-white/90">
              Join our growing community of teachers who have discovered the joy of stress-free
              lesson planning.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 font-semibold text-blue-800"
              >
                <Rocket size={18} />
                Start Teaching Today
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-md border-2 border-white px-5 py-3 font-semibold text-white"
              >
                <Download size={18} />
                Get Free Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
