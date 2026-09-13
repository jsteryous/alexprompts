"use client";

import {
  EditorContent,
  getMarkRange,
  useEditor,
  type Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { editorHtmlToMd } from "@/lib/editorMarkdown";
import { Figure } from "./Figure";

/**
 * The WYSIWYG body editor, modelled on Substack's composer.
 *
 * Nothing here is the source of truth: the document is loaded from `body_md`
 * and handed straight back as markdown on every change, so the site renderer,
 * the broadcast email, and all three content engines keep reading exactly what
 * they read before. `src/lib/editorMarkdown.ts` owns that conversion and
 * `scripts/checks/editor-roundtrip.mjs` proves it is lossless against every row
 * in the database.
 *
 * Five interactions carry the Substack feel, in order of how much they matter:
 * markdown input rules (typing `## ` still makes a heading, so muscle memory
 * survives), the selection bubble (highlight text, format it in place), the
 * link popover (put the caret in a link and its address is right there to
 * open, edit, or remove), the slash menu (`/` on an empty line for blocks), and
 * the gutter "+" beside an empty line, which opens that same menu for someone
 * who never learns to type a slash.
 */

interface Props {
  /** Initial document as HTML. Read ONCE; later changes are ignored on purpose,
   *  since re-seeding content under a live editor destroys the cursor. */
  initialHtml: string;
  /** Fires on every change with the document already converted to markdown. */
  onChange: (md: string) => void;
  /** Uploads a file and resolves to its public URL, or null on failure. */
  onUploadImage: (file: File) => Promise<string | null>;
  /** Handed the live editor once, so the page around it can move the caret in
   *  (the subtitle field passes it down on Enter). */
  onReady?: (editor: TiptapEditor) => void;
  placeholder?: string;
}

// Inline icon paths, so the toolbar costs no extra request and inherits
// currentColor in both themes.
const I = {
  bold: "M6 4h5.5a3.5 3.5 0 0 1 0 7H6zm0 7h6.5a3.5 3.5 0 0 1 0 7H6z",
  italic: "M10 4h6M8 16h6M13 4l-3 12",
  link: "M9 13a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 0 0-5.66-5.66l-1.3 1.3M11 7a4 4 0 0 0-5.66 0L2.51 9.83a4 4 0 0 0 5.66 5.66l1.3-1.3",
  quote:
    "M8 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v2a2 2 0 0 1-2 2M17 6h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v2a2 2 0 0 1-2 2",
  bullet: "M4 6h.01M4 12h.01M4 18h.01M9 6h11M9 12h11M9 18h11",
  ordered: "M4 6h1v4M4 10h2M6 15H4v-1l2-1v-1H4M9 6h11M9 12h11M9 18h11",
  image: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6",
  divider: "M3 12h18",
  strike: "M5 12h14M8 8a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3M8 16a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3",
  heading: "M5 5v14M15 5v14M5 12h10",
};

// How tall the sticky editor header is, and roughly how tall a floating menu
// runs. These only decide whether a menu opens above its text or below it, so
// being a few pixels out costs nothing. What they prevent is a bubble that
// opens underneath the header or a slash menu that runs off the bottom of the
// screen, both of which put a control out of reach.
const HEADER_H = 56;
const BUBBLE_H = 44;
const MENU_ROW_H = 38;

/**
 * Horizontal center of a selection's full bounding box, in viewport pixels.
 * `coordsAtPos` on the endpoints alone is wrong for a selection that wraps:
 * the last line's right edge sits near the left margin, which pulls the bubble
 * away from the text it belongs to.
 */
function rangeCenter(editor: TiptapEditor, from: number, to: number): number {
  let min = Infinity;
  let max = -Infinity;
  // Sample the endpoints and the line breaks between them. A handful of probes
  // is enough to bound the box and costs nothing next to a full DOM range walk.
  const step = Math.max(1, Math.floor((to - from) / 24));
  for (let pos = from; pos <= to; pos += step) {
    const c = editor.view.coordsAtPos(Math.min(pos, to));
    min = Math.min(min, c.left);
    max = Math.max(max, c.right);
  }
  return (min + max) / 2;
}

/**
 * Addresses this editor will put behind words, and nothing else.
 *
 * `javascript:` is the one that matters. An anchor carrying it runs code in
 * whoever clicks it, and the person clicking here is signed into /admin, whose
 * cookie can publish. The list is short because a publication links to pages,
 * mail, and phone numbers, and has never had cause to link to anything else.
 */
const SAFE_HREF = /^(?:https?|mailto|tel):/i;

/** True for an address that is safe to hand to an `href`. */
function isSafeHref(href: string): boolean {
  const url = href.trim();
  return SAFE_HREF.test(url) || url.startsWith("/") || url.startsWith("#");
}

/**
 * What a person types in the link field, turned into an href, or null when it
 * is not something this editor will link to.
 *
 * Typing a bare domain is the common case and it must not produce a relative
 * link, which is what `href="greenvillejournal.com"` means to a browser. A
 * site-relative path and an in-page anchor pass through as written.
 *
 * A scheme that is not on the safe list is REJECTED rather than passed along.
 * It used to pass, and that was a real hole rather than a theoretical one: the
 * no-selection branch of `applyLink` writes the link mark straight into the
 * document with `insertContentAt`, which goes around the validation TipTap does
 * inside `setLink`, so a `javascript:` address typed or pasted here reached the
 * mark intact. TipTap blanks such an href when it RENDERS, which is why the
 * prose itself was never the problem, and why the popover below has to run the
 * same check: it reads the address off the mark, where the raw text still sits,
 * and draws it as an anchor outside the editor where a click would fire.
 */
function toHref(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  if (isSafeHref(url)) return url;
  // Scheme-shaped but not on the list. Not a link, and not something to
  // quietly rewrite into one either.
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
}

/** The href the way a reader would say it: no scheme, no trailing slash, clipped. */
function prettyHref(href: string): string {
  const bare = href.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return bare.length > 36 ? `${bare.slice(0, 35)}…` : bare;
}

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

function BubbleBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      // Keep the DOM selection alive: mousedown would otherwise blur the editor
      // and collapse the very range this button is about to format.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      data-active={active ? "true" : undefined}
      className="h-9 min-w-9 px-2 inline-flex items-center justify-center rounded-md transition-colors"
    >
      {children}
    </button>
  );
}

