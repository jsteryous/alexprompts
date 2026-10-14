"use client";

import { useEffect, useRef, useState } from "react";
import ClipShare from "@/components/ClipShare";

/**
 * THE SCISSORS (October 14, 2026). Mounted once on an edition page. Every item
 * the page marks with `data-clip="<id>"` becomes clippable:
 *
 * - With a mouse, hovering an item draws a dashed cut line around it and turns
 *   the cursor into scissors (CSS, keyed off `.clip-ready` so readers without
 *   JavaScript never see scissors that do nothing). A click clips the item.
 * - Highlighting words inside one paragraph (`data-clip-p="<n>"`) raises a
 *   "Clip this line" tab over the selection, which clips just those words.
 * - On a touch screen, a tap arms an item and shows a Clip tab at its corner,
 *   so reading taps never open anything by accident.
 *
 * Clipping opens a sheet with the clipping as it will look when shared, and the
 * share controls. The address carries only the item and character offsets; the
 * server rebuilds the text (src/lib/clips.ts).
 */

type Target = { id: string; l: string };
type Tab = { x: number; y: number; target: Target; label: string };

function itemOf(node: Node | null): HTMLElement | null {
  const el = node instanceof HTMLElement ? node : node?.parentElement ?? null;
  return el?.closest<HTMLElement>("[data-clip]") ?? null;
}

/** Character offsets of the selection inside one `data-clip-p` paragraph, or null. */
function selectionTarget(): { target: Target; rect: DOMRect } | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const startEl = range.startContainer instanceof HTMLElement ? range.startContainer : range.startContainer.parentElement;
  const para = startEl?.closest<HTMLElement>("[data-clip-p]");
  const item = para ? itemOf(para) : null;
  if (!para || !item) return null;
  const before = document.createRange();
  before.selectNodeContents(para);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  // A drag that runs past the paragraph is cut at its end.
  const end = para.contains(range.endContainer) ? start + range.toString().length : para.textContent?.length ?? start;
  if (end - start < 3) return null;
  return {
    target: { id: item.dataset.clip!, l: `${para.dataset.clipP}.${start}.${end}` },
    rect: range.getBoundingClientRect(),
  };
}

export default function ClipLayer({ slug, number }: { slug: string; number: number }) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [open, setOpen] = useState<Target | null>(null);
  const armed = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-clip-root]");
    if (!root) return;
    root.classList.add("clip-ready");
    const touch = window.matchMedia("(hover: none)").matches;

    const disarm = () => {
      armed.current?.classList.remove("clip-armed");
      armed.current = null;
    };

    const onSelect = () => {
      const found = selectionTarget();
      if (!found) {
        setTab((t) => (t?.label === "Clip this line" ? null : t));
        return;
      }
      disarm();
      setTab({
        x: found.rect.left + found.rect.width / 2 + window.scrollX,
        y: found.rect.top + window.scrollY,
        target: found.target,
        label: "Clip this line",
      });
    };

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("a, button, [data-clip-tab]")) return;
      const item = itemOf(el);
      if (!item) {
        disarm();
        setTab(null);
        return;
      }
      if (window.getSelection()?.isCollapsed === false) return;
      if (touch) {
        disarm();
        item.classList.add("clip-armed");
        armed.current = item;
        const r = item.getBoundingClientRect();
        setTab({ x: r.right + window.scrollX - 34, y: r.top + window.scrollY, target: { id: item.dataset.clip!, l: "" }, label: "Clip" });
        return;
      }
      setOpen({ id: item.dataset.clip!, l: "" });
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onSelectionChange = () => {
      clearTimeout(timer);
      timer = setTimeout(onSelect, 180);
    };

    root.addEventListener("click", onClick);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      root.classList.remove("clip-ready");
      root.removeEventListener("click", onClick);
      document.removeEventListener("selectionchange", onSelectionChange);
      clearTimeout(timer);
      disarm();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const query = (t: Target) => `${t.l ? `?l=${t.l}` : ""}`;
  const pagePath = open ? `/clip/${slug}/${open.id}${query(open)}` : "";
  const imagePath = open ? `/api/clip-image?slug=${slug}&item=${open.id}${open.l ? `&l=${open.l}` : ""}` : "";

  return (
    <>
      {tab && (
        <button
          type="button"
          data-clip-tab
          className="clip-tab"
          style={{ left: tab.x, top: tab.y }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setOpen(tab.target);
            setTab(null);
            window.getSelection()?.removeAllRanges();
          }}
        >
          <span aria-hidden="true">✂</span> {tab.label}
        </button>
      )}

      {open && (
        <div className="clip-sheet" role="dialog" aria-modal="true" aria-label="Share this clipping" onClick={() => setOpen(null)}>
          <div className="clip-sheet-panel theme-page" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="type-eyebrow theme-text-muted">Your clipping</p>
              <button type="button" className="type-eyebrow theme-link" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
            {/* The picture is rendered on demand by /api/clip-image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePath} alt="The clipping, as it will look when shared" className="w-full h-auto border theme-border" width={1200} height={630} />
            <div className="mt-5">
              <ClipShare
                url={`${window.location.origin}${pagePath}`}
                imageUrl={imagePath}
                title="Clipped from The Rebrew Intelligencer"
                fileName={`intelligencer-no${number}-${open.id}.png`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
