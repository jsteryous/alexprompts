"use client";

import { useState, useTransition } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          window.location.reload();
          return;
        }
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Login failed (${res.status})`);
      } catch (exc) {
        setError((exc as Error).message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="bg-white border border-gray-200 rounded-2xl p-10 max-w-sm w-full"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-green-600">
          Alex Prompts · Admin
        </span>
        <h1 className="text-xl font-bold text-black mt-2 mb-6">Log in</h1>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full text-base text-black bg-white border border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none"
          />
        </label>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <button
          type="submit"
          disabled={pending || !password}
          className="w-full mt-6 bg-black text-white font-semibold text-sm px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          The password is your <code>PUBLISH_SECRET</code>. It is sent once and stored in
          an httpOnly cookie, never in the URL.
        </p>
      </form>
    </div>
  );
}
