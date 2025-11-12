# Chrome 插件 - Short URL Copier 專案結構分析

## 📁 核心檔案結構

```
shortURL/
├── manifest.json              # 擴充功能配置（MV3）
├── background.js              # 背景腳本 - URL 清理邏輯核心
├── content.js                 # 內容腳本 - 浮動氣泡 & 剪貼簿監聽
├── content.css                # 浮動氣泡樣式
├── popup.html/css/js          # 擴充彈出視窗
├── options.html/css/js        # 設定頁面
├── icons/                     # 圖示檔案
├── logo.png                   # Logo 圖檔
└── URL-FILTER-RULES.md        # URL 過濾規則文件（版本 v1.3.3）
```

---

## 🔑 關鍵檔案詳解

### 1. background.js - URL 過濾規則定義與處理核心

**位置**: `/Users/oliver/code/chrome-plugin/shortURL/background.js`

**核心功能**:
- 定義 `URL_RULES` 物件，包含所有網站的過濾規則
- 實作 `cleanURL()` 函數進行 URL 清理
- 實作 `transformShopeeURL()` 函數進行蝦皮 URL 轉換
- 監聽來自 content script 的訊息並回傳清理結果

**規則結構**:
```javascript
const URL_RULES = {
  'hostname': {
    keepParams: ['param1', 'param2'],  // 保留模式：只保留指定參數
    // 或
    removeParams: ['param1', 'param2'], // 移除模式：移除指定參數
    // 或
    pathTransform: true                 // 路徑轉換（如蝦皮購物）
  },
  '*': {  // 通用規則：所有網站都會套用
    removeParams: [...]
  }
}
```

**支援的網站與規則**:

| 網站 | 域名 | 模式 | 參數 |
|------|------|------|------|
| 淘寶 | item.taobao.com | keepParams | ['id'] |
| 天貓 | detail.tmall.com | keepParams | ['id'] |
| 蝦皮購物 | shopee.tw | pathTransform + keepParams | [] |
| Instagram | instagram.com, www.instagram.com | keepParams | [] |
| YouTube | youtube.com, youtu.be | keepParams | ['v', 'list'] (youtu.be: []) |
| Facebook | facebook.com, m.facebook.com | keepParams | ['fbid'] |
| Twitter/X | twitter.com, x.com | removeParams | ['s', 't', 'src'] |
| TikTok | tiktok.com, www.tiktok.com | removeParams | ['is_from_webapp', 'sender_device', 'web_id'] |
| LinkedIn | linkedin.com, www.linkedin.com | keepParams | ['trackingId'] |
| Pinterest | pinterest.com, www.pinterest.com | removeParams | ['mt', 'source_app_id'] |
| Reddit | reddit.com, www.reddit.com | removeParams | ['share_id', 'context'] |
| Amazon | amazon.com, www.amazon.com | keepParams | ['keywords', 'qid', 'sr'] |
| eBay | ebay.com, www.ebay.com | keepParams | ['hash', 'item'] |
| AliExpress | aliexpress.com, www.aliexpress.com | removeParams | ['srcSns', 'spreadType', 'bizType', 'social_params'] |

**蝦皮 URL 轉換示例**:
```
輸入:  https://shopee.tw/商品名稱-i.12345.67890?utm_source=test
轉換:  https://shopee.tw/product/12345/67890
```

---

### 2. content.js - 使用者互動與剪貼簿監聽

**位置**: `/Users/oliver/code/chrome-plugin/shortURL/content.js`

**兩大核心功能**:

#### 功能一：浮動氣泡 (initBubble)
- 在網頁右下角顯示可拖曳的粉紅色氣泡按鈕
- **單擊**: 複製清理後的當前頁面 URL
- **雙擊**: 複製原始 URL
- **拖曳**: 調整位置（會記憶每個網域的位置）
- **鍵盤快捷鍵**: Alt + C

