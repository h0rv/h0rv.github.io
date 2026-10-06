import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { parse as parseYaml } from "yaml";

const blog = defineCollection({
  loader: glob({ base: "./content/blog", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

// Single markdown pages: home.md, mediashelf.md
const pages = defineCollection({
  loader: glob({ base: "./content", pattern: "*.md" }),
  schema: z.object({ title: z.string().optional() }).passthrough(),
});

// Photo rolls: content/photos/<roll>/index.md, photos sit next to it.
const rolls = defineCollection({
  loader: glob({
    base: "./content/photos",
    pattern: "*/index.md",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    place: z.string().optional(),
    camera: z.string().optional(),
    film: z.string().optional(),
    tags: z.array(z.string()).default([]),
    ongoing: z.boolean().default(false),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    captions: z.record(z.string(), z.string()).default({}),
  }),
});

const resume = defineCollection({
  loader: glob({ base: "./resume", pattern: "resume.md" }),
});

// YAML list files (projects, mediashelf, links): entries keep the order they're written in.
const yamlList = (path: string) =>
  file(path, {
    parser: (text) => (parseYaml(text) as object[]).map((entry, i) => ({ id: String(i), ...entry })),
  });

const projects = defineCollection({
  loader: yamlList("./content/projects.yaml"),
  schema: z.object({
    name: z.string(),
    year: z.number(),
    site: z.string().url().optional(),
    repo: z.string().url(),
    description: z.string().nullish(),
  }),
});

const mediashelf = defineCollection({
  loader: yamlList("./content/mediashelf.yaml"),
  schema: z.object({
    date: z.coerce.date(),
    kind: z.enum(["book", "film", "article", "video", "podcast", "paper", "post"]),
    title: z.string(),
    by: z.string().optional(),
    url: z.string().url(),
    note: z.string().optional(),
    quote: z.string().optional(),
  }),
});

const links = defineCollection({
  loader: yamlList("./content/links.yaml"),
  schema: z.object({ label: z.string(), url: z.string() }),
});

export const collections = { blog, pages, rolls, mediashelf, resume, projects, links };
