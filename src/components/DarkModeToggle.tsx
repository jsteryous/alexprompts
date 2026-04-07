"use client";

import { useTheme } from "./ThemeProvider";

export default function DarkModeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors bg-[#0d1f16] border border-[#2a5c3a] hover:bg-[#122a1c] dark:bg-[#1a3525] dark:hover:bg-[#204030]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
    >
      {theme === "dark" ? (
        // Sun icon
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#86efac" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Moon icon
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#86efac" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
