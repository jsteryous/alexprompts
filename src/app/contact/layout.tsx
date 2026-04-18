import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Free Website Screenshots - REBB Advisors",
  description:
    "Send REBB Advisors your website and get clear screenshots of what is broken, what needs cleanup, and whether the $1,200 website fix offer is the right fit.",
  alternates: { canonical: "https://rebbadvisors.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
