import { ReactNode } from "react";
import { signOut } from "../login/actions";
import { getCurrentUser } from "../_lib/auth";
import DashNav, { type DashNavKey } from "./DashNav";

interface Props {
  title: string;
  subtitle: string;
  active: DashNavKey;
  stats?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}

export default async function DashboardShell({
  title,
  subtitle,
  active,
  stats,
  filters,
  children,
}: Props) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen theme-text-primary">
      <div className="border-b theme-border">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest theme-label">
                  REBB Advisors
                </span>
                <DashNav active={active} />
              </div>
              <h1 className="text-2xl font-bold theme-text-primary">{title}</h1>
              <p className="text-sm theme-text-muted mt-1">{subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs theme-text-muted mb-1">{user?.email}</p>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs theme-text-muted hover:theme-text-primary transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          {stats && (
            <div className="flex flex-wrap gap-8 mt-6">{stats}</div>
          )}
          {filters && (
            <div className="mt-4">{filters}</div>
          )}
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
