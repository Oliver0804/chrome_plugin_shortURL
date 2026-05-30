// URL 清理規則配置
const URL_RULES = {
  // 淘寶：只保留 id 參數
  'item.taobao.com': {
    keepParams: ['id']
  },

  // 天貓：只保留 id 參數
  'detail.tmall.com': {
    keepParams: ['id']
  },

  // Instagram：移除所有查詢參數
  'www.instagram.com': {
    keepParams: []
  },
  'instagram.com': {
    keepParams: []
  },

  // YouTube：保留 v（影片 ID）、t（時間戳記）、list（播放清單）和 lc（留言定位）參數
  'www.youtube.com': {
    keepParams: ['v', 't', 'list', 'lc']
  },
  'youtu.be': {
    keepParams: ['t', 'list', 'lc']
  },
  'youtube.com': {
    keepParams: ['v', 't', 'list', 'lc']
  },
  'music.youtube.com': {
    keepParams: ['v', 't', 'list', 'lc']
  },

  // Facebook：只保留 fbid 參數，並處理分享連結轉換
  'www.facebook.com': {
    keepParams: ['fbid'],
    pathTransform: true
  },
  'facebook.com': {
    keepParams: ['fbid'],
    pathTransform: true
  },
  'm.facebook.com': {
    keepParams: ['fbid'],
    pathTransform: true
  },

  // Twitter/X：移除追蹤參數
  'twitter.com': {
    removeParams: ['s', 't', 'src']
  },
  'x.com': {
    removeParams: ['s', 't', 'src']
  },

  // TikTok：移除追蹤參數
  'www.tiktok.com': {
    removeParams: ['is_from_webapp', 'sender_device', 'web_id']
  },
  'tiktok.com': {
    removeParams: ['is_from_webapp', 'sender_device', 'web_id']
  },

  // LinkedIn：保留重要參數
  'www.linkedin.com': {
    keepParams: ['trackingId']
  },
  'linkedin.com': {
    keepParams: ['trackingId']
  },

  // Pinterest：移除追蹤參數
  'www.pinterest.com': {
    removeParams: ['mt', 'source_app_id']
  },
  'pinterest.com': {
    removeParams: ['mt', 'source_app_id']
  },

  // Reddit：保留必要參數
  'www.reddit.com': {
    removeParams: ['share_id', 'context']
  },
  'reddit.com': {
    removeParams: ['share_id', 'context']
  },

  // Amazon：商品 ID 在路徑 /dp/，query 皆為追蹤，全部移除
  'www.amazon.com': {
    keepParams: []
  },
  'amazon.com': {
    keepParams: []
  },

  // eBay：只保留必要參數
  'www.ebay.com': {
    keepParams: ['hash', 'item']
  },
  'ebay.com': {
    keepParams: ['hash', 'item']
  },

  // AliExpress：只保留商品 ID
  'www.aliexpress.com': {
    removeParams: ['srcSns', 'spreadType', 'bizType', 'social_params']
  },
  'aliexpress.com': {
    removeParams: ['srcSns', 'spreadType', 'bizType', 'social_params']
  },

  // Bilibili：移除所有查詢參數
  'www.bilibili.com': {
    keepParams: []
  },
  'bilibili.com': {
    keepParams: []
  },

  // Threads：移除所有查詢參數（支援 .com 和 .net）
  'www.threads.com': {
    keepParams: []
  },
  'threads.com': {
    keepParams: []
  },
  'www.threads.net': {
    keepParams: []
  },
  'threads.net': {
    keepParams: []
  },

  // Sora (ChatGPT AI 影片生成)：移除分享追蹤參數，ID 已在路徑中
  'sora.chatgpt.com': {
    keepParams: []
  },

  // 抖音：保留 modal_id 參數（用於直接打開視頻）
  'www.douyin.com': {
    keepParams: ['modal_id']
  },
  'douyin.com': {
    keepParams: ['modal_id']
  },

  // 酷澎台灣 (Coupang Taiwan)：移除所有查詢參數，商品 ID 已在路徑中
  'www.tw.coupang.com': {
    keepParams: []
  },
  'tw.coupang.com': {
    keepParams: []
  },

  // 蝦皮購物：轉換為短 URL 格式
  'shopee.tw': {
    pathTransform: true,
    keepParams: []
  },

  // Google 搜尋：只保留 q（搜尋關鍵字）
  'google.com': {
    keepParams: ['q']
  },
  'google.com.tw': {
    keepParams: ['q']
  },

  // Spotify：移除 si 等分享追蹤，ID 已在路徑
  'open.spotify.com': {
    keepParams: []
  },

  // 小紅書：保留 xsec_token（必要，缺少無法開啟），移除其他追蹤
  'xiaohongshu.com': {
    keepParams: ['xsec_token']
  },

  // momo 購物：只保留 i_code（商品碼）
  'momoshop.com.tw': {
    keepParams: ['i_code']
  },

  // PChome 24h：移除查詢參數，商品 ID 已在路徑
  '24h.pchome.com.tw': {
    keepParams: []
  },

  // Steam：移除追蹤參數，appid 已在路徑
  'store.steampowered.com': {
    removeParams: ['snr', 'curator_clanid']
  },

  // Apple App Store：移除聯盟與追蹤參數
  'apps.apple.com': {
    removeParams: ['uo', 'at', 'ct', 'itscg', 'itsct', 'app', 'mt']
  },

  // Apple Music：移除聯盟追蹤（保留 i 單曲定位、l 語言）
  'music.apple.com': {
    removeParams: ['uo', 'at', 'ct', 'itscg', 'itsct', 'app', 'mt']
  },

  // Medium：移除來源追蹤
  'medium.com': {
    removeParams: ['source', 'sk']
  },

  // Booking.com：移除追蹤參數
  'booking.com': {
    removeParams: ['aid', 'label', 'sid', 'srpvid', 'from_sf']
  },

  // 通用規則：移除常見追蹤參數
  '*': {
    removeParams: [
      // Google Analytics & UTM 參數
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      '_ga', '_gl', 'ga_source', 'ga_medium', 'ga_campaign', 'ga_term', 'ga_content',

      // 廣告平台追蹤參數
      'fbclid', '_fbc', '_fbp',           // Facebook
      'gclid', 'gclsrc', '_gcl_aw',       // Google Ads
      'gad_source', 'gad_campaignid',     // Google Ads (extended)
      'gbraid', 'wbraid',                  // Google Click ID (iOS/web)
      'dclid',                             // Google Display Ads
      'msclkid',                           // Microsoft Ads
      'ttclid',                            // TikTok Ads
      'ScCid',                             // Snapchat
      'li_fat_id',                         // LinkedIn

      // Email 行銷追蹤
      'mc_cid', 'mc_eid',                  // Mailchimp
      'emci', 'emdi', 'ceid',              // Other email marketing

      // Social Media 分享追蹤
      'share', 'share_id', 'shared',
      'socialref', 'hootPostID', '__s',

      // 其他常見追蹤參數
      'ref', 'referer', 'referrer', 'source', 'sourceid',
      'rsid', 'spm', 'scm', 'pvid', 'pos', 'abbucket',
      'algo_expid', 'algo_pvid', 'btsid', 'ws_ab_test'
    ]
  }
};

