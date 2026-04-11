import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Setup Call - REBB Advisors",
  description:
    "Book a setup call with REBB Advisors to see whether a private Company Brain is a good fit for your owner-led service business.",
  alternates: { canonical: "https://rebbadvisors.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
