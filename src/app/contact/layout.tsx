import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Call — REBB Advisors · Greenville SC",
  description:
    "Book a free 30-minute call with REBB Advisors. We'll audit your lead flow and show you exactly where you're losing jobs to competitors in Greenville County.",
  alternates: { canonical: "https://rebbadvisors.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
