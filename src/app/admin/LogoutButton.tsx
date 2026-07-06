"use client";

import { useTransition } from "react";

export default function LogoutButton() {
  const [pending, start] = useTransition();
  function logout() {
    start(async () => {
      await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
      window.location.reload();
    });
  }
  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="text-sm text-gray-500 hover:text-black disabled:opacity-40"
    >
      {pending ? "…" : "Log out"}
    </button>
  );
}
