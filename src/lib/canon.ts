/**
 * THE CANON (October 16, 2026). What the press must never contradict.
 *
 * The press sees the last four numbers in full and nothing older, so without
 * this file the cast forgets itself within a fortnight (Alex, Notion new 6).
 * The press door's GET sends three things:
 *
 * - `CANON`, written by hand: the fixed facts about each character and place,
 *   the open threads, and the season's one slow arc. A Claude session or the
 *   Publisher edits it here; the press only reads it.
 * - the record, built from every printed number: each sentence in the Editor's
 *   departments that names a cast member, oldest first. It never forgets, and
 *   nobody has to keep it up. It is also the Morgue's character files to come.
 * - the spent list: every editorial, letter, notice and advertisement headline
 *   ever printed, so a merchant or a gag is not sold twice.
 *
 * When a printed number establishes a new fact that matters (a name, an age, a
 * possession, a place), the Publisher moves it into `fixed` here. A new
 * recurring character gets an entry with a `pattern`, which also gives the
 * Editor's office a file on them once it has a spot.
 */

export interface CanonEntry {
  key: string;
  name: string;
  /** Matches a sentence about this entry. Omit for the Editor, who is in every editorial. */
  pattern?: RegExp;
  fixed: string[];
}

export interface CanonThread {
  name: string;
  status: "open" | "closed";
  note: string;
}

export const CANON: {
  world: string[];
  cast: CanonEntry[];
  threads: CanonThread[];
  arc: { season: string; name: string; outline: string[] };
} = {
  world: [
    "The paper is printed today, in 2026, in the voice of a 1945 Greenville daily. Its people live in the present and talk like 1945; nobody in the paper is a time traveller and nobody remarks on the gap.",
    "The Editor writes as \"we\" in the editorial and the notices (\"our late father\", \"we replied\"). Others call him the Editor or Mr. Langston.",
    "The office faces the Evening Clarion's office across the street, in Greenville.",
    "Invented letter writers sign with a pseudonym and a real Greenville street. They are not characters and do not recur by name.",
  ],
  cast: [
    {
      key: "editor",
      name: "Mr. James T. Langston, Editor and Proprietor",
      fixed: [
        "Keeps his savings in a coffee tin and distrusts banks.",
        "Holds that every panic, bubble and most bad weather is the work of \"the railroad interest\", and has kept the position although most of the railroads have closed (No. 1).",
        "His late father bought a share in a branch line to nowhere in particular from Virgil Hatcher in 1998 (No. 1).",
        "Has not bought gasoline since Dewey drove the family Packard into a ditch while consulting his telephone (No. 2). The household owns a Packard.",
        "Once walked to Pelzer, and regards it as a long way (No. 2).",
        "Reaches for Scripture to win arguments and gets it slightly wrong; Mrs. Langston corrects him with chapter and verse (No. 2: \"the love of money\", 1 Timothy 6).",
        "Claims never to read the Clarion and not to know anyone there; mentions it anyway (No. 1).",
        "Knows the paper is composed by a machine and is uneasy about it.",
      ],
    },
    {
      key: "mrsLangston",
      name: "Mrs. Langston",
      pattern: /\bMrs\.? Langston\b/,
      fixed: [
        "Her first name is never printed, by anyone.",
        "Says little and is usually right. Corrects the Editor's Scripture (No. 2).",
        "Declined to make a pie of the 3,156 pound Rhode Island pumpkin (No. 2).",
        "Agreed to go across the street to the Clarion for the barometer when the Editor would not (No. 2).",
      ],
    },
    {
      key: "dewey",
      name: "Dewey, the Editor's nephew",
      pattern: /\bDewey\b/,
      fixed: [
        "About nineteen. Lives in his telephone, dances for it, breaks things.",
        "Knocked the barometer off the wall on a Monday demonstrating a dance from his telephone (No. 1).",
        "Was stationed at the front window to watch for the parcel and missed its delivery, owing to his telephone (No. 2).",
        "Drove the Packard into a ditch while consulting his telephone (No. 2).",
      ],
    },
    {
      key: "hatcher",
      name: "Virgil Hatcher",
      pattern: /\bHatcher\b/,
      fixed: [
        "Sold the Editor's late father a share in a branch line to nowhere in particular in 1998 (No. 1). The Editor's grudge is the whole of what is known about him.",
        "Has never appeared in person. His portrait hangs in the Editor's office on the site.",
      ],
    },
    {
      key: "clarion",
      name: "The Evening Clarion and its editor, Mr. Royce Whitfield",
      pattern: /\b(?:Clarion|Whitfield)\b/,
      fixed: [
        "The rival paper across the street. Printed the bank figures \"without a single word of alarm\" (No. 1).",
        "The Editor's barometer was signed for at the Clarion's office (No. 2).",
        "Mr. Royce Whitfield has not yet been named in print. Bring him in once, plainly, then at most once a week, always offstage.",
      ],
    },
    {
      key: "barometer",
      name: "The barometer",
      pattern: /\bbarometer\b/i,
      fixed: [
        "Knocked off the wall by Dewey (No. 1). The replacement left a warehouse in Spartanburg County, was reported delivered, and was signed for at the Clarion (No. 2).",
        "While it is missing, The Weather has no forecast from the household instrument.",
      ],
    },
  ],
  threads: [
    {
      name: "The barometer",
      status: "open",
      note: "Mrs. Langston is going over to the Clarion for it. Resolve it soon, ideally as the occasion that first names Mr. Royce Whitfield, then close it for good and let The Weather run a real forecast.",
    },
  ],
  arc: {
    season: "Autumn 2026 (to Christmas)",
    name: "The coffee tin",
    outline: [
      "The Editor keeps his savings in a coffee tin because he trusts no bank, which the paper's readers (bankers and lenders) will enjoy. Mrs. Langston, quietly, would like it in a bank.",
      "Through the autumn the question comes up no more than once a week, in the editorial or Around Town: a run on the tin's contents for the Packard's repair, Dewey proposing a bank on his telephone, the Editor touring a Greenville bank (invented, never a real one) and finding the vault insufficiently railroad-proof.",
      "By Christmas the Editor opens a passbook account, announces it as his own idea, and keeps one tin on the desk for the church's Christmas collection.",
      "This is the outline, not a script. The news always comes first, and the arc can wait a number or bend to a better joke the news offers, as long as it ends where it is written.",
    ],
  },
};

