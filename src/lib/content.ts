import { getCollection } from "astro:content";

export async function getPosts() {
  const posts = await getCollection("blog", (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Entries from a YAML list, in file order.
export async function getList<C extends "projects" | "links" | "mediashelf">(name: C) {
  const entries = await getCollection(name);
  return entries.sort((a, b) => Number(a.id) - Number(b.id));
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// Titles are written in markdown; support `code` and *emphasis* only.
export function inlineTitle(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export const plainTitle = (s: string) => s.replace(/[`*]/g, "");
