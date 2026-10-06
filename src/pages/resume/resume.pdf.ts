import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The PDF is built by resume/resume.py; copy it into the site as is.
export async function GET() {
  const pdf = await readFile(join(process.cwd(), "resume", "resume.pdf"));
  return new Response(pdf, { headers: { "Content-Type": "application/pdf" } });
}
