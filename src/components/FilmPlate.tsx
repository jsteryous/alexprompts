"use client";

import { useState } from "react";

/**
 * A news film in the paper (October 15, 2026). Until a reader presses play it is
 * a still in the same grey ink as the period plates, so the page keeps its look
 * and loads nothing from YouTube but one picture. Pressing play swaps in
 * YouTube's own player (the privacy-enhanced youtube-nocookie domain).
 */
export default function FilmPlate({
  id,
  still,
  caption,
  credit,
  source,
  headStyle,
}: {
  id: string;
  still: string;
  caption: string;
  credit: string;
  source: string;
  headStyle?: React.CSSProperties;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="break-inside-avoid border border-[var(--foreground)] p-1.5 mb-4">
      <div className="relative w-full aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={caption || "News film"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="film-still absolute inset-0 w-full h-full" aria-label={`Play the film: ${caption}`}>
            {/* YouTube's own still for the film; next/image would need the host whitelisted. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={still} alt="" loading="lazy" className="paper-plate w-full h-full object-cover" />
            <span className="film-play" aria-hidden="true">
              ▶ <span>See the film</span>
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="theme-text-primary text-center italic text-[0.9375rem] leading-snug mt-2" style={headStyle}>
          {caption}
        </figcaption>
      )}
      <p className="theme-text-muted text-center text-[0.6875rem] leading-snug mt-1">
        <a href={source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Film by {credit}, on YouTube
        </a>
      </p>
    </figure>
  );
}
