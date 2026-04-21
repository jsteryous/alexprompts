type Tone = "default" | "hot" | "warm" | "good" | "muted";

interface Props {
  label: string;
  value: number | string;
  tone?: Tone;
}

const TONE_CLASS: Record<Tone, string> = {
  default: "theme-text-primary",
  hot:     "tone-hot-text",
  warm:    "tone-warm-text",
  good:    "tone-good-text",
  muted:   "theme-text-secondary",
};

export default function StatTile({ label, value, tone = "default" }: Props) {
  return (
    <div>
      <p className={`text-2xl font-bold ${TONE_CLASS[tone]}`}>{value}</p>
      <p className="text-xs theme-text-muted">{label}</p>
    </div>
  );
}