// 短連結解析結果快取（service worker 生命週期內），避免同一連結重複 fetch
const shortLinkCache = new Map();

// 使用者自訂設定的記憶體快取，供同步的 cleanURLSync 直接讀取
const userSettings = {
  customWhitelist: [],     // 不清理的網域清單（含子網域）
  customRemoveParams: []   // 全站額外移除的查詢參數
};

/**
 * 將設定值正規化為字串陣列
 * 支援陣列、或以換行/逗號分隔的字串
 * @param {string|string[]} value
 * @returns {string[]}
 */
function parseSettingList(value) {
  if (Array.isArray(value)) {
    return value.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * 從 chrome.storage 載入自訂設定到記憶體快取
 * @returns {Promise<void>}
 */
async function ensureSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    userSettings.customWhitelist = parseSettingList(settings.customWhitelist)
      .map(d => d.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''));
    userSettings.customRemoveParams = parseSettingList(settings.customRemoveParams);
  } catch (error) {
    console.error('載入自訂設定失敗:', error);
  }
}

// 啟動時載入一次
ensureSettings();

// 設定變更時即時更新快取
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) {
    ensureSettings();
  }
});

/**
 * 檢查 hostname 是否落在使用者白名單內（比對裸網域與子網域）
 * @param {string} hostname
 * @returns {boolean}
 */
function isWhitelisted(hostname) {
  const host = hostname.toLowerCase();
  return userSettings.customWhitelist.some(domain => {
    return host === domain || host.endsWith('.' + domain);
  });
}

