import { getPosts, plainTitle } from "../lib/content";
import { SITE } from "../site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map((p) => {
      const link = `${SITE.url}/${p.id}.html`;
      return `<item><title>${esc(plainTitle(p.data.title))}</title><link>${link}</link><guid>${link}</guid><pubDate>${p.data.date.toUTCString()}</pubDate></item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(SITE.title)}</title>
<link>${SITE.url}/</link>
<description>Writing by ${esc(SITE.title)}</description>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel></rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
