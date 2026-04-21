import Link from "next/link";

export type DashNavKey = "leads" | "prospects";

const TABS: { href: string; label: string; key: DashNavKey }[] = [
  { href: "/dashboard",           label: "Leads",     key: "leads" },
  { href: "/dashboard/prospects", label: "Prospects", key: "prospects" },
];

export default function DashNav({ active }: { active: DashNavKey }) {
  return (
    <div className="flex items-center gap-1">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
            active === t.key
              ? "theme-card-strong theme-text-primary border theme-border"
              : "theme-text-muted hover:theme-text-primary"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