/**
 * 檢查是否為 Facebook 分享短連結
 * @param {URL} url - URL 物件
 * @returns {boolean} - 是否為分享短連結
 */
function isFacebookShareLink(url) {
  const hostname = url.hostname;
  if (hostname !== 'www.facebook.com' && hostname !== 'facebook.com' && hostname !== 'm.facebook.com') {
    return false;
  }
  // 匹配 /share/r/, /share/p/, /share/v/ 格式
  return /^\/share\/[rpv]\/[a-zA-Z0-9]+\/?$/.test(url.pathname);
}

/**
 * 偵測 Facebook 分享短連結類型
 * @param {URL} url - URL 物件
 * @returns {{type: string, shareId: string}|null} - 類型和 shareId，或 null
 */
function detectFacebookShareLink(url) {
  const hostname = url.hostname;
  if (hostname !== 'www.facebook.com' && hostname !== 'facebook.com' && hostname !== 'm.facebook.com') {
    return null;
  }
  // 匹配 /share/r/, /share/p/, /share/v/ 格式
  const match = url.pathname.match(/^\/share\/([rpv])\/([a-zA-Z0-9]+)\/?$/);
  if (match) {
    const typeMap = { 'r': 'reel', 'p': 'post', 'v': 'video' };
    return { type: typeMap[match[1]], shareId: match[2] };
  }
  return null;
}

/**
 * 從 HTML 內容中提取真實 URL
 * @param {string} html - HTML 內容
 * @returns {string|null} - 提取的 URL 或 null
 */
function extractUrlFromHtml(html) {
  // 方法 1: 從 og:url meta tag 提取
  const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
  if (ogUrlMatch && ogUrlMatch[1]) {
    return ogUrlMatch[1];
  }

  // 方法 2: 從 canonical link 提取
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch && canonicalMatch[1]) {
    return canonicalMatch[1];
  }

  // 方法 3: 從 redirect URL 提取 (Facebook 有時會在頁面中嵌入)
  const redirectMatch = html.match(/"redirect_url":"([^"]+)"/);
  if (redirectMatch && redirectMatch[1]) {
    return redirectMatch[1].replace(/\\/g, '');
  }

  return null;
}

/**
 * 清理 Facebook URL，移除追蹤參數
 * @param {string} urlString - URL 字串
 * @returns {string} - 清理後的 URL
 */
function cleanFacebookUrl(urlString) {
  try {
    const url = new URL(urlString);

    // Reel: /reel/{id}/
    const reelMatch = url.pathname.match(/^\/reel\/(\d+)\/?/);
    if (reelMatch) {
      return `https://www.facebook.com/reel/${reelMatch[1]}/`;
    }

    // Watch: /watch/?v={id}
    if (url.pathname.startsWith('/watch')) {
      const videoId = url.searchParams.get('v');
      if (videoId) {
        return `https://www.facebook.com/watch/?v=${videoId}`;
      }
    }

    // Photo: /photo/?fbid={id}
    if (url.pathname.startsWith('/photo')) {
      const fbid = url.searchParams.get('fbid');
      if (fbid) {
        return `https://www.facebook.com/photo/?fbid=${fbid}`;
      }
    }

    // 其他情況：移除常見追蹤參數
    const paramsToRemove = ['fs', 'rdid', 'share_url', 'mibextid', '__cft__', '__tn__', 'refsrc', '_rdr'];
    paramsToRemove.forEach(param => url.searchParams.delete(param));

    // 標準化 hostname 為 www.facebook.com
    url.hostname = 'www.facebook.com';

    return url.toString();
  } catch (error) {
    return urlString;
  }
}

/**
 * 解析 Facebook 分享短連結，取得真實 URL
 * 透過 fetch 追蹤重定向來取得最終 URL
 * @param {string} shareUrl - 分享短連結
 * @returns {Promise<string>} - 解析後的真實 URL
 */
