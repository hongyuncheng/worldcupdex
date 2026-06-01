import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiUrl = "https://api.buffer.com";
const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(`Buffer draft upload failed: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  const token = await getToken();

  if (args.listChannels) {
    if (!token) {
      throw new Error("Add BUFFER_API_KEY or secrets/buffer-token.txt before listing channels.");
    }
    const channels = await getChannels(token);
    console.log(JSON.stringify(channels, null, 2));
    return;
  }

  const inputPath = args.input
    ? resolve(root, args.input)
    : await findLatestInput();
  const input = JSON.parse(await readFile(inputPath, "utf8"));
  validateInput(input, inputPath);

  const resultsPath = resolve(dirname(inputPath), "buffer-results.json");
  const previous = await readJsonIfExists(resultsPath, { drafts: [] });
  const completed = new Set(
    previous.drafts.filter((draft) => draft.status === "created").map((draft) => draft.localId),
  );

  let channels = [];
  if (token && !args.dryRun) {
    channels = await getChannels(token);
  }

  const drafts = [];
  for (const post of input.posts) {
    if (completed.has(post.id) && !args.force) {
      console.log(`skip ${post.id}: already created`);
      continue;
    }

    const channel = args.dryRun
      ? { id: `<${post.channelName}-channel-id>`, name: post.channelName, service: post.platform }
      : findChannel(channels, post);
    const payload = createPostInput(post, channel.id);

    if (args.dryRun) {
      drafts.push({ localId: post.id, channel, payload });
      continue;
    }

    if (!token) {
      throw new Error("Add BUFFER_API_KEY or secrets/buffer-token.txt before creating drafts.");
    }
    if (!args.skipUrlCheck) {
      await assertPublicUrl(post.imageUrl);
    }

    const response = await graphql(token, CREATE_DRAFT_MUTATION, { input: payload });
    const result = response.data?.createPost;
    if (!result?.post?.id) {
      throw new Error(`${post.id}: ${result?.message || "Buffer did not return a post ID."}`);
    }

    drafts.push({
      localId: post.id,
      status: "created",
      channel,
      bufferPost: result.post,
      createdAt: new Date().toISOString(),
    });
    await saveResults(resultsPath, inputPath, previous.drafts, drafts);
    console.log(`created ${post.id}: ${result.post.id}`);
  }

  if (args.dryRun) {
    console.log(JSON.stringify({ input: relative(root, inputPath), drafts }, null, 2));
    return;
  }

  await saveResults(resultsPath, inputPath, previous.drafts, drafts);
  console.log(`saved ${relative(root, resultsPath)}`);
}

async function saveResults(resultsPath, inputPath, previousDrafts, drafts) {
  const output = {
    input: relative(root, inputPath).replaceAll("\\", "/"),
    updatedAt: new Date().toISOString(),
    drafts: [...previousDrafts.filter((draft) => !drafts.some((item) => item.localId === draft.localId)), ...drafts],
  };
  await writeFile(resultsPath, `${JSON.stringify(output, null, 2)}\n`);
}

function parseArgs(rawArgs) {
  const parsed = { dryRun: false, force: false, listChannels: false, skipUrlCheck: false };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--list-channels") parsed.listChannels = true;
    else if (arg === "--skip-url-check") parsed.skipUrlCheck = true;
    else if (arg === "--input") parsed.input = rawArgs[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

async function getToken() {
  if (process.env.BUFFER_API_KEY?.trim()) return process.env.BUFFER_API_KEY.trim();
  try {
    return (await readFile(resolve(root, "secrets/buffer-token.txt"), "utf8")).trim();
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
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

function validateInput(input, inputPath) {
  if (!Array.isArray(input.posts) || input.posts.length === 0) {
    throw new Error(`${relative(root, inputPath)} must contain a non-empty posts array.`);
  }
  for (const post of input.posts) {
    for (const field of ["id", "platform", "channelName", "text", "imageUrl", "altText"]) {
      if (!post[field]) throw new Error(`${post.id || "post"} is missing ${field}.`);
    }
    if (post.platform === "pinterest" && (!post.title || !post.destinationUrl || !post.boardServiceId)) {
      throw new Error(`${post.id} needs title, destinationUrl and boardServiceId.`);
    }
  }
}

async function readJsonIfExists(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function getChannels(token) {
  const organizationsResponse = await graphql(token, `
    query GetOrganizations {
      account {
        organizations { id name }
      }
    }
  `);
  const organizations = organizationsResponse.data?.account?.organizations || [];
  const channels = [];

  for (const organization of organizations) {
    const response = await graphql(token, `
      query GetChannels($input: ChannelsInput!) {
        channels(input: $input) { id name displayName service }
      }
    `, { input: { organizationId: organization.id } });
    for (const channel of response.data?.channels || []) {
      channels.push({ ...channel, organization });
    }
  }
  return channels;
}

function findChannel(channels, post) {
  const matches = channels.filter(
    (channel) =>
      channel.service.toLowerCase() === post.platform.toLowerCase() &&
      [channel.name, channel.displayName].some((name) => name?.toLowerCase() === post.channelName.toLowerCase()),
  );
  if (matches.length !== 1) {
    throw new Error(`${post.id}: expected one ${post.platform} channel named "${post.channelName}", found ${matches.length}. Run npm run buffer:channels.`);
  }
  return matches[0];
}

function createPostInput(post, channelId) {
  const input = {
    channelId,
    schedulingType: "automatic",
    mode: "addToQueue",
    saveToDraft: true,
    text: post.text,
    aiAssisted: true,
    assets: [{ image: { url: post.imageUrl, metadata: { altText: post.altText } } }],
  };

  if (post.platform === "instagram") {
    input.metadata = { instagram: { type: "post", shouldShareToFeed: true } };
  }
  if (post.platform === "pinterest") {
    input.metadata = {
      pinterest: {
        title: post.title,
        url: post.destinationUrl,
        boardServiceId: post.boardServiceId,
      },
    };
  }
  return input;
}

async function assertPublicUrl(url) {
  const cacheBustUrl = new URL(url);
  cacheBustUrl.searchParams.set("_buffer_check", Date.now().toString());
  const response = await fetch(cacheBustUrl, { method: "GET", redirect: "follow" });
  if (!response.ok) throw new Error(`Image is not public yet (${response.status}): ${url}`);
  if (!response.headers.get("content-type")?.startsWith("image/")) {
    throw new Error(`URL does not return an image: ${url}`);
  }
}

async function graphql(token, query, variables = {}) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (!response.ok || body.errors?.length) {
    throw new Error(body.errors?.map((error) => error.message).join("; ") || `HTTP ${response.status}`);
  }
  return body;
}

const CREATE_DRAFT_MUTATION = `
  mutation CreateDraftPost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post { id text status channelId }
      }
      ... on MutationError {
        message
      }
    }
  }
`;
