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

  // YouTube：只保留 v 和 list 參數
  'www.youtube.com': {
    keepParams: ['v', 'list']
  },
  'youtu.be': {
    keepParams: []
  },
  'youtube.com': {
    keepParams: ['v', 'list']
  },

  // Facebook：只保留 fbid 參數
  'www.facebook.com': {
    keepParams: ['fbid']
  },
  'facebook.com': {
    keepParams: ['fbid']
  },
  'm.facebook.com': {
    keepParams: ['fbid']
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

  // Amazon：只保留商品 ID
  'www.amazon.com': {
    keepParams: ['keywords', 'qid', 'sr']
  },
  'amazon.com': {
    keepParams: ['keywords', 'qid', 'sr']
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

  // 蝦皮購物：轉換為短 URL 格式
  'shopee.tw': {
    pathTransform: true,
    keepParams: []
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
 * 清理 URL，移除不必要的參數
 * @param {string} urlString - 原始 URL
 * @returns {string} - 清理後的 URL
 */
function cleanURL(urlString) {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // 尋找匹配的規則
    let rule = URL_RULES[hostname] || URL_RULES['*'];

    // 處理路徑轉換（如蝦皮購物）
    if (rule.pathTransform && hostname === 'shopee.tw') {
      transformShopeeURL(url);
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

    // 移除末尾的 hash (可選)
    // url.hash = '';

    return url.toString();
  } catch (error) {
    console.error('URL 解析錯誤:', error);
    return urlString;
  }
}

// 監聽來自 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cleanURL') {
    const cleanedURL = cleanURL(request.url);
    sendResponse({ cleanedURL: cleanedURL });
  }
  return true;
});
