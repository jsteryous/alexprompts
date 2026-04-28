import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Free Website Screenshots - REBB Advisors",
  description:
    "Send REBB Advisors your website. Within 48 hours: screenshots of what is broken plus a written proposal \u2014 scope, price, timeline. Cleanup starts at $1,500. If your site is already fine, the proposal says so.",
  alternates: { canonical: "https://rebbadvisors.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
