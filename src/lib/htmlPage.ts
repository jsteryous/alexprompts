import { NextResponse } from "next/server";
import { site } from "@/lib/site";

/**
 * A small standalone HTML result page for browser-facing GET routes (email
 * confirm, unsubscribe). Self-contained inline styles, no app shell, matching the
 * look of the /api/publish result page. Use for links a person clicks from an
 * email, where a JSON body would be unhelpful.
 */
export function htmlPage(heading: string, body: string, status = 200): NextResponse {
  const ok = status >= 200 && status < 300;
  const icon = ok ? "✓" : "✗";
  const color = ok ? "#16a34a" : "#dc2626";

  const markup = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading} — ${site.name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f9fafb;min-height:100vh;
         display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;
          padding:40px 48px;max-width:480px;width:100%;text-align:center}
    .icon{width:56px;height:56px;border-radius:50%;background:${color}15;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 20px;font-size:24px;color:${color}}
    h1{font-size:22px;font-weight:700;color:#0a0a0a;margin-bottom:10px}
    p{font-size:15px;color:#555;line-height:1.6}
    .back{display:inline-block;margin-top:28px;font-size:13px;
          color:#0a0a0a;text-decoration:none;border:1px solid #e5e7eb;
          padding:8px 18px;border-radius:8px}
    .back:hover{border-color:#aaa}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${heading}</h1>
    <p>${body}</p>
    <a class="back" href="/">← ${site.url.replace(/^https?:\/\//, "")}</a>
  </div>
</body>
</html>`;

  return new NextResponse(markup, { status, headers: { "Content-Type": "text/html" } });
}
