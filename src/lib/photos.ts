import { type CollectionEntry, getCollection } from "astro:content";
import type { ImageMetadata } from "astro";

// Every image under content/photos/<roll>/, keyed by path.
const files = import.meta.glob<{ default: ImageMetadata }>(
  "/content/photos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);

export type Photo = { name: string; src: ImageMetadata; caption?: string };

export function photosFor(roll: CollectionEntry<"rolls">): Photo[] {
  return Object.entries(files)
    .filter(([path]) => path.split("/")[3] === roll.id)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, mod]) => {
      const name = path.split("/").pop()!;
      return { name, src: mod.default, caption: roll.data.captions[name] };
    });
}

export function coverFor(roll: CollectionEntry<"rolls">): Photo | undefined {
  const photos = photosFor(roll);
  return photos.find((p) => p.name === roll.data.cover) ?? photos[0];
}

export async function getRolls() {
  const rolls = await getCollection("rolls", (r) => import.meta.env.DEV || !r.data.draft);
  return rolls.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const rollMeta = (r: CollectionEntry<"rolls">) =>
  [r.data.ongoing ? "ongoing" : r.data.date.toISOString().slice(0, 7), r.data.place, r.data.camera, r.data.film].filter(
    Boolean,
  );