#### 功能二：剪貼簿監聽 (initClipboardMonitoring)
- 監聽頁面的 `copy` 事件
- 每 500ms 輪詢檢查剪貼簿內容
- 自動偵測並清理複製的 URL
- 適用於社群媒體的「複製連結」按鈕

**通訊架構**:
```
content.js 
  ↓ (chrome.runtime.sendMessage)
background.js (cleanURL function)
  ↓ (sendResponse)
content.js (處理清理後的 URL)
```

---

### 3. background.js - 訊息監聽與核心函數

**cleanURL() 函數邏輯流程**:

```
1. 解析 URL 為 URL 物件
2. 取得 hostname
3. 查找 URL_RULES 中的匹配規則
4. 如果有 pathTransform：執行路徑轉換（蝦皮）
5. 如果有 keepParams：
   - 建立新 URLSearchParams
   - 只保留指定的參數
   - 其他參數全部移除
6. 如果有 removeParams：
   - 移除指定的參數
   - 同時套用通用規則中的 removeParams
7. 返回清理後的 URL 字符串
```

**優先級順序**:
```
特定網站 keepParams > 特定網站 removeParams + 通用規則 > 純通用規則
```

---

### 4. URL-FILTER-RULES.md - 規則文檔

**位置**: `/Users/oliver/code/chrome-plugin/shortURL/URL-FILTER-RULES.md`

**包含內容**:
- 過濾邏輯說明
- 網站特定規則詳細列表
- 通用追蹤參數清理規則（40+ 參數）
- 技術實作說明
- 使用情境示例
- 維護與更新指南

**通用追蹤參數清理列表** (完整移除參數):
- **Google Analytics**: utm_source, utm_medium, utm_campaign, utm_term, utm_content, _ga, _gl 等
- **Facebook Ads**: fbclid, _fbc, _fbp
- **Google Ads**: gclid, gclsrc, _gcl_aw
- **微軟廣告**: msclkid
- **TikTok Ads**: ttclid
- **Snapchat**: ScCid
- **Email 行銷**: mc_cid, mc_eid, emci, emdi, ceid
- **社群分享**: share, share_id, shared, socialref, hootPostID, __s
- **淘寶系**: spm, scm, algo_expid, algo_pvid, btsid
- **其他**: ref, referer, referrer, source, sourceid, rsid, pvid, pos, abbucket, ws_ab_test

---

## 🔄 新增網站支援步驟

### 方案一：只移除追蹤參數（removeParams）

```javascript
// 在 background.js 的 URL_RULES 中添加：
'example.com': {
  removeParams: ['param1', 'param2', 'param3']
},
'www.example.com': {
  removeParams: ['param1', 'param2', 'param3']
}
```

**適用場景**: 網站有特定的追蹤參數需要移除，但保留其他參數。

### 方案二：只保留必要參數（keepParams）

```javascript
// 在 background.js 的 URL_RULES 中添加：
'example.com': {
  keepParams: ['product_id', 'category']
},
'www.example.com': {
  keepParams: ['product_id', 'category']
}
```

**適用場景**: 網站 URL 複雜，只需保留幾個關鍵參數。

### 方案三：路徑轉換（pathTransform）

```javascript
// 在 background.js 中添加轉換函數：
function transformExampleURL(url) {
  // 自定義路徑轉換邏輯
  const match = url.pathname.match(/某個正則表達式/);
  if (match) {
    url.pathname = '/新路徑/' + match[1];
    return true;
  }
  return false;
}

// 在 URL_RULES 中添加：
'example.com': {
  pathTransform: true,
  keepParams: []
},

// 在 cleanURL 函數中添加條件：
if (rule.pathTransform && hostname === 'example.com') {
  transformExampleURL(url);
}
```

**適用場景**: 蝦皮購物這樣需要將長 URL 轉換為短 URL 格式的情況。

---

## 🛠️ 實作機制詳解

### 蝦皮購物 URL 轉換實現

**原始長 URL**:
```
https://shopee.tw/商品名稱-i.12345.67890?utm_source=...&utm_campaign=...
```

