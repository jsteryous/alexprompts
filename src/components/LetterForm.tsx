"use client";

import { useState } from "react";
import { LETTER_MAX, LETTER_MIN, SIGNED_MAX } from "@/lib/letters";

/**
 * The reader's side of Letters to the Editor (src/lib/letters.ts). Posts to
 * /api/letters. `company` is a honeypot, hidden from people and filled by bots.
 */

type State = "idle" | "submitting" | "done" | "error";

export function LetterForm() {
  const [body, setBody] = useState("");
  const [signed, setSigned] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, signed, email: email.trim() || undefined, company }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState("done");
      } else {
        setState("error");
        setMessage(typeof json.error === "string" && json.error.includes(" ") ? json.error : "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Could not reach the paper. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-10">
        <p className="theme-text-primary font-serif italic text-[1.375rem] mb-2">Your letter is on the Editor&rsquo;s desk.</p>
        <p className="theme-text-secondary type-small">
          He reads every one. If yours is printed, it will appear under Letters to the Editor in a coming number.
        </p>
      </div>
    );
  }

  const short = body.trim().length < LETTER_MIN;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="letter-body" className="type-eyebrow theme-text-muted block mb-2">
          Dear Editor:
        </label>
        <textarea
          id="letter-body"
          required
          rows={9}
          maxLength={LETTER_MAX}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="theme-field w-full px-4 py-3 font-serif text-[1.0625rem] leading-relaxed"
        />
        <p className="type-small theme-text-muted mt-1 text-right">
          {body.length} / {LETTER_MAX}
        </p>
      </div>
      <div>
        <label htmlFor="letter-signed" className="type-eyebrow theme-text-muted block mb-2">
          Signed
        </label>
        <input
          id="letter-signed"
          required
          maxLength={SIGNED_MAX}
          value={signed}
          onChange={(e) => setSigned(e.target.value)}
          placeholder="Your name, or a pen name and your street, as in A Banker, Augusta Road"
          className="theme-field w-full px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label htmlFor="letter-email" className="type-eyebrow theme-text-muted block mb-2">
          Email (optional, never printed)
        </label>
        <input
          id="letter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="theme-field w-full px-4 py-3 text-sm"
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px]" tabIndex={-1}>
        <label htmlFor="letter-company">Company</label>
        <input id="letter-company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <button
        type="submit"
        disabled={state === "submitting" || short}
        className="theme-cta-accent font-semibold px-6 py-3 disabled:opacity-60"
      >
        {state === "submitting" ? "Posting..." : "Post it to the Editor"}
      </button>
      {state === "error" && <p className="tone-hot-text text-sm">{message}</p>}
    </form>
  );
}
