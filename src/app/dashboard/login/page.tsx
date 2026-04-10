import type { Metadata } from "next";
import { signIn } from "./actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-2">
            REBB Advisors
          </p>
          <h1 className="text-xl font-bold text-white">LLC Owner Finder</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to view the ranked call list</p>
        </div>

        {/* Form */}
        <form action={signIn} className="space-y-4">
          {/* Preserve the intended destination after login */}
          <input type="hidden" name="next" value={next ?? "/dashboard"} />

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="alex@rebbadvisors.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center">
              Invalid email or password.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold text-sm py-3 rounded-lg transition-colors mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