**轉換函數** (transformShopeeURL):
```javascript
function transformShopeeURL(url) {
  // 正則匹配: -i.店鋪ID.商品ID
  const longFormatMatch = url.pathname.match(/-i\.(\d+)\.(\d+)/);
  
  if (longFormatMatch) {
    const shopId = longFormatMatch[1];      // 12345
    const productId = longFormatMatch[2];   // 67890
    
    // 轉換為短格式: /product/店鋪ID/商品ID
    url.pathname = `/product/${shopId}/${productId}`;
    return true;
  }
  return false;
}
```

**轉換結果**:
```
https://shopee.tw/product/12345/67890
```

---

## 📊 設定系統架構

### 設定儲存位置
使用 Chrome Storage API (`chrome.storage.local`):

```javascript
{
  settings: {
    showBubble: true,           // 顯示浮動氣泡
    showNotifications: true     // 顯示通知訊息
  },
  bubblePositions: {
    'domain1.com': {x: 100, y: 200, timestamp: ...},
    'domain2.com': {x: 150, y: 250, timestamp: ...}
  }
}
```

### 設定檔案
- **popup.js**: 簡單開關（Popup 視窗中）
- **options.js**: 完整設定頁面
- **content.js**: 讀取設定控制功能顯示

---

## 🔌 通訊流程

### 1. 複製 URL (用戶點擊氣泡)

```
用戶點擊氣泡
  ↓
content.js: bubble.addEventListener('mousedown')
  ↓
content.js: chrome.runtime.sendMessage({action: 'cleanURL', url: currentURL})
  ↓
background.js: chrome.runtime.onMessage.addListener()
  ↓
background.js: cleanURL(request.url)
  ↓
background.js: sendResponse({cleanedURL: cleanedURL})
  ↓
content.js: copyToClipboard(response.cleanedURL)
  ↓
用戶剪貼簿獲得清理後的 URL
```

### 2. 自動清理剪貼簿

```
用戶複製 URL（Ctrl+C 或點擊「複製連結」）
  ↓
content.js: document.addEventListener('copy')
  ↓
content.js: chrome.runtime.sendMessage({action: 'cleanURL', url: selection})
  ↓
background.js: cleanURL() 返回清理結果
  ↓
如果 URL 被修改：
content.js: navigator.clipboard.writeText(cleanedURL)
  ↓
用戶剪貼簿自動更新為清理後的 URL
  ↓
content.js: showNotification('✓ 已自動清理並複製網址！')
```

---

## ✅ 版本信息

**當前版本**: v1.3.4 (2025-01-10)

**最近更新**:
- v1.3.4: 新增蝦皮購物 URL 支援 + 自動短網址轉換
- v1.3.3: 新增天貓 URL 支援
- v1.3.2: 剪貼簿監聽核心功能優化
- v1.3.0: 新增完整設定頁面
- v1.2.0: 智能剪貼簿監聽功能
- v1.1.0: 多網站支援 + 位置記憶
- v1.0.0: 初始版本

---

## 📌 重要位置對應表

| 功能 | 檔案 | 函數/位置 |
|------|------|----------|
| URL 過濾規則 | background.js | `URL_RULES` 物件 (行 1-142) |
| URL 清理邏輯 | background.js | `cleanURL()` 函數 (行 170-217) |
| 蝦皮轉換 | background.js | `transformShopeeURL()` 函數 (行 149-163) |
| 訊息監聽 | background.js | `chrome.runtime.onMessage.addListener()` (行 220-226) |
| 浮動氣泡顯示 | content.js | `initBubble()` 函數 (行 176-419) |
| 剪貼簿監聽 | content.js | `initClipboardMonitoring()` 函數 (行 65-171) |
| 通知訊息 | content.js | `showNotification()` 函數 (行 45-60) |
| 設定加載 | options.js | `loadSettings()` 函數 (行 21-34) |
| 設定儲存 | options.js | `saveSettings()` 函數 (行 39-54) |
| 規則文檔 | URL-FILTER-RULES.md | 完整參考 |

