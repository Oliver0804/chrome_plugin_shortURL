/*
 * AMO 商店頁更新腳本（Short URL Copier）：
 * 更新 listing 的摘要、描述、連結、分類，並為審核中的版本補上
 * 審核備註（approval_notes）與發布說明（release_notes）。
 * 憑證只從環境變數讀取。
 *
 * 用法：AMO_API_KEY=<issuer> AMO_API_SECRET=<secret> node scripts/amo-update-listing.js
 */
"use strict";

const crypto = require("node:crypto");

const SLUG = "short-url-copier";
const VERSION = "1.3.30";
const API = "https://addons.mozilla.org/api/v5";
const REPO = "https://github.com/Oliver0804/chrome_plugin_shortURL";

const ISSUER = process.env.AMO_API_KEY;
const SECRET = process.env.AMO_API_SECRET;
if (!ISSUER || !SECRET) {
  console.error("請設定 AMO_API_KEY 與 AMO_API_SECRET 環境變數");
  process.exit(1);
}

function makeJwt() {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = b64({ alg: "HS256", typ: "JWT" });
  const payload = b64({ iss: ISSUER, jti: crypto.randomBytes(12).toString("hex"), iat: now - 5, exp: now + 240 });
  const sig = crypto.createHmac("sha256", SECRET).update(head + "." + payload).digest("base64url");
  return head + "." + payload + "." + sig;
}

async function amoFetch(pathname, options = {}) {
  const res = await fetch(API + pathname, {
    ...options,
    headers: { Authorization: "JWT " + makeJwt(), ...(options.headers || {}) },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (_) {
    body = text.slice(0, 500);
  }
  if (!res.ok) {
    throw new Error("AMO " + res.status + " " + pathname + ": " + JSON.stringify(body).slice(0, 800));
  }
  return body;
}

const SUMMARY = {
  "en-US":
    "Copy a cleaned short URL of the current page or any link: tracking parameters removed, site-specific rules, Facebook/TikTok short-link resolution.",
  "zh-TW": "複製當前頁面的簡短網址，自動移除追蹤參數和不必要的查詢字串",
};

const DESCRIPTION = {
  "en-US": [
    "Short URL Copier cleans URLs before you share them: tracking parameters (utm_*, fbclid, gclid and 40+ more) are removed automatically, and site-specific rules keep only the parameters that matter (e.g. YouTube video ID, Taobao item ID).",
    "",
    "Features:",
    "- Floating bubble on any page: single-click copies the cleaned URL, double-click copies the original; drag to reposition (remembered per site)",
    "- Keyboard shortcut Alt+C",
    "- Smart clipboard monitoring: URLs copied via social media 'Copy link' buttons are cleaned automatically",
    "- Facebook /share/ and TikTok vt/vm short links are resolved to their real URLs",
    "- Site rules for YouTube, Instagram, Facebook, X/Twitter, TikTok, Threads, Taobao, Tmall, Shopee, Amazon, eBay, AliExpress, Bilibili, Reddit, LinkedIn, Pinterest, Spotify, Steam, Apple Apps, momo, PChome, Coupang and more",
    "- Right-click context menu: 'Copy clean link' for any link or page",
    "- Options page to toggle the bubble, clipboard monitoring and notifications; custom whitelist and extra parameters to remove",
    "- Unlocks right-click and text selection on sites that block them (optional)",
    "",
    "Privacy: everything is processed locally in your browser. No analytics, no data collection. The only network requests are redirect-following fetches to facebook.com / tiktok.com to resolve share short-links.",
    "",
    "Source code (MPL-2.0): " + REPO,
  ].join("\n"),
  "zh-TW": [
    "Short URL Copier 在你分享連結前自動清理網址：移除 40+ 種追蹤參數（utm_*、fbclid、gclid 等），並依網站規則只保留有意義的參數（例如 YouTube 影片 ID、淘寶商品 ID）。",
    "",
    "功能：",
    "- 每頁可拖曳的浮動氣泡：單擊複製清理後的網址、雙擊複製原始網址，位置依網站自動記憶",
    "- 鍵盤快捷鍵 Alt+C",
    "- 智慧剪貼簿監聽：在社群媒體按「複製連結」時自動清理",
    "- Facebook /share/ 與 TikTok vt/vm 短連結自動解析為真實網址",
    "- 網站規則涵蓋 YouTube、Instagram、Facebook、X/Twitter、TikTok、Threads、淘寶、天貓、蝦皮、Amazon、eBay、AliExpress、Bilibili、Reddit、LinkedIn、Pinterest、Spotify、Steam、Apple、momo、PChome、酷澎等",
    "- 右鍵選單「複製乾淨網址」，支援任何連結或頁面",
    "- 完整設定頁：開關氣泡／剪貼簿監聽／通知，自訂白名單與額外移除參數",
    "- 可選：解鎖右鍵與文字選取",
    "",
    "隱私：所有清理都在瀏覽器本地完成，無任何分析或資料收集。唯一的網路請求是指向 facebook.com / tiktok.com 的重定向解析。",
    "",
    "原始碼（MPL-2.0）：" + REPO,
  ].join("\n"),
};

const APPROVAL_NOTES = [
  "Same extension as the Chrome Web Store listing 'Short URL Copier' (cmcmnlopagkmeackpmhfipcefeinaffg). Source: " + REPO,
  "",
  "Permission justification:",
  "- host_permissions <all_urls> + content script: the floating bubble and context-menu item work on any page; all cleaning rules are client-side (URL_RULES in background.js).",
  "- clipboardWrite: writes the cleaned URL. clipboardRead: only for the opt-in 'smart clipboard monitoring' feature, which cleans URLs the user copies.",
  "- Background fetch to facebook.com / tiktok.com (redirect: follow) resolves /share/ and vt/vm.tiktok.com short links; results cached in chrome.storage.session (cleared when the browser closes).",
  "- No analytics, no remote code, no data collection.",
].join("\n");

const RELEASE_NOTES = {
  "en-US": "First Firefox release (same codebase as Chrome Web Store v1.3.30).",
  "zh-TW": "首個 Firefox 版本（與 Chrome 線上應用程式商店 v1.3.30 同一程式碼）。",
};

async function main() {
  console.log("更新 listing 中…");
  await amoFetch("/addons/addon/" + SLUG + "/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: SUMMARY,
      description: DESCRIPTION,
      homepage_url: REPO,
      support_url: { "en-US": REPO + "/issues", "zh-TW": REPO + "/issues" },
      categories: { firefox: ["privacy-security"] },
    }),
  });
  console.log("✓ listing 已更新（摘要／描述／連結／分類）");

  console.log("補上審核備註與 release notes…");
  await amoFetch("/addons/addon/" + SLUG + "/versions/" + VERSION + "/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      approval_notes: APPROVAL_NOTES,
      release_notes: RELEASE_NOTES,
    }),
  });
  console.log("✓ 審核備註與 release notes 已更新");

  const detail = await amoFetch("/addons/addon/" + SLUG + "/?lang=zh-TW");
  console.log("--- 目前狀態 ---");
  console.log("名稱:", JSON.stringify(detail.name));
  console.log("狀態:", detail.status);
  console.log("分類:", JSON.stringify(detail.categories));
  console.log("首頁:", JSON.stringify(detail.homepage));
}

main().catch((e) => {
  console.error("✗ " + e.message);
  process.exit(1);
});