/** A floating popover anchored to a run of text: where it sits, and which way
 *  it hangs off that text. */
type Bubble = {
  top: number;
  left: number;
  /** No room above (the sticky header is in the way), so it hangs underneath. */
  below: boolean;
  /** "format" is the selection toolbar; "link" is the address of the link the
   *  caret is sitting in. */
  kind: "format" | "link";
  href: string;
};

/** An open URL field, and the range it will apply to. Held apart from the
 *  editor's live selection because the field takes focus away from the editor
 *  the moment it opens. */
type LinkEdit = {
  from: number;
  to: number;
  /** Nothing was selected, so applying has to write the link's text too. */
  insert: boolean;
};

/** An open block menu: where it sits, what it is filtering on, and how many
 *  characters of typed trigger to remove before running the command. */
type BlockMenu = {
  top: number;
  left: number;
  below: boolean;
  query: string;
  from: number;
  chars: number;
};

type SlashItem = {
  label: string;
  hint: string;
  icon: string;
  /** Extra things to type for it. On the label alone, `/h2` and `/ul` miss. */
  keys: string[];
  run: (e: TiptapEditor) => void;
};

const SLASH_ITEMS: SlashItem[] = [
  {
    label: "Heading",
    hint: "Section title",
    icon: I.heading,
    keys: ["h2", "title"],
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Subheading",
    hint: "Smaller title",
    icon: I.heading,
    keys: ["h3"],
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bulleted list",
    hint: "Unordered",
    icon: I.bullet,
    keys: ["ul", "bullets"],
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    hint: "Ordered",
    icon: I.ordered,
    keys: ["ol", "123"],
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Quote",
    hint: "Pull a passage out",
    icon: I.quote,
    keys: ["blockquote"],
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Divider",
    hint: "Horizontal rule",
    icon: I.divider,
    keys: ["hr", "rule", "break"],
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  // Handled by runSlash, which opens the file picker instead.
  { label: "Image", hint: "Upload a photo", icon: I.image, keys: ["img", "photo"], run: () => {} },
];

function matchItems(query: string): SlashItem[] {
  const q = query.toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (it) => it.label.toLowerCase().includes(q) || it.keys.some((k) => k.startsWith(q)),
  );
}

