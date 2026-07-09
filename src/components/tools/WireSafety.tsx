"use client";

import { useState } from "react";
import { extractDomain, runChecks, type Report } from "@/lib/wireSafety";

/**
 * Wire-fraud safety check. Buyers get spoofed emails with fake wiring
 * instructions days before closing, and the losses are life-changing, so this
 * tool lets them check the domain behind their instructions before money moves.
 * All the DNS/RDAP logic lives in src/lib/wireSafety.ts; this file is the UI.
 *
 * Design contract (do not loosen): the tool NEVER renders a "safe" verdict.
 * It reports verifiable public facts, renders every failed lookup as an honest
 * "could not check", and always leads with the one step that actually prevents
 * wire fraud, which is voice verification on a number the buyer already
 * trusts. A fact-checker with a checklist is defensible; a "fraud detector"
 * that blesses an email is a liability.
 */

type Tone = "good" | "warm" | "hot" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  good: "tone-good",
  warm: "tone-warm",
  hot: "tone-hot",
  neutral: "tone-neutral",
};

const TONE_LABEL: Record<Tone, string> = {
  good: "Good sign",
  warm: "Worth a closer look",
  hot: "Red flag",
  neutral: "Could not check",
};

interface Row {
  key: string;
  title: string;
  tone: Tone;
  body: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function buildRows(r: Report): Row[] {
  if (r.nxdomain) {
    return [
      {
        key: "exists",
        title: "This domain does not exist",
        tone: "hot",
        body:
          `Nothing answers for ${r.host}. No website and no mail server exist at this name. ` +
          "First double-check that you typed the domain exactly as it appears in the email. " +
          "If you did, an email claiming to come from this domain is a serious red flag. " +
          "Stop and call your closing office at a number you already trust.",
      },
    ];
  }

  const rows: Row[] = [];

  if (r.freeMail) {
    rows.push({
      key: "freemail",
      title: "This is a free personal email service",
      tone: "warm",
      body:
        `${r.reg} is a free consumer mail provider, so the technical checks below pass because the provider itself is well run. ` +
        "The catch is that anyone can open an address there in minutes. " +
        "A title company or law office sending wiring instructions from a free personal address is a warning sign on its own, so verify by phone before acting on anything.",
    });
  }

  if (r.resolves === null) {
    rows.push({
      key: "exists",
      title: "Domain lookup did not complete",
      tone: "neutral",
      body: "The basic lookup for this domain did not complete. Check your connection and try again in a moment.",
    });
  } else if (r.resolves || r.mx) {
    rows.push({
      key: "exists",
      title: "The domain is real",
      tone: r.mx ? "good" : "warm",
      body: r.mx
        ? `${r.host} is live on the internet and publishes mail server records, so it is genuinely set up to send and receive email.`
        : `${r.host} is live on the internet but publishes no mail server records, so it is not set up to receive email. That is unusual for a business you are in escrow with and worth asking about.`,
    });
  } else {
    rows.push({
      key: "exists",
      title: "The domain barely exists",
      tone: "warm",
      body: `${r.host} is registered but nothing answers there, no website and no mail server. That is unusual for an operating business and worth asking about.`,
    });
  }

  if (!r.freeMail) {
    if (r.spfFound === null) {
      rows.push({
        key: "spf",
        title: "Sender protection (SPF)",
        tone: "neutral",
        body: "The SPF lookup did not complete, so this check has no answer. Try again in a moment.",
      });
    } else if (r.spfFound) {
      rows.push({
        key: "spf",
        title: "Sender protection (SPF) is published",
        tone: "good",
        body:
          `${r.host} publishes an SPF record, which is a public list of the servers allowed to send its mail. ` +
          "Receiving mail systems use it to spot messages sent from anywhere else.",
      });
    } else {
      rows.push({
        key: "spf",
        title: "No sender protection (SPF) found",
        tone: "warm",
        body:
          `No SPF record was found for ${r.host}. Without one, mail systems have no list of which servers legitimately send this domain's mail, which makes the exact address easier to fake. ` +
          "It does not mean the business is a scam, but it does mean a faked message is more likely to get through.",
      });
    }

    if (r.dmarc === null) {
      rows.push({
        key: "dmarc",
        title: "Spoofing policy (DMARC)",
        tone: "neutral",
        body: "The DMARC lookup did not complete, so this check has no answer. Try again in a moment.",
      });
    } else if (
      r.dmarc.found &&
      (r.dmarc.policy === "reject" || r.dmarc.policy === "quarantine")
    ) {
      rows.push({
        key: "dmarc",
        title: "Spoofing policy (DMARC) is enforced",
        tone: "good",
        body:
          `A DMARC record is published with its policy set to ${r.dmarc.policy}. That tells mail providers to ` +
          (r.dmarc.policy === "reject"
            ? "reject messages that fail authentication outright, which is the strongest setting and blocks most exact-domain spoofing."
            : "send messages that fail authentication to spam, which blocks most exact-domain spoofing from reaching an inbox."),
      });
    } else if (r.dmarc.found) {
      rows.push({
        key: "dmarc",
        title: "Spoofing policy (DMARC) is not enforced",
        tone: "warm",
        body:
          "A DMARC record exists but its policy is set to monitoring only, so messages that fail authentication are reported to the domain owner rather than blocked. " +
          "A faked version of this exact address can still reach an inbox.",
      });
    } else {
      rows.push({
        key: "dmarc",
        title: "No spoofing policy (DMARC) found",
        tone: "warm",
        body:
          "No DMARC record was found. DMARC is the piece that tells mail providers what to do with a message that fails authentication, so without it a faked version of this exact address may still get through, even when SPF exists.",
      });
    }
  }

  if (r.ageChecked && r.regDate && r.ageDays !== null) {
    if (r.ageDays < 90) {
      rows.push({
        key: "age",
        title: "This domain is brand new",
        tone: "hot",
        body:
          `${r.reg} was registered on ${formatDate(r.regDate)}, about ${r.ageDays} days ago. ` +
          "Established title and law firms almost never send wiring instructions from a brand-new domain, and fraud domains are usually days or weeks old. " +
          "Treat mail from it with real suspicion and verify by phone before doing anything.",
      });
    } else if (r.ageDays < 540) {
      rows.push({
        key: "age",
        title: "This domain is fairly new",
        tone: "warm",
        body: `${r.reg} was registered on ${formatDate(r.regDate)}. A young domain proves nothing on its own, but fraud domains are rarely old ones, so newer domains deserve a closer read of every message.`,
      });
    } else {
      rows.push({
        key: "age",
        title: "The domain has history",
        tone: "good",
        body: `${r.reg} has been registered since ${formatDate(r.regDate)}. Age is not proof of anything, but wire-fraud domains are usually days or weeks old, so a long history is reassuring.`,
      });
    }
  } else {
    rows.push({
      key: "age",
      title: "Registration date",
      tone: "neutral",
      body: "The registration date could not be read from your browser for this domain ending. Nothing is wrong; some registries do not allow the lookup.",
    });
  }

  if (r.lookalikesChecked > 0) {
    if (r.lookalikeHits.length > 0) {
      rows.push({
        key: "lookalikes",
        title: `${r.lookalikeHits.length} live lookalike ${
          r.lookalikeHits.length === 1 ? "domain" : "domains"
        } found`,
        tone: "warm",
        body:
          `We checked ${r.lookalikesChecked} close spellings of ${r.reg}, covering swapped letters, missing letters, look-alike characters, and other endings. ` +
          `These are live on the internet right now: ${r.lookalikeHits.join(", ")}. ` +
          "A live lookalike is not automatically malicious, and companies sometimes register their own defensively, but mail from one of those spellings is not the same organization. " +
          "Read the sender address in your email character by character.",
      });
    } else {
      rows.push({
        key: "lookalikes",
        title: "No live lookalike domains found",
        tone: "good",
        body:
          `We checked ${r.lookalikesChecked} close spellings of ${r.reg}, covering swapped letters, missing letters, look-alike characters, and other endings, and none of them are live. ` +
          "A scammer could still register one tomorrow, so keep reading sender addresses closely.",
      });
    }
  }

  return rows;
}

const RED_FLAGS = [
  "The wiring instructions changed at the last minute, especially the bank name or the account number.",
  "The message pushes urgency and says the closing will fall through unless you wire today.",
  "The reply-to address is different from the sender address, or the domain is spelled slightly differently than earlier emails in the thread.",
  "The tone, signature, or timing feels different from every other message the office has sent you.",
  "You are asked to keep the wire confidential or discouraged from calling the office to confirm.",
];

export function WireSafety() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const host = extractDomain(raw);
    if (!host) {
      setError(
        "Enter the sender's email address or its domain, like closing@example-title.com or example-title.com.",
      );
      setReport(null);
      return;
    }
    setError(null);
    setLoading(true);
    setReport(null);
    try {
      setReport(await runChecks(host));
    } catch {
      setError("The checks did not complete. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const rows = report ? buildRows(report) : null;

  return (
    <div className="grid gap-6">
      {/* The advice that actually prevents wire fraud, shown before any check
          runs so even a visitor who never presses the button leaves with it. */}
      <div className="theme-card-strong border theme-border rounded-xl p-5 border-l-4 border-l-[var(--accent)]">
        <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
          The step that actually protects you
        </div>
        <p className="theme-text-secondary text-sm mt-2 leading-relaxed">
          {
            "Confirm wiring instructions by phone before you send anything, using a number you already trust from your contract, your agent, or the office you visited. Never call a number printed in the wiring email itself, because if the email is fake, that number is too. Real title companies expect this call. And if instructions change at the last minute, treat the change as fraud until a person you know confirms it by voice."
          }
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 max-w-xl">
        <label className="block">
          <span className="theme-text-secondary text-sm font-medium">
            The email address or domain that sent your wiring instructions
          </span>
          <input
            type="text"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="closing@example-title.com"
            autoComplete="off"
            spellCheck={false}
            className="theme-field w-full py-2.5 px-3 text-sm mt-1.5"
          />
          <span className="theme-text-muted text-xs mt-1.5 block">
            {
              "Everything runs in your browser. Lookups go straight to public DNS and registry services, and nothing you type is sent to this site or stored."
            }
          </span>
        </label>
        <div>
          <button
            type="submit"
            disabled={loading || !raw.trim()}
            className="theme-cta-accent font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check the domain"}
          </button>
        </div>
      </form>

      {error && (
        <div className="theme-card-muted border theme-border rounded-xl p-4 max-w-xl">
          <p className="theme-text-primary text-sm">{error}</p>
        </div>
      )}

      {report && rows && (
        <div className="grid gap-4">
          <p className="theme-text-muted text-sm">
            {"What public records say about "}
            <span className="theme-text-secondary font-medium">{report.host}</span>
            {
              ". None of these checks can prove an email is genuine; they can only surface red flags."
            }
          </p>
          {rows.map((row) => (
            <div key={row.key} className="theme-card-muted border theme-border rounded-xl p-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`${TONE_CLASS[row.tone]} border text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded`}
                >
                  {TONE_LABEL[row.tone]}
                </span>
                <span className="theme-text-primary font-bold">{row.title}</span>
              </div>
              <p className="theme-text-secondary text-sm mt-2.5 leading-relaxed">{row.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="theme-card-muted border theme-border rounded-xl p-5">
        <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
          The classic tells of a wire scam
        </div>
        <ul className="mt-3 grid gap-2">
          {RED_FLAGS.map((f) => (
            <li key={f} className="theme-text-secondary text-sm leading-relaxed flex gap-2.5">
              <span className="theme-label mt-0.5 shrink-0" aria-hidden>
                &gt;
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="theme-card-muted border theme-border rounded-xl p-5">
        <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
          If money has already gone out
        </div>
        <p className="theme-text-secondary text-sm mt-2 leading-relaxed">
          {
            "Act in the first hours. Call your bank's fraud line immediately and ask it to recall the wire and contact the receiving bank. Then file a complaint at ic3.gov, the FBI's Internet Crime Complaint Center, which can activate its Recovery Asset Team on domestic wires. Tell your closing office and your agent as well. Recovery is genuinely possible when it starts fast and rare when it starts days later."
          }
        </p>
      </div>
    </div>
  );
}