/** Words that end in a full stop without ending a sentence. */
const ABBREVIATION = /(?:^|[\s(“"])(Mr|Mrs|Ms|Dr|St|Mt|Jr|Sr|No|Co|Inc|Gov|Sen|Rep|Gen|Lt|Capt|Prof|Rev|U\.S|[A-Z])$/;

/** Sentence spans in a paragraph, so a snippet can link to its exact words. */
export function sentences(p: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  let start = 0;
  for (let i = 0; i < p.length; i++) {
    if (!".!?".includes(p[i])) continue;
    if (p[i] === "." && ABBREVIATION.test(p.slice(Math.max(0, i - 6), i))) continue;
    let end = i + 1;
    while (end < p.length && /["”’)\].!?]/.test(p[end])) end++;
    if (end < p.length && !/\s/.test(p[end])) continue;
    out.push({ start, end });
    start = end;
    while (start < p.length && /\s/.test(p[start])) start++;
    i = start - 1;
  }
  if (start < p.length && p.slice(start).trim()) out.push({ start, end: p.length });
  return out;
}

/** The Editor's departments, the only ones the cast may appear in. */
export interface InventedParts {
  number: number;
  editorial?: { headline?: string; paragraphs?: string[] } | null;
  letters?: { headline?: string; paragraphs?: string[]; reader?: boolean }[] | null;
  miscellany?: { headline?: string; paragraphs?: string[] }[] | null;
  advertisements?: { headline?: string; lines?: string[] }[] | null;
}

export interface CanonLine {
  number: number;
  text: string;
}

/** Most lines kept per cast member: the first ones set the facts, the last ones are fresh. */
const FIRST = 20;
const LAST = 60;

/**
 * Every sentence ever printed about each cast member, oldest first, and every
 * headline of the Editor's departments. `parts` may come in any order.
 */
export function canonRecord(parts: InventedParts[]): {
  record: Record<string, CanonLine[]>;
  spent: { number: number; department: string; headline: string }[];
} {
  const sorted = [...parts].sort((a, b) => a.number - b.number);
  const keyed = CANON.cast.filter((c): c is CanonEntry & { pattern: RegExp } => !!c.pattern);
  const record: Record<string, CanonLine[]> = Object.fromEntries(keyed.map((c) => [c.key, []]));
  const spent: { number: number; department: string; headline: string }[] = [];

  for (const e of sorted) {
    const items: [string, { headline?: string; paragraphs?: string[]; lines?: string[] }[]][] = [
      ["editorial", e.editorial ? [e.editorial] : []],
      // A real reader's words are theirs, not the canon's.
      ["letters", (e.letters ?? []).filter((l) => !l.reader)],
      ["miscellany", e.miscellany ?? []],
      ["advertisements", e.advertisements ?? []],
    ];
    for (const [department, list] of items) {
      for (const item of list) {
        if (item.headline) spent.push({ number: e.number, department, headline: item.headline });
        for (const para of [...(item.paragraphs ?? []), ...(item.lines ?? [])]) {
          if (typeof para !== "string") continue;
          for (const { start, end } of sentences(para)) {
            const text = para.slice(start, end).trim();
            if (text.length < 12) continue;
            for (const c of keyed) if (c.pattern.test(text)) record[c.key].push({ number: e.number, text });
          }
        }
      }
    }
  }

  for (const key of Object.keys(record)) {
    const lines = record[key];
    if (lines.length > FIRST + LAST) record[key] = [...lines.slice(0, FIRST), ...lines.slice(-LAST)];
  }
  return { record, spent };
}
