/**
 * Font files for Satori share images. Satori needs fonts as buffers, so they are
 * fetched from Google Fonts at render time; a warm function reuses the promise.
 * If a fetch fails the image still renders in Satori's default face.
 */
async function googleFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

type SatoriFont = { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 | 700 };

let cached: Promise<SatoriFont[]> | null = null;

/** Black (blackletter nameplate), Fell (headlines, italics) and News (body). */
export function paperFonts(): Promise<SatoriFont[]> {
  cached ??= Promise.all([
    googleFont("UnifrakturMaguntia"),
    googleFont("IM+Fell+English"),
    googleFont("IM+Fell+English:ital@1"),
    googleFont("Noticia+Text"),
  ]).then(([black, fell, fellItalic, news]) => {
    const out: SatoriFont[] = [];
    if (black) out.push({ name: "Black", data: black, style: "normal", weight: 400 });
    if (fell) out.push({ name: "Fell", data: fell, style: "normal", weight: 400 });
    if (fellItalic) out.push({ name: "Fell", data: fellItalic, style: "italic", weight: 400 });
    if (news) out.push({ name: "News", data: news, style: "normal", weight: 400 });
    if (out.length < 4) cached = null; // try again next time rather than caching a partial set
    return out;
  });
  return cached;
}