/** The range of the link mark the caret is inside, or null. */
function linkRangeAt(editor: TiptapEditor) {
  const type = editor.schema.marks.link;
  if (!type) return null;
  return getMarkRange(editor.state.selection.$from, type) ?? null;
}

export default function RichText({
  initialHtml,
  onChange,
  onUploadImage,
  onReady,
  placeholder,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // The editor is created once, so its callbacks must not close over a stale
  // prop. Route them through refs that an effect keeps current.
  const onChangeRef = useRef(onChange);
  const uploadRef = useRef(onUploadImage);
  const readyRef = useRef(onReady);
  useEffect(() => {
    onChangeRef.current = onChange;
    uploadRef.current = onUploadImage;
    readyRef.current = onReady;
  }, [onChange, onUploadImage, onReady]);

  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [linkEdit, setLinkEdit] = useState<LinkEdit | null>(null);
  const [linkValue, setLinkValue] = useState("");
  // THE LINK BUTTON BUG, and why this is a ref rather than state.
  //
  // The URL field autofocuses, which blurs ProseMirror, which fired the blur
  // handler below, which tore down the bubble the field lives in. The button
  // opened a panel that unmounted itself in the same commit, so a link could
  // never be typed at all. The handlers have to know the field is open at the
  // instant that blur arrives, which is during React's commit phase, before any
  // effect has run: a ref set in the same click that opens the field is current
  // by then, and state read through an effect is not.
  const linkEditRef = useRef(false);
  const [slash, setSlash] = useState<BlockMenu | null>(null);
  // The same list, opened from the gutter "+" instead of a typed "/". Kept in
  // its own state because `detect` below closes the typed menu on every
  // keystroke that stops matching, and that must not reach into this one.
  const [picker, setPicker] = useState<BlockMenu | null>(null);
  // Vertical offset of the gutter "+", or null when the caret is not on an
  // empty paragraph. Substack shows the same affordance in the same place.
  const [plusTop, setPlusTop] = useState<number | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  // Tracks whether the menu is already open, so re-detecting on each keystroke
  // does not reset the highlighted row out from under the arrow keys.
  const slashOpenRef = useRef(false);
  const closeSlash = useCallback(() => {
    slashOpenRef.current = false;
    setSlash((prev) => (prev === null ? prev : null));
  }, []);
  const closeMenus = useCallback(() => {
    closeSlash();
    setPicker(null);
  }, [closeSlash]);

  const editorRef = useRef<TiptapEditor | null>(null);

  const insertImages = useCallback(async (files: File[]) => {
    for (const file of files) {
      const url = await uploadRef.current(file);
      const ed = editorRef.current;
      if (url && ed) {
        ed.chain()
          .focus()
          .insertContent({ type: "figure", attrs: { src: url, alt: "" } })
          .run();
      }
    }
  }, []);

  const editor = useEditor({
    // Next renders this on the server first; TipTap needs the browser DOM.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // The article page already owns the h1, so a body h1 would be a second
        // one on the page. Headings start at h2, matching every engine body.
        heading: { levels: [2, 3, 4] },
        // Registered below instead, because the stock one has to be extended.
        link: false,
        // Nothing published here is code, and a stray fence in prose is more
        // likely a mistake than an intent.
        codeBlock: false,
        // Markdown has no underline and neither does the site's renderer, so
        // turndown drops a <u> and keeps its text. Left on, StarterKit binds
        // Ctrl+U to a mark that looks applied, stays through the save, and is
        // simply gone on the next load with nothing to say it went. Off, Ctrl+U
        // does nothing, which is the honest answer.
        underline: false,
      }),
      // THE LINK THAT ATE THE NEXT SENTENCE.
      //
      // TipTap ties the mark's `inclusive` flag to `autolink`, so with autolink
      // on, a link mark swallows whatever is typed straight after it: writing
      // "per the Greenville Journal." and carrying on with " See also" dragged
      // those words inside the citation, permanently and in the saved markdown.
      // Autolink itself does not need the flag, since its plugin works out the
      // URL's range from the text and applies the mark over exactly that, so
      // turning the flag off keeps a typed address linking itself on the space
      // bar and keeps a hand-made link the length its author made it.
      Link.extend({ inclusive: () => false }).configure({
        openOnClick: false,
        autolink: true,
        // TipTap's own default here is "http", so typing a bare domain used to
        // autolink it to an insecure URL that half the web now redirects.
        defaultProtocol: "https",
      }),
      Figure,
      Placeholder.configure({
        placeholder: ({ editor: ed, node }) => {
          if (node.type.name === "figure") return "Write a caption…";
          if (node.type.name !== "paragraph") return "";
          // The empty document gets the whole invitation. Every empty line
          // after it gets the short reminder, which is how Substack keeps the
          // affordance in front of you without repeating the sentence.
          return ed.isEmpty
            ? (placeholder ?? "Write. Type / for blocks, or paste an image right in.")
            : "Type / for blocks";
        },
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose theme-prose max-w-none focus:outline-none min-h-[55vh]",
        spellcheck: "true",
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (!files.length) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (!files.length) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => onChangeRef.current(editorHtmlToMd(ed.getHTML())),
  },
  // Build once. Handing useEditor a fresh options object every render makes it
  // re-apply them, and re-applying options dispatches a transaction; with the
  // listeners below setting state on each one, that rendered again and locked
  // the tab up. Every prop the editor needs already goes through a ref.
  []);
  useEffect(() => {
    editorRef.current = editor;
    if (editor) readyRef.current?.(editor);
  }, [editor]);

  // Position the selection bubble and the link popover. Hand-rolled rather than
  // @tiptap/extension-bubble-menu, which pulls in floating-ui for placement
  // this does not need: the popover always sits centered on its text inside a
  // fixed-width column, above that text unless the header is in the way.
  useEffect(() => {
    if (!editor) return;
    function bubbleFor(
      from: number,
      to: number,
      kind: "format" | "link",
      href: string,
    ): Bubble | null {
      const wrap = wrapRef.current;
      if (!editor || !wrap) return null;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const box = wrap.getBoundingClientRect();
      const selTop = Math.min(start.top, end.top);
      const selBottom = Math.max(start.bottom, end.bottom);
      const below = selTop - BUBBLE_H - 8 < HEADER_H + 8;
      return {
        kind,
        href,
        below,
        top: below ? selBottom - box.top + 8 : selTop - box.top - 8,
        // Center on the whole selection rectangle, not on the first and last
        // caret positions: a selection that wraps lines has its end.right near
        // the left margin, which dragged the bubble off to one side.
        left: rangeCenter(editor, from, to) - box.left,
      };
    }
    function place() {
      if (!editor) return;
      // Frozen while the URL field is open. That field owns focus, and the
      // range it applies to is already recorded in `linkEdit`.
      if (linkEditRef.current) return;
      if (!wrapRef.current || !editor.isFocused) {
        setBubble(null);
        return;
      }
      const { from, to, empty } = editor.state.selection;
      let next: Bubble | null = null;
      if (!empty && from !== to) {
        next = bubbleFor(from, to, "format", "");
      } else {
        // A collapsed caret inside a link shows that link's address instead.
        // Without this there is no way to see where a link goes, re-point it,
        // or take it off, because the toolbar needs a selection to appear.
        const range = linkRangeAt(editor);
        const href = (editor.getAttributes("link").href as string | undefined) ?? "";
        if (range && href) next = bubbleFor(range.from, range.to, "link", href);
      }
      setBubble((prev) =>
        prev &&
        next &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.below === next.below &&
        prev.kind === next.kind &&
        prev.href === next.href
          ? prev
          : next,
      );
    }
    function hide() {
      if (linkEditRef.current) return;
      setBubble(null);
    }
    editor.on("selectionUpdate", place);
    editor.on("focus", place);
    editor.on("blur", hide);
    return () => {
      editor.off("selectionUpdate", place);
      editor.off("focus", place);
      editor.off("blur", hide);
    };
  }, [editor]);

  // ── the link field ────────────────────────────────────────────────────────
  const closeLinkEditor = useCallback((refocus: boolean) => {
    linkEditRef.current = false;
    setLinkEdit(null);
    setLinkValue("");
    const ed = editorRef.current;
    if (refocus && ed && !ed.isFocused) ed.commands.focus();
    // Nothing owns the caret any more, so the popover would sit there stale.
    if (!refocus) setBubble(null);
  }, []);

  const openLinkEditor = useCallback(() => {
    const ed = editorRef.current;
    const wrap = wrapRef.current;
    if (!ed || !wrap) return;
    const { from, to, empty } = ed.state.selection;
    // Editing an existing link works from a bare caret, so the mark's own range
    // wins over the selection: clicking into the middle of "Greenville Journal"
    // and pressing Ctrl+K re-points the whole link, not the word under the caret.
    const marked = linkRangeAt(ed);
    const range = marked ?? { from, to };
    const start = ed.view.coordsAtPos(range.from);
    const end = ed.view.coordsAtPos(range.to);
    const box = wrap.getBoundingClientRect();
    const selTop = Math.min(start.top, end.top);
    const selBottom = Math.max(start.bottom, end.bottom);
    const below = selTop - BUBBLE_H - 8 < HEADER_H + 8;
    setBubble({
      kind: "link",
      href: "",
      below,
      top: below ? selBottom - box.top + 8 : selTop - box.top - 8,
      left: rangeCenter(ed, range.from, range.to) - box.left,
    });
    setLinkValue((ed.getAttributes("link").href as string | undefined) ?? "");
    // Set BEFORE the state, so the blur the field's autofocus causes already
    // sees it. See the comment on linkEditRef.
    linkEditRef.current = true;
    setLinkEdit({ from: range.from, to: range.to, insert: !marked && empty });
  }, []);

  const applyLink = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || !linkEdit) return;
    const raw = linkValue.trim();
    const { from, to, insert } = linkEdit;
    if (!raw) {
      // An emptied field means take the link off and keep the words.
      ed.chain().focus().setTextSelection({ from, to }).unsetLink().run();
      closeLinkEditor(true);
      return;
    }
    const href = toHref(raw);
    // Not an address this editor will link to. Leave the field open and
    // unchanged rather than writing the mark or silently dropping it: the panel
    // still standing with the text still in it is the feedback.
    if (!href) return;
    if (insert) {
      // Nothing was selected, so the link needs text of its own. What was typed
      // becomes that text, which is what someone pasting an address expects.
      ed.chain()
        .focus()
        .insertContentAt(
          { from, to },
          { type: "text", text: raw, marks: [{ type: "link", attrs: { href } }] },
        )
        .run();
    } else {
      ed.chain().focus().setTextSelection({ from, to }).setLink({ href }).run();
    }
    closeLinkEditor(true);
  }, [linkEdit, linkValue, closeLinkEditor]);

  const removeLink = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.chain().focus().extendMarkRange("link").unsetLink().run();
    setBubble(null);
  }, []);

  // Ctrl/Cmd+K, which the bubble has always advertised and nothing ever bound:
  // neither TipTap's Link extension nor StarterKit ships a shortcut for it, so
  // the keystroke fell through to Chrome's address bar. Captured on the window
  // rather than through a TipTap keymap because it also has to work while the
  // URL field, which lives outside the editor, holds focus.
  useEffect(() => {
    if (!editor) return;
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.key.toLowerCase() !== "k") return;
      if (!editor?.isFocused && !linkEditRef.current) return;
      e.preventDefault();
      if (linkEditRef.current) closeLinkEditor(true);
      else openLinkEditor();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [editor, openLinkEditor, closeLinkEditor]);

  // A click anywhere outside dismisses the URL field, the way clicking off a
  // Substack link popover does. A click back into the prose lands here first,
  // which is right: moving the caret is what that click was for.
  useEffect(() => {
    if (!linkEdit) return;
    function onDown(e: MouseEvent) {
      if ((e.target as HTMLElement | null)?.closest("[data-editor-pop]")) return;
      closeLinkEditor(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [linkEdit, closeLinkEditor]);

  // Open the slash menu on a lone "/" at the start of an empty paragraph.
  useEffect(() => {
    if (!editor) return;
    function detect() {
      if (!editor) return;
      const { $from, empty } = editor.state.selection;
      const wrap = wrapRef.current;
      if (!empty || !wrap || $from.parent.type.name !== "paragraph") {
        closeSlash();
        return;
      }
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\n");
      // Anchored to the start of the block, so a slash inside a sentence (a URL,
      // "and/or") never opens the menu.
      const m = /^\/(\w*)$/.exec(textBefore);
      if (!m) {
        closeSlash();
        return;
      }
      const coords = editor.view.coordsAtPos($from.pos);
      const box = wrap.getBoundingClientRect();
      const query = m[1].toLowerCase();
      const height = matchItems(query).length * MENU_ROW_H + 12;
      // Under the line normally, over it when the caret is far enough down the
      // screen that the list would otherwise hang off the bottom.
      const below = coords.bottom + 8 + height <= window.innerHeight - 8;
      const next = {
        below,
        top: below ? coords.bottom - box.top + 8 : coords.top - box.top - 8,
        left: coords.left - box.left,
        query,
        from: $from.pos - m[0].length,
        chars: m[0].length,
      };
      setSlash((prev) =>
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.below === next.below &&
        prev.query === next.query &&
        prev.from === next.from &&
        prev.chars === next.chars
          ? prev
          : next,
      );
      setSlashIndex((i) => (slashOpenRef.current ? i : 0));
      slashOpenRef.current = true;
    }
    // selectionUpdate + update, NOT transaction: a transaction fires for every
    // internal bookkeeping change too, and setting state on each one is what
    // made this loop.
    editor.on("selectionUpdate", detect);
    editor.on("update", detect);
    return () => {
      editor.off("selectionUpdate", detect);
      editor.off("update", detect);
    };
  }, [editor, closeSlash]);

  // Where the gutter "+" sits: beside the caret's line whenever that line is an
  // empty paragraph. Substack puts the block affordance exactly there, and it is
  // what makes the slash menu discoverable to someone who never types "/".
  useEffect(() => {
    if (!editor) return;
    function track() {
      if (!editor) return;
      const { $from, empty } = editor.state.selection;
      const wrap = wrapRef.current;
      if (
        !wrap ||
        !empty ||
        $from.parent.type.name !== "paragraph" ||
        $from.parent.content.size > 0
      ) {
        setPlusTop(null);
        return;
      }
      const coords = editor.view.coordsAtPos($from.pos);
      const top = coords.top - wrap.getBoundingClientRect().top;
      setPlusTop((prev) => (prev === top ? prev : top));
    }
    function hide() {
      setPlusTop(null);
    }
    editor.on("selectionUpdate", track);
    editor.on("update", track);
    editor.on("focus", track);
    editor.on("blur", hide);
    return () => {
      editor.off("selectionUpdate", track);
      editor.off("update", track);
      editor.off("focus", track);
      editor.off("blur", hide);
    };
  }, [editor]);

  // Whichever menu is open. They are never both open: opening one closes the
  // other, and the typed menu only exists while a "/" is on the line.
  const menu = slash ?? picker;

  function openPicker() {
    if (!editor) return;
    const { $from } = editor.state.selection;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const coords = editor.view.coordsAtPos($from.pos);
    const box = wrap.getBoundingClientRect();
    closeSlash();
    setSlashIndex(0);
    const height = SLASH_ITEMS.length * MENU_ROW_H + 12;
    const below = coords.bottom + 8 + height <= window.innerHeight - 8;
    setPicker({
      below,
      top: below ? coords.bottom - box.top + 8 : coords.top - box.top - 8,
      left: coords.left - box.left,
      query: "",
      from: $from.pos,
      chars: 0,
    });
  }

  const matches = useMemo(() => (menu ? matchItems(menu.query) : []), [menu]);

  const runSlash = useCallback(
    (item: SlashItem) => {
      if (!editor || !menu) return;
      // Clear the "/query" that opened the menu before running the command.
      // The gutter "+" types nothing, so it clears nothing (chars is 0).
      if (menu.chars > 0) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: menu.from, to: menu.from + menu.chars })
          .run();
      } else {
        editor.chain().focus().run();
      }
      closeMenus();
      if (item.label === "Image") fileRef.current?.click();
      else item.run(editor);
    },
    [editor, menu, closeMenus],
  );

  // Block-menu keyboard nav, captured before the editor sees the key.
  useEffect(() => {
    if (!menu || !matches.length) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex(
          (i) => (i + (e.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length,
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        runSlash(matches[slashIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeMenus();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [menu, matches, slashIndex, runSlash, closeMenus]);

  // A click anywhere else dismisses the gutter menu. The typed one needs no
  // such thing: it closes itself as soon as the line stops matching.
  useEffect(() => {
    if (!picker) return;
    function onDown(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.closest("[data-block-menu]")) return;
      setPicker(null);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [picker]);

  if (!editor) {
    return <div className="mt-8 min-h-[55vh] theme-text-muted text-sm">Loading editor…</div>;
  }

  return (
    <div ref={wrapRef} className="relative mt-8">
      <EditorContent editor={editor} />

      {/* The gutter "+": Substack's block affordance, parked in the left margin
          beside an empty line. Hidden on narrow screens, where there is no
          margin to park it in and the slash menu is the whole story. */}
      {plusTop !== null && (
        <button
          type="button"
          data-block-menu
          title="Add a block"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openPicker}
          className="hidden md:flex absolute -left-11 h-7 w-7 items-center justify-center rounded-full border theme-border theme-text-muted hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors"
          style={{ top: plusTop }}
        >
          <span className="text-base leading-none">+</span>
        </button>
      )}

      {bubble && (
        <div
          data-editor-pop
          className={`editor-pop absolute z-30 -translate-x-1/2 rounded-lg flex items-center gap-0.5 p-1 ${
            bubble.below ? "" : "-translate-y-full"
          }`}
          style={{ top: bubble.top, left: bubble.left }}
        >
          {linkEdit ? (
            <div className="flex items-center gap-1 px-1">
              <input
                autoFocus
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    closeLinkEditor(true);
                  }
                }}
                placeholder="Paste or type a link"
                className="w-56 bg-transparent text-sm focus:outline-none px-1 py-1"
              />
              <BubbleBtn title="Apply link" onClick={applyLink}>
                <span className="text-xs font-semibold px-1">Apply</span>
              </BubbleBtn>
            </div>
          ) : bubble.kind === "link" ? (
            /* The caret is sitting in a link, so show where it goes and the two
               things anyone ever wants to do about that. */
            <div className="flex items-center gap-0.5 pl-2">
              {isSafeHref(bubble.href) ? (
                <a
                  href={bubble.href}
                  target="_blank"
                  rel="noreferrer"
                  title={bubble.href}
                  // Same reason as every button here: mousedown must not blur
                  // the editor, or the popover unmounts before the click lands
                  // and the new tab never opens.
                  onMouseDown={(e) => e.preventDefault()}
                  className="text-sm underline underline-offset-2 max-w-[18rem] truncate"
                >
                  {prettyHref(bubble.href)}
                </a>
              ) : (
                /* An address on a scheme this editor does not link to, which is
                   what a paste from a hostile page would carry. It is shown so
                   it can be found and taken off with the button beside it, and
                   it is deliberately NOT an anchor: this popover renders
                   outside the editor, so an href here is one a click would
                   actually follow. React puts a `javascript:` URL in the DOM
                   unchanged. */
                <span
                  title={bubble.href}
                  className="text-sm max-w-[18rem] truncate line-through opacity-70"
                >
                  {prettyHref(bubble.href)}
                </span>
              )}
              <span className="pop-sep w-px h-5 mx-1.5" aria-hidden />
              <BubbleBtn title="Edit link  (Ctrl+K)" onClick={openLinkEditor}>
                <span className="text-xs font-semibold px-1">Edit</span>
              </BubbleBtn>
              <BubbleBtn title="Remove link" onClick={removeLink}>
                <span className="text-xs font-semibold px-1">Remove</span>
              </BubbleBtn>
            </div>
          ) : (
            <>
              <BubbleBtn
                title="Bold  (Ctrl+B)"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Icon d={I.bold} />
              </BubbleBtn>
              <BubbleBtn
                title="Italic  (Ctrl+I)"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Icon d={I.italic} />
              </BubbleBtn>
              <BubbleBtn
                title="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Icon d={I.strike} />
              </BubbleBtn>
              <BubbleBtn
                title="Link  (Ctrl+K)"
                active={editor.isActive("link")}
                onClick={openLinkEditor}
              >
                <Icon d={I.link} />
              </BubbleBtn>
              <span className="pop-sep w-px h-5 mx-1.5" aria-hidden />
              <BubbleBtn
                title="Heading"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <span className="text-xs font-bold px-0.5">H2</span>
              </BubbleBtn>
              <BubbleBtn
                title="Subheading"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <span className="text-xs font-bold px-0.5">H3</span>
              </BubbleBtn>
              <BubbleBtn
                title="Quote"
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <Icon d={I.quote} />
              </BubbleBtn>
              <BubbleBtn
                title="Bulleted list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <Icon d={I.bullet} />
              </BubbleBtn>
              <BubbleBtn
                title="Numbered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <Icon d={I.ordered} />
              </BubbleBtn>
            </>
          )}
        </div>
      )}

      {menu && matches.length > 0 && (
        <div
          data-block-menu
          className={`editor-pop absolute z-30 w-64 rounded-lg py-1.5 ${
            menu.below ? "" : "-translate-y-full"
          }`}
          style={{ top: menu.top, left: menu.left }}
        >
          {matches.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setSlashIndex(i)}
              onClick={() => runSlash(item)}
              data-row={i === slashIndex ? "active" : undefined}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-none transition-colors"
            >
              <Icon d={item.icon} className="shrink-0 opacity-70" />
              <span className="text-sm">{item.label}</span>
              <span className="pop-hint text-xs ml-auto">{item.hint}</span>
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void insertImages(files);
        }}
      />
    </div>
  );
}
