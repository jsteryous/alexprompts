import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Free Website Screenshots - REBB Advisors",
  description:
    "Send REBB Advisors your website. You get clear screenshots of what is broken and a written proposal naming the tier that actually fits your practice \u2014 or none, if the site is already fine.",
  alternates: { canonical: "https://rebbadvisors.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
