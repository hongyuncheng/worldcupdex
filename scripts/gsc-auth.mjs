import http from "http";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import { loadProjectEnv } from "./load-project-env.mjs";

const { rootEnvPath } = loadProjectEnv(import.meta.url);

const { GSC_CLIENT_ID, GSC_CLIENT_SECRET } = process.env;

const OAUTH_SCOPE = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
].join(" ");
const REDIRECT_URI = "http://localhost:3939/oauth/callback";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET) {
  console.error("缺少 Google OAuth 客户端变量。");
  console.error(`请先在 ${rootEnvPath} 中设置：`);
  console.error("GSC_CLIENT_ID=your_client_id.apps.googleusercontent.com");
  console.error("GSC_CLIENT_SECRET=your_client_secret");
  process.exit(1);
}

function getProxyAgent() {
  const proxyUrl = process.env.OPS_HTTPS_PROXY
    || process.env.HTTPS_PROXY
    || process.env.HTTP_PROXY
    || process.env.https_proxy
    || process.env.http_proxy;

  return proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
}

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: GSC_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: OAUTH_SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

  return `${AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: GSC_CLIENT_ID,
    client_secret: GSC_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    agent: getProxyAgent(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token 交换失败 (${response.status}): ${text}`);
  }

  return response.json();
}

function startCallbackServer() {
  return new Promise((resolvePromise, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost:3939");

      if (url.pathname !== "/oauth/callback") {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }

      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>授权失败</h1><p>${error}</p>`);
        server.close();
        reject(new Error(`OAuth 授权被拒绝: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>缺少授权码</h1>");
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(code);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>授权成功</h1><p>请回到终端复制 refresh token。</p>");
        server.close();
        resolvePromise(tokens);
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>Token 交换失败</h1><p>${error.message}</p>`);
        server.close();
        reject(error);
      }
    });

    server.listen(3939, () => {
      console.log("已监听 http://localhost:3939/oauth/callback");
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error("端口 3939 已被占用，请先关闭占用进程。"));
        return;
      }

      reject(error);
    });
  });
}

async function main() {
  console.log("Google OAuth 授权工具");
  console.log("");
  console.log("1. 在浏览器中打开下方 URL。");
  console.log("2. 使用已拥有 GSC 和 GA4 读取权限的 Google 账号授权。");
  console.log("3. 把终端打印出的 GSC_REFRESH_TOKEN 写回根目录 .env。");
  console.log("");
  console.log(buildAuthUrl());
  console.log("");

  try {
    const tokens = await startCallbackServer();

    if (tokens.refresh_token) {
      console.log(`请把下列变量写入 ${rootEnvPath}：`);
      console.log(`GSC_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.log("这次没有返回 refresh token。");
      console.log("如果你之前授权过，请先到 https://myaccount.google.com/permissions 撤销该应用权限后重试。");
    }

    if (tokens.access_token) {
      console.log("已获取临时 access token，可用于本次联调。");
    }
  } catch (error) {
    console.error(`授权流程失败: ${error.message}`);
    process.exit(1);
  }
}

main();
