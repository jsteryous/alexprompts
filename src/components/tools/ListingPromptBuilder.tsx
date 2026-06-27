"use client";

import { useMemo, useState } from "react";

/**
 * Listing prompt builder. The most on-brand "tool" on the site: it does not write
 * the listing, it builds a ready-to-paste Claude prompt that does, with fair-housing
 * guardrails baked in. Zero API cost. "Copy" and "Open in Claude" both ship the
 * same prompt. This turns the brand promise (point Claude at your work) into a
 * thing a visitor does in 30 seconds.
 */

const PROPERTY_TYPES = [
  "Single-family home",
  "Condo",
  "Townhouse",
  "Multi-family",
  "Land / lot",
  "Commercial",
] as const;

const TONES = [
  { value: "warm", label: "Warm and inviting" },
  { value: "professional", label: "Clean and professional" },
  { value: "luxury", label: "Upscale and polished" },
  { value: "punchy", label: "Short and punchy" },
] as const;

const LENGTHS = [
  { value: "short", label: "Short (~80 words)" },
  { value: "standard", label: "Standard (~150 words)" },
  { value: "long", label: "Detailed (~250 words)" },
] as const;

function buildPrompt(v: {
  type: string;
  beds: string;
  baths: string;
  sqft: string;
  location: string;
  features: string;
  tone: string;
  length: string;
}): string {
  const toneLabel = TONES.find((t) => t.value === v.tone)?.label ?? v.tone;
  const lengthLabel = LENGTHS.find((l) => l.value === v.length)?.label ?? v.length;

  const specs = [
    `- Property type: ${v.type}`,
    v.beds && `- Bedrooms: ${v.beds}`,
    v.baths && `- Bathrooms: ${v.baths}`,
    v.sqft && `- Size: ${v.sqft} sq ft`,
    v.location && `- Location: ${v.location}`,
    v.features && `- Notable features: ${v.features}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are an expert real estate copywriter. Write a property listing for the home below.

Details:
${specs}

Write it ${toneLabel.toLowerCase()}, ${lengthLabel.toLowerCase()}.

Structure the output as:
1. A headline of 6 to 10 words.
2. The body description.
3. Three to five bullet highlights.
4. One closing line that invites a showing.

Rules:
- Follow Fair Housing law. Describe the property and the neighborhood, never the kind of person who should live there. Do not mention or imply race, color, religion, national origin, sex, familial status, disability, or use phrases like "perfect for families," "great for a young couple," "walking distance" (use the distance instead), or "safe neighborhood."
- Only use the facts I gave you. Do not invent features, schools, or amenities. If something would strengthen the listing but I did not provide it, end your reply with a short list of questions asking for it.
- Plain, concrete language. No hype words like "stunning," "dream," or "must-see."

Write the listing now.`;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="theme-text-secondary text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function ListingPromptBuilder() {
  const [v, setV] = useState({
    type: PROPERTY_TYPES[0] as string,
    beds: "3",
    baths: "2",
    sqft: "1850",
    location: "Augusta Road, Greenville SC",
    features: "renovated kitchen, fenced backyard, two-car garage, new roof 2024",
    tone: "warm",
    length: "standard",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((p) => ({ ...p, [k]: val }));
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildPrompt(v), [v]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  const inputCls = "theme-field w-full px-3 py-2.5 text-sm";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <div className="sm:col-span-2">
          <Field label="Property type">
            <select className={inputCls} value={v.type} onChange={(e) => set("type")(e.target.value)}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Bedrooms">
          <input className={inputCls} value={v.beds} onChange={(e) => set("beds")(e.target.value)} />
        </Field>
        <Field label="Bathrooms">
          <input className={inputCls} value={v.baths} onChange={(e) => set("baths")(e.target.value)} />
        </Field>
        <Field label="Square feet">
          <input className={inputCls} value={v.sqft} onChange={(e) => set("sqft")(e.target.value)} />
        </Field>
        <Field label="Location">
          <input className={inputCls} value={v.location} onChange={(e) => set("location")(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notable features">
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={v.features}
              onChange={(e) => set("features")(e.target.value)}
              placeholder="renovated kitchen, large lot, new HVAC..."
            />
          </Field>
        </div>
        <Field label="Tone">
          <select className={inputCls} value={v.tone} onChange={(e) => set("tone")(e.target.value)}>
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Length">
          <select className={inputCls} value={v.length} onChange={(e) => set("length")(e.target.value)}>
            {LENGTHS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      </form>

      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
            Your Claude prompt
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copy}
              className="theme-cta text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={claudeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-cta-accent text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center"
            >
              Open in Claude
            </a>
          </div>
        </div>
        <pre className="theme-card-strong border theme-border rounded-xl p-5 text-xs leading-relaxed theme-text-secondary whitespace-pre-wrap font-sans flex-1 overflow-auto">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
