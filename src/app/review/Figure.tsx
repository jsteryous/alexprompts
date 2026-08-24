"use client";

import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/react";

/**
 * An image with an optional caption, the way Substack's image block works.
 *
 * TipTap's stock Image is an inline-ish atom with no caption slot, so a caption
 * typed under a photo would be an ordinary paragraph and would drift away from
 * its image on any reflow. This wraps the image in a real `<figure>` whose
 * `<figcaption>` is an editable text block belonging to the node.
 *
 * The serialized form is what `editorMarkdown.ts` expects and what the site
 * already renders: `marked` passes block HTML through untouched, sanitize-html
 * allows figure/figcaption, and `globals.css` styles both under `.theme-prose`.
 * An uncaptioned figure stays a figure rather than degrading to `![](src)`, so
 * the two Substack-mirrored archive posts survive a load/save unchanged (see
 * `scripts/checks/editor-roundtrip.mjs`).
 */
export const Figure = Image.extend({
  name: "figure",
  group: "block",
  draggable: true,
  isolating: true,
  // `figcaption`'s inline content is the node's content; the image lives in an
  // attribute, which keeps the caption a normal editable text run.
  content: "inline*",

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector("img");
          if (!img) return false;
          return { src: img.getAttribute("src"), alt: img.getAttribute("alt") ?? "" };
        },
      },
      // A bare markdown image (`![alt](src)`) arrives as a lone <img>. Adopt it
      // so every image in the document is the same kind of node to edit; the
      // serializer decides how it goes back out.
      {
        tag: "img[src]",
        getAttrs: (el) => ({
          src: (el as HTMLElement).getAttribute("src"),
          alt: (el as HTMLElement).getAttribute("alt") ?? "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, ...rest } = HTMLAttributes;
    return [
      "figure",
      mergeAttributes(rest),
      ["img", { src, alt }],
      ["figcaption", { "data-placeholder": "Write a caption…" }, 0],
    ];
  },
});