async function resolveFacebookShareLink(shareUrl) {
  try {
    console.log('[FB Share] 開始解析:', shareUrl);

    // 方法 A: 使用 redirect: 'follow' 自動跟隨重定向
    // Service Worker 中 fetch 會自動跟隨重定向，最終 response.url 就是目標 URL
    const response = await fetch(shareUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });

    const finalUrl = response.url;
    console.log('[FB Share] 重定向後 URL:', finalUrl);

    // 檢查是否已經離開 /share/ 路徑（解析成功）
    const finalUrlObj = new URL(finalUrl);
    if (!finalUrlObj.pathname.includes('/share/')) {
      const cleanedUrl = cleanFacebookUrl(finalUrl);
      console.log('[FB Share] 方法 A 成功:', cleanedUrl);
      return cleanedUrl;
    }

    // 方法 B: 如果重定向沒有離開 /share/，嘗試從 HTML 內容提取
    console.log('[FB Share] 方法 A 未成功，嘗試從 HTML 提取...');
    const html = await response.text();
    const extractedUrl = extractUrlFromHtml(html);

    if (extractedUrl) {
      const cleanedUrl = cleanFacebookUrl(extractedUrl);
      console.log('[FB Share] 方法 B 成功:', cleanedUrl);
      return cleanedUrl;
    }

    // 如果都失敗，返回原始連結（已清理）
    console.log('[FB Share] 解析失敗，返回原始連結');
    const url = new URL(shareUrl);
    url.search = '';
    return url.toString();

  } catch (error) {
    console.error('[FB Share] 解析失敗:', error);
    // 如果解析失敗，返回原始連結（已清理參數）
    try {
      const url = new URL(shareUrl);
      url.search = '';
      return url.toString();
    } catch {
      return shareUrl;
    }
  }
}

/**
 * 轉換 Facebook 分享連結為原始連結（同步版本，處理已展開的 URL）
 * 支援：
 * - /reel/{id}/?fs=e&rdid=...&share_url=... → /reel/{id}/
 * - /watch/?v={id}&... → /watch/?v={id}
 * - /photo/?fbid={id}&... → /photo/?fbid={id}
 * @param {URL} url - URL 物件
 * @returns {boolean} - 是否成功轉換
 */
function transformFacebookURL(url) {
  const pathname = url.pathname;

  // 處理已展開的 Reel URL: /reel/{id}/?fs=e&rdid=...&share_url=...
  const reelMatch = pathname.match(/^\/reel\/(\d+)\/?$/);
  if (reelMatch) {
    // 清除所有參數，只保留乾淨的 reel URL
    url.search = '';
    url.pathname = `/reel/${reelMatch[1]}/`;
    return true;
  }

  // 處理 /watch/?v={video_id}&... 格式
  const watchMatch = pathname.match(/^\/watch\/?$/);
  if (watchMatch && url.searchParams.has('v')) {
    const videoId = url.searchParams.get('v');
    url.search = '';
    url.searchParams.set('v', videoId);
    return true;
  }

  // 處理一般的 Facebook URL（照片、貼文等）
  // /photo/?fbid=... → 只保留 fbid
  const photoMatch = pathname.match(/^\/photo\/?$/);
  if (photoMatch && url.searchParams.has('fbid')) {
    const fbid = url.searchParams.get('fbid');
    url.search = '';
    url.searchParams.set('fbid', fbid);
    return true;
  }

  return false;
}

/**
 * 檢查是否為 TikTok 短連結
 * 支援 vt.tiktok.com 和 vm.tiktok.com 等短連結域名
 * @param {URL} url - URL 物件
 * @returns {boolean} - 是否為 TikTok 短連結
 */
function isTikTokShortLink(url) {
  const hostname = url.hostname;
  // vt.tiktok.com - 分享短連結
  // vm.tiktok.com - 視頻短連結
  return hostname === 'vt.tiktok.com' || hostname === 'vm.tiktok.com';
}

/**
 * 清理 TikTok URL，移除追蹤參數
 * @param {string} urlString - URL 字串
 * @returns {string} - 清理後的 URL
 */
function cleanTikTokUrl(urlString) {
  try {
    const url = new URL(urlString);

    // 標準化 hostname 為 www.tiktok.com
    if (url.hostname === 'tiktok.com') {
      url.hostname = 'www.tiktok.com';
    }

    // 要移除的追蹤參數
    const paramsToRemove = [
      '_r', '_t', '_d',                    // 內部追蹤參數
      'is_from_webapp', 'sender_device',   // 來源追蹤
      'web_id', 'refer',                   // 裝置和來源
      'is_copy_url', 'is_share_url',       // 分享追蹤
      'share_item_id', 'share_app_id',     // 分享來源
      'checksum', 'sec_uid', 'sec_user_id' // 安全相關追蹤
    ];

    paramsToRemove.forEach(param => url.searchParams.delete(param));

    return url.toString();
  } catch (error) {
    return urlString;
  }
}

