import { access, copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = process.argv[2]
  ? resolve(root, process.argv[2])
  : await findLatestInput();
const input = JSON.parse(await readFile(inputPath, "utf8"));
const date = input.date;

if (!date || !Array.isArray(input.posts) || input.posts.length === 0) {
  throw new Error(`${relative(root, inputPath)} needs a date and non-empty posts array.`);
}

const sourceDir = dirname(inputPath);
const outputDir = resolve(root, "public", "social", date);
await mkdir(outputDir, { recursive: true });

for (const post of input.posts) {
  const imageName = basename(new URL(post.imageUrl).pathname);
  const source = resolve(sourceDir, imageName);
  const destination = resolve(outputDir, imageName);
  await access(source, constants.R_OK);
  await copyFile(source, destination);
  console.log(`copied ${relative(root, destination)}`);
}

async function findLatestInput() {
  const reportsDir = resolve(root, "reports");
  const entries = await readdir(reportsDir, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("social-promotion-"))
    .map((entry) => resolve(reportsDir, entry.name, "buffer-posts.json"))
    .sort()
    .reverse();

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.R_OK);
      return candidate;
    } catch {
      // Continue until the newest prepared Buffer package is found.
    }
  }
  throw new Error("No reports/social-promotion-*/buffer-posts.json file exists.");
}
