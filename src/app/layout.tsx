import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "REBB Advisors — Automated Lead Systems for Local Service Businesses",
  description:
    "We install automated lead capture and follow-up systems for local service businesses so they never miss a lead again.",
  openGraph: {
    title: "REBB Advisors",
    description:
      "Stop losing leads. We install systems that respond instantly and follow up until the job is booked.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
