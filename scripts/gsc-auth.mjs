/**
 * Google Search Console OAuth 授权辅助工具
 *
 * 首次运行时帮助用户获取 refresh token，后续脚本使用 refresh token 自动刷新 access token。
 *
 * 使用方法：
 *   node scripts/gsc-auth.mjs
 *
 * 前置条件：
 *   1. 在 Google Cloud Console 创建 OAuth 2.0 客户端 ID（桌面应用类型）
 *   2. 将 Client ID 和 Client Secret 写入 scripts/.env
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

// 代理支持：自动检测 HTTPS_PROXY / HTTP_PROXY 环境变量
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
if (proxyUrl) {
  console.log(`🌐 检测到代理: ${proxyUrl}`);
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

const { GSC_CLIENT_ID, GSC_CLIENT_SECRET } = process.env;

if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET) {
  console.error('❌ 缺少必要的环境变量: GSC_CLIENT_ID, GSC_CLIENT_SECRET');
  console.error('   请在 scripts/.env 中配置以下变量：');
  console.error('   GSC_CLIENT_ID=your_client_id.apps.googleusercontent.com');
  console.error('   GSC_CLIENT_SECRET=your_client_secret');
  process.exit(1);
}

// ============ 配置 ============

const OAUTH_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const REDIRECT_URI = 'http://localhost:3939/oauth/callback';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ============ 生成授权 URL ============

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: GSC_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: OAUTH_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// ============ 交换 Token ============
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: GSC_CLIENT_ID,
    client_secret: GSC_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy || 'http://127.0.0.1:10809';
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    agent,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token 交换失败 (${resp.status}): ${text}`);
  }

  return resp.json();
}

// ============ 启动回调服务器 ============

function startCallbackServer() {
  return new Promise((resolvePromise, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:3939`);

      if (url.pathname !== '/oauth/callback') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>❌ 授权失败</h1><p>错误：${error}</p>`);
        server.close();
        reject(new Error(`OAuth 授权被拒绝: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>❌ 缺少 authorization code</h1>');
        return;
      }

      try {
        console.log('\n✅ 收到授权回调，正在交换 Token...');
        const tokens = await exchangeCodeForTokens(code);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <h1>✅ 授权成功！</h1>
          <p>Refresh Token 已获取，请回到终端查看。</p>
          <p>你可以关闭此页面。</p>
        `);

        server.close();
        resolvePromise(tokens);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>❌ Token 交换失败</h1><p>${err.message}</p>`);
        server.close();
        reject(err);
      }
    });

    server.listen(3939, () => {
      console.log('🌐 回调服务器已启动，监听 http://localhost:3939/oauth/callback');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error('端口 3939 已被占用，请关闭占用进程后重试'));
      } else {
        reject(err);
      }
    });
  });
}

// ============ 主流程 ============

async function main() {
  console.log('🔑 Google Search Console OAuth 授权工具\n');
  console.log('=' .repeat(60));

  const authUrl = buildAuthUrl();

  console.log('\n📋 请在浏览器中打开以下 URL 进行授权：\n');
  console.log(authUrl);
  console.log('\n' + '='.repeat(60));
  console.log('⏳ 等待授权回调...\n');

  try {
    const tokens = await startCallbackServer();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 授权成功！\n');

    if (tokens.refresh_token) {
      console.log('📝 请将以下 Refresh Token 保存到 scripts/.env 文件中：\n');
      console.log(`GSC_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('\n' + '='.repeat(60));
      console.log('💡 提示：Refresh Token 只在首次授权时返回。');
      console.log('   如果需要重新获取，请在 Google 账号设置中撤销应用权限后重试。');
    } else {
      console.log('⚠️ 未返回 Refresh Token。');
      console.log('   这通常是因为之前已经授权过。');
      console.log('   请在 https://myaccount.google.com/permissions 撤销应用权限后重试。');
    }

    if (tokens.access_token) {
      console.log(`\n📎 Access Token（临时，约1小时有效）：\n${tokens.access_token}`);
    }
  } catch (err) {
    console.error(`\n❌ 授权流程失败: ${err.message}`);
    process.exit(1);
  }
}

main();
