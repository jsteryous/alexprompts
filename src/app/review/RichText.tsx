"use client";

import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
 * Four interactions carry the Substack feel, in order of how much they matter:
 * markdown input rules (typing `## ` still makes a heading, so muscle memory
 * survives), the selection bubble (highlight text, format it in place), the
 * slash menu (`/` on an empty line for blocks), and the gutter "+" beside an
 * empty line, which opens that same menu for someone who never learns to type
 * a slash.
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

/** An open block menu: where it sits, what it is filtering on, and how many
 *  characters of typed trigger to remove before running the command. */
type BlockMenu = {
  top: number;
  left: number;
  query: string;
  from: number;
  chars: number;
};

type SlashItem = {
  label: string;
  hint: string;
  icon: string;
  run: (e: TiptapEditor) => void;
};

const SLASH_ITEMS: SlashItem[] = [
  {
    label: "Heading",
    hint: "Section title",
    icon: I.heading,
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Subheading",
    hint: "Smaller title",
    icon: I.heading,
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bulleted list",
    hint: "Unordered",
    icon: I.bullet,
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    hint: "Ordered",
    icon: I.ordered,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Quote",
    hint: "Pull a passage out",
    icon: I.quote,
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Divider",
    hint: "Horizontal rule",
    icon: I.divider,
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  // Handled by runSlash, which opens the file picker instead.
  { label: "Image", hint: "Upload a photo", icon: I.image, run: () => {} },
];

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

  const [bubble, setBubble] = useState<{ top: number; left: number } | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
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
        link: { openOnClick: false, autolink: true },
        // Nothing published here is code, and a stray fence in prose is more
        // likely a mistake than an intent.
        codeBlock: false,
      }),
      Figure,
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "figure"
            ? "Write a caption…"
            : (placeholder ?? "Write. Type / for blocks, or paste an image right in."),
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

  // Position the selection bubble. Hand-rolled rather than
  // @tiptap/extension-bubble-menu, which pulls in floating-ui for placement
  // this does not need: the bubble always sits centered above the selection
  // inside a fixed-width column.
  useEffect(() => {
    if (!editor) return;
    function place() {
      if (!editor) return;
      const { from, to, empty } = editor.state.selection;
      const wrap = wrapRef.current;
      if (empty || from === to || !wrap || !editor.isFocused) {
        setBubble(null);
        setLinkOpen(false);
        return;
      }
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const box = wrap.getBoundingClientRect();
      const next = {
        top: Math.min(start.top, end.top) - box.top - 8,
        // Center on the whole selection rectangle, not on the first and last
        // caret positions: a selection that wraps lines has its end.right near
        // the left margin, which dragged the bubble off to one side.
        left: rangeCenter(editor, from, to) - box.left,
      };
      setBubble((prev) =>
        prev && prev.top === next.top && prev.left === next.left ? prev : next,
      );
    }
    function hide() {
      setBubble(null);
    }
    editor.on("selectionUpdate", place);
    editor.on("blur", hide);
    return () => {
      editor.off("selectionUpdate", place);
      editor.off("blur", hide);
    };
  }, [editor]);

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
      const next = {
        top: coords.bottom - box.top + 8,
        left: coords.left - box.left,
        query: m[1].toLowerCase(),
        from: $from.pos - m[0].length,
        chars: m[0].length,
      };
      setSlash((prev) =>
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
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
    setPicker({
      top: coords.bottom - box.top + 8,
      left: coords.left - box.left,
      query: "",
      from: $from.pos,
      chars: 0,
    });
  }

  const matches = useMemo(
    () => (menu ? SLASH_ITEMS.filter((it) => it.label.toLowerCase().includes(menu.query)) : []),
    [menu],
  );

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

  function applyLink() {
    if (!editor) return;
    const url = linkValue.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: /^\w+:|^\//.test(url) ? url : `https://${url}` })
        .run();
    }
    setLinkOpen(false);
    setLinkValue("");
  }

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
          className="editor-pop absolute z-30 -translate-x-1/2 -translate-y-full rounded-lg flex items-center gap-0.5 p-1"
          style={{ top: bubble.top, left: bubble.left }}
        >
          {linkOpen ? (
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
                    setLinkOpen(false);
                  }
                }}
                placeholder="Paste or type a link"
                className="w-56 bg-transparent text-sm focus:outline-none px-1 py-1"
              />
              <BubbleBtn title="Apply link" onClick={applyLink}>
                <span className="text-xs font-semibold px-1">Apply</span>
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
                onClick={() => {
                  setLinkValue(editor.getAttributes("link").href ?? "");
                  setLinkOpen(true);
                }}
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
            </>
          )}
        </div>
      )}

      {menu && matches.length > 0 && (
        <div
          data-block-menu
          className="editor-pop absolute z-30 w-64 rounded-lg py-1.5"
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