/**
 * 解析 TikTok 短連結，取得真實 URL
 * 透過 fetch 追蹤重定向來取得最終 URL
 * @param {string} shareUrl - 短連結
 * @returns {Promise<string>} - 解析後的真實 URL
 */
async function resolveTikTokShortLink(shareUrl) {
  try {
    console.log('[TikTok Short] 開始解析:', shareUrl);

    // 使用 redirect: 'follow' 自動跟隨重定向
    const response = await fetch(shareUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });

    const finalUrl = response.url;
    console.log('[TikTok Short] 重定向後 URL:', finalUrl);

    // 檢查是否已經到達 www.tiktok.com
    const finalUrlObj = new URL(finalUrl);
    if (finalUrlObj.hostname === 'www.tiktok.com' || finalUrlObj.hostname === 'tiktok.com') {
      const cleanedUrl = cleanTikTokUrl(finalUrl);
      console.log('[TikTok Short] 解析成功:', cleanedUrl);
      return cleanedUrl;
    }

    // 如果還是短連結域名，嘗試從 HTML 提取
    console.log('[TikTok Short] 重定向未成功，嘗試從 HTML 提取...');
    const html = await response.text();

    // 嘗試從 meta tag 提取
    const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
    if (ogUrlMatch && ogUrlMatch[1]) {
      const cleanedUrl = cleanTikTokUrl(ogUrlMatch[1]);
      console.log('[TikTok Short] 從 og:url 提取成功:', cleanedUrl);
      return cleanedUrl;
    }

    // 嘗試從 canonical 提取
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (canonicalMatch && canonicalMatch[1]) {
      const cleanedUrl = cleanTikTokUrl(canonicalMatch[1]);
      console.log('[TikTok Short] 從 canonical 提取成功:', cleanedUrl);
      return cleanedUrl;
    }

    // 如果都失敗，返回清理後的最終 URL
    console.log('[TikTok Short] 解析失敗，返回重定向後的 URL');
    return cleanTikTokUrl(finalUrl);

  } catch (error) {
    console.error('[TikTok Short] 解析失敗:', error);
    // 如果解析失敗，返回原始連結
    return shareUrl;
  }
}

/**
 * 轉換蝦皮 URL 為短網址格式
 * @param {URL} url - URL 物件
 * @returns {boolean} - 是否成功轉換
 */
function transformShopeeURL(url) {
  // 匹配長 URL 格式: /商品名稱-i.店鋪ID.商品ID
  const longFormatMatch = url.pathname.match(/-i\.(\d+)\.(\d+)/);

  if (longFormatMatch) {
    const shopId = longFormatMatch[1];
    const productId = longFormatMatch[2];

    // 轉換為短 URL 格式: /product/店鋪ID/商品ID
    url.pathname = `/product/${shopId}/${productId}`;
    return true;
  }

  return false;
}

/**
 * 清理 URL，移除不必要的參數（同步版本）
 * @param {string} urlString - 原始 URL
 * @returns {string} - 清理後的 URL
 */
