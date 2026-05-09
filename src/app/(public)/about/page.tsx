import { BookOpen, Download, Users, Video } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/public/page-hero";

const offerings = [
  {
    title: "Comprehensive Lesson Plans",
    body: "Objectives, content, discussion prompts, and activity suggestions tailored to age groups.",
    icon: BookOpen
  },
  {
    title: "Multimedia Resources",
    body: "Video, audio, and visual aids that help Bible stories land with modern learners.",
    icon: Video
  },
  {
    title: "Downloadable Materials",
    body: "Worksheets, coloring pages, craft templates, and classroom printables ready to use.",
    icon: Download
  },
  {
    title: "Age-Appropriate Content",
    body: "Material shaped for ages 3-5, 6-9, 10-12, and teens with the right language and pacing.",
    icon: Users
  }
] as const;

export default function AboutPage() {
  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="About Us"
        title="Equipping Sunday school teachers with quality biblical resources."
        description="The mission and story from the original site stay intact here: less time hunting for materials, more time connecting children to God's Word."
      />

      <section className="page-shell py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <article className="rounded-[16px] bg-white p-8 legacy-shadow">
            <h2 className="text-3xl font-semibold text-blue-900">Our Mission</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Friends in the Children Ministries exists to equip Sunday school teachers with the
              resources they need to teach God&apos;s Word in engaging, age-appropriate ways.
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              We believe every child deserves to hear Bible stories in ways that help them
              understand God&apos;s love and plan for their lives.
            </p>
          </article>

          <article className="rounded-[16px] bg-white p-8 legacy-shadow">
            <h2 className="text-3xl font-semibold text-blue-900">What We Offer</h2>
            <div className="mt-8 grid gap-6">
              {offerings.map((offering) => (
                <div key={offering.title} className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                    <offering.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{offering.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{offering.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[16px] bg-white p-8 legacy-shadow">
            <h2 className="text-3xl font-semibold text-blue-900">Our Story</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              This ministry platform began with a simple classroom problem: teachers were spending
              too much time piecing materials together from scattered sources.
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              The rebuild keeps the same heart while modernizing the delivery, content structure,
              and future publishing workflow.
            </p>
          </article>

          <article className="rounded-[16px] bg-gradient-to-br from-blue-800 to-cyan-500 p-8 text-center text-white">
            <h2 className="text-3xl font-semibold text-white">Join Our Community</h2>
            <p className="mx-auto mt-3 max-w-3xl text-white/90">
              Become part of a growing community of Sunday school teachers dedicated to sharing
              God&apos;s Word with the next generation.
            </p>
            <Link
              href="/lessons"
              className="mt-6 inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-800"
            >
              Start Teaching Today
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