function cleanURLSync(urlString) {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // 使用者白名單：完全跳過清理，原樣返回
    if (isWhitelisted(hostname)) {
      return urlString;
    }

    // 尋找匹配的規則
    let rule = URL_RULES[hostname];

    // hostname 正規化：去掉 www. / m. 前綴後用裸網域再查一次
    // （自動涵蓋行動版與 www 變體，例如 m.youtube.com、www.medium.com）
    if (!rule) {
      const normalizedHost = hostname.replace(/^(www|m)\./, '');
      if (normalizedHost !== hostname) {
        rule = URL_RULES[normalizedHost];
      }
    }

    // 特殊處理：天貓的各種子域名
    if (!rule && (hostname.endsWith('.tmall.com') || hostname === 'tmall.com')) {
      // 商品詳情頁
      if (hostname === 'detail.tmall.com') {
        rule = { keepParams: ['id'] };
      }
      // 店鋪頁面：移除所有查詢參數
      else if (url.pathname.includes('/shop/') || url.searchParams.has('user_number_id')) {
        rule = { keepParams: [] };
      }
    }

    // 如果仍未找到規則，使用通用規則
    if (!rule) {
      rule = URL_RULES['*'];
    }

    // 處理路徑轉換（如蝦皮購物）
    if (rule.pathTransform && hostname === 'shopee.tw') {
      transformShopeeURL(url);
    }

    // 處理 Facebook 路徑轉換（已展開的 URL）
    if (rule.pathTransform && (hostname === 'www.facebook.com' || hostname === 'facebook.com' || hostname === 'm.facebook.com')) {
      if (transformFacebookURL(url)) {
        // 如果 Facebook 轉換成功，直接返回結果（已經處理好參數了）
        return url.toString();
      }
    }

    // 如果有 keepParams 規則，只保留指定參數
    if (rule.keepParams !== undefined) {
      const newParams = new URLSearchParams();

      rule.keepParams.forEach(param => {
        if (url.searchParams.has(param)) {
          newParams.set(param, url.searchParams.get(param));
        }
      });

      url.search = newParams.toString();
    }
    // 如果有 removeParams 規則，移除指定參數
    else if (rule.removeParams) {
      rule.removeParams.forEach(param => {
        url.searchParams.delete(param);
      });

      // 同時應用通用規則
      if (hostname !== '*') {
        URL_RULES['*'].removeParams.forEach(param => {
          url.searchParams.delete(param);
        });
      }
    }

    // 套用使用者自訂的額外移除參數（適用於所有網站）
    if (userSettings.customRemoveParams.length > 0) {
      userSettings.customRemoveParams.forEach(param => {
        url.searchParams.delete(param);
      });
    }

    // 移除末尾的 hash (可選)
    // url.hash = '';

    return url.toString();
  } catch (error) {
    console.error('URL 解析錯誤:', error);
    return urlString;
  }
}

/**
 * 清理 URL，移除不必要的參數（非同步版本，支援 Facebook/TikTok 短連結解析）
 * @param {string} urlString - 原始 URL
 * @returns {Promise<string>} - 清理後的 URL
 */
async function cleanURL(urlString) {
  try {
    const url = new URL(urlString);

    // 檢查是否為 Facebook 分享短連結，如果是則先解析
    if (isFacebookShareLink(url)) {
      if (shortLinkCache.has(urlString)) {
        return shortLinkCache.get(urlString);
      }
      console.log('偵測到 Facebook 分享短連結，正在解析...');
      const resolvedUrl = await resolveFacebookShareLink(urlString);
      console.log('解析完成:', resolvedUrl);
      shortLinkCache.set(urlString, resolvedUrl);
      return resolvedUrl;
    }

    // 檢查是否為 TikTok 短連結，如果是則先解析
    if (isTikTokShortLink(url)) {
      if (shortLinkCache.has(urlString)) {
        return shortLinkCache.get(urlString);
      }
      console.log('偵測到 TikTok 短連結，正在解析...');
      const resolvedUrl = await resolveTikTokShortLink(urlString);
      console.log('解析完成:', resolvedUrl);
      shortLinkCache.set(urlString, resolvedUrl);
      return resolvedUrl;
    }

    // 其他 URL 使用同步版本處理
    return cleanURLSync(urlString);
  } catch (error) {
    console.error('URL 清理錯誤:', error);
    return urlString;
  }
}

// 監聽來自 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cleanURL') {
    // 使用非同步處理
    cleanURL(request.url).then(cleanedURL => {
      sendResponse({ cleanedURL: cleanedURL });
    }).catch(error => {
      console.error('清理 URL 時發生錯誤:', error);
      sendResponse({ cleanedURL: request.url });
    });
    return true;
  }

  if (request.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
    return false;
  }

  return true;
});

// ===== 瀏覽器原生右鍵選單 =====

// 安裝/更新時建立右鍵選單項目
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'copyCleanLink',
      title: '複製乾淨網址',
      contexts: ['link', 'page']
    });
  });
});

// 右鍵選單點擊處理：清理網址後委派 content script 寫入剪貼簿
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'copyCleanLink') {
    return;
  }

  // 連結優先；否則使用當前頁面網址
  const target = info.linkUrl || info.pageUrl || (tab && tab.url);
  if (!target) {
    return;
  }

  try {
    const cleanedURL = await cleanURL(target);

    if (tab && tab.id != null) {
      // Service Worker 無法直接寫剪貼簿，交給 content script 處理並顯示通知
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'copyCleanedUrl', text: cleanedURL },
        () => {
          // content script 未注入（如 chrome:// 頁面）時忽略錯誤
          void chrome.runtime.lastError;
        }
      );
    }
  } catch (error) {
    console.error('右鍵選單清理網址失敗:', error);
  }
});
