# URL 過濾規則文件

> **Short URL Copier** Chrome 插件 - URL 清理規則說明文件
>
> 版本：v1.3.6
> 最後更新：2025-01-10

---

## 📋 目錄

1. [概述](#概述)
2. [過濾邏輯說明](#過濾邏輯說明)
3. [網站特定規則](#網站特定規則)
4. [通用追蹤參數過濾](#通用追蹤參數過濾)
5. [技術實作說明](#技術實作說明)

---

## 概述

本插件透過過濾 URL 中的追蹤參數和不必要資訊，產生更簡短、乾淨的網址。支援兩種過濾模式：

- **保留模式 (keepParams)**: 只保留指定的必要參數
- **移除模式 (removeParams)**: 移除指定的追蹤參數

所有未被特定規則覆蓋的網站，都會套用通用追蹤參數過濾規則。

---

## 過濾邏輯說明

### 處理流程

1. 解析 URL 並取得主機名稱（hostname）
2. 查找是否有針對該網站的特定規則
3. 如果有 `keepParams` 規則：
   - 只保留指定的參數
   - 其他所有參數都會被移除
4. 如果有 `removeParams` 規則：
   - 移除指定的參數
   - **同時套用通用追蹤參數過濾**
5. 如果沒有特定規則，套用通用過濾規則

### 優先級

```
特定網站 keepParams > 特定網站 removeParams + 通用規則 > 純通用規則
```

---

## 網站特定規則

### 🛒 電商平台

#### 淘寶 / 天貓 (item.taobao.com, detail.tmall.com)
- **模式**: 保留模式
- **保留參數**: `id`
- **說明**: 只保留商品 ID，移除所有追蹤參數

**範例**:
```
淘寶原始: https://item.taobao.com/item.htm?id=123456&spm=a2xxx&abbucket=3
淘寶清理: https://item.taobao.com/item.htm?id=123456

天貓原始: https://detail.tmall.com/item.htm?bxsign=xxx&id=679540837892&tbSocialPopKey=shareItem
天貓清理: https://detail.tmall.com/item.htm?id=679540837892
```

---

#### Amazon (amazon.com, www.amazon.com)
- **模式**: 保留模式
- **保留參數**: `keywords`, `qid`, `sr`
- **說明**: 保留搜尋關鍵字和查詢必要參數

**範例**:
```
原始: https://www.amazon.com/s?k=laptop&ref=nb_sb_noss&qid=1234&sr=8-1
清理: https://www.amazon.com/s?keywords=laptop&qid=1234&sr=8-1
```

---

#### eBay (ebay.com, www.ebay.com)
- **模式**: 保留模式
- **保留參數**: `hash`, `item`
- **說明**: 只保留商品識別參數

---

#### AliExpress (aliexpress.com, www.aliexpress.com)
- **模式**: 移除模式
- **移除參數**: `srcSns`, `spreadType`, `bizType`, `social_params`
- **說明**: 移除社群分享追蹤參數

---

### 📱 社群媒體

#### Instagram (instagram.com, www.instagram.com, m./web. 子網域, ig.me)
- **模式**: 專用清理（`cleanInstagramUrl`）
- **保留參數**: *無*
- **說明**:
  - 移除所有查詢參數（`igsh`、`igsi`、`img_index`、`utm_*` 等）與 hash
  - 網域統一為 `www.instagram.com`
  - `/reels/{code}`、`/{帳號}/reel/{code}` 一律正規化為 `/reel/{code}/`
  - **新版分享短連結**（`/share/...`、`ig.me/...`）追蹤碼在路徑中，改用跟隨重定向解析出真實貼文網址

**範例**:
```
原始: https://www.instagram.com/p/ABC123/?utm_source=ig_web_copy_link
清理: https://www.instagram.com/p/ABC123/

原始: https://www.instagram.com/reel/Db8agK8JHDN/?igsi=ZjFydTZ0cmY0amsx
清理: https://www.instagram.com/reel/Db8agK8JHDN/

原始: https://instagram.com/reels/Db8agK8JHDN/?igsh=xxxx
清理: https://www.instagram.com/reel/Db8agK8JHDN/

原始: https://www.instagram.com/share/reel/_pAbCdEf/    ← 需要連線解析
清理: https://www.instagram.com/reel/Db8agK8JHDN/
```

> 解析不到真實網址時（例如未登入被擋在登入頁），會退回移除參數後的原分享連結，
> 連結仍可正常開啟，且不會寫入快取，下次可再重試。

---

#### Meta 外連跳轉 (l.instagram.com, l.facebook.com, lm.facebook.com, l.messenger.com)
- **模式**: 拆包裝
- **說明**: 取出 `u` 參數中的真實網址，再依該網址所屬網站的規則繼續清理

**範例**:
```
原始: https://l.instagram.com/?u=https%3A%2F%2Fexample.com%2Fa%3Futm_source%3Dig&e=ATxxx
清理: https://example.com/a
```

---

#### Facebook (facebook.com, www.facebook.com, m.facebook.com)
- **模式**: 保留模式
- **保留參數**: `fbid`
- **說明**: 只保留 Facebook ID 參數

**範例**:
```
原始: https://www.facebook.com/photo?fbid=123456&set=a.789&__tn__=abc
清理: https://www.facebook.com/photo?fbid=123456
```

---

#### Twitter/X (twitter.com, x.com)
- **模式**: 移除模式
- **移除參數**: `s`, `t`, `src`
- **說明**: 移除推文分享追蹤參數

**範例**:
```
原始: https://twitter.com/user/status/123?s=20&t=abc
清理: https://twitter.com/user/status/123
```

---

#### TikTok (tiktok.com, www.tiktok.com)
- **模式**: 移除模式
- **移除參數**: `is_from_webapp`, `sender_device`, `web_id`, `_r`, `_t`, `_d`, `refer`, `is_copy_url`, `is_share_url`, `share_item_id`, `share_app_id`, `checksum`, `sec_uid`, `sec_user_id`
- **說明**: 移除設備和來源追蹤參數

#### TikTok 短連結 (vt.tiktok.com, vm.tiktok.com)
- **模式**: 重定向解析
- **處理方式**: 自動追蹤 301 重定向，取得完整 TikTok 視頻 URL
- **說明**: 解析分享短連結，轉換為清理後的完整 URL
- **範例**:
  ```
  短連結: https://vt.tiktok.com/ZSf4vFn9M/
  解析後: https://www.tiktok.com/@user/video/7560243732566527243
  ```

---

#### LinkedIn (linkedin.com, www.linkedin.com)
- **模式**: 保留模式
- **保留參數**: `trackingId`
- **說明**: 保留追蹤 ID（某些功能需要）

---

#### Pinterest (pinterest.com, www.pinterest.com)
- **模式**: 移除模式
- **移除參數**: `mt`, `source_app_id`
- **說明**: 移除來源應用追蹤

---

#### Reddit (reddit.com, www.reddit.com)
- **模式**: 移除模式
- **移除參數**: `share_id`, `context`
- **說明**: 移除分享追蹤參數

---

### 🎬 影音平台

#### YouTube (youtube.com, www.youtube.com)
- **模式**: 保留模式
- **保留參數**: `v`, `list`
- **說明**: 只保留影片 ID 和播放清單參數

**範例**:
```
原始: https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&si=abc123
清理: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

#### YouTube 短網址 (youtu.be)
- **模式**: 保留模式
- **保留參數**: *無*
- **說明**: 移除所有參數

**範例**:
```
原始: https://youtu.be/dQw4w9WgXcQ?si=abc123
清理: https://youtu.be/dQw4w9WgXcQ
```

---

#### Bilibili (bilibili.com, www.bilibili.com)
- **模式**: 保留模式
- **保留參數**: *無*
- **說明**: 移除所有查詢參數，保留影片 ID（已在路徑中）

**範例**:
```
原始: https://www.bilibili.com/video/BV1Rrp3zYEd6?trackid=web_related_0.router-related-2206146-trbxs.1762774468858.818
清理: https://www.bilibili.com/video/BV1Rrp3zYEd6
```

---

## 通用追蹤參數過濾

以下參數會在**所有網站**上被移除（除非使用 `keepParams` 模式的特定規則）：

### 📊 Google Analytics & UTM 參數

```
utm_source      - UTM 來源追蹤
utm_medium      - UTM 媒介追蹤
utm_campaign    - UTM 活動追蹤
utm_term        - UTM 關鍵字追蹤
utm_content     - UTM 內容追蹤
_ga             - Google Analytics
_gl             - Google 連結參數
ga_source       - GA 來源
ga_medium       - GA 媒介
ga_campaign     - GA 活動
ga_term         - GA 關鍵字
ga_content      - GA 內容
```

---

### 💰 廣告平台追蹤參數

#### Facebook Ads
```
fbclid          - Facebook Click ID
_fbc            - Facebook Cookie
_fbp            - Facebook Pixel
```

#### Google Ads
```
gclid           - Google Click ID
gclsrc          - Google Click Source
_gcl_aw         - Google Conversion Linker AdWords
```

#### 其他廣告平台
```
msclkid         - Microsoft Ads Click ID
ttclid          - TikTok Ads Click ID
ScCid           - Snapchat Click ID
li_fat_id       - LinkedIn First-party Analytics Tag ID
```

---

### 📧 Email 行銷追蹤

#### Mailchimp
```
mc_cid          - Mailchimp Campaign ID
mc_eid          - Mailchimp Email ID
```

#### 其他 Email 行銷
```
emci            - Email Campaign ID
emdi            - Email Distribution ID
ceid            - Campaign Email ID
```

---

### 🔗 社群媒體分享追蹤

```
share           - 通用分享參數
share_id        - 分享 ID
shared          - 已分享標記
socialref       - 社群參照
hootPostID      - Hootsuite 貼文 ID
__s             - 社群分享參數（簡寫）
```

---

### 🔍 其他常見追蹤參數

```
ref             - 參照來源
referer         - 參照來源（拼字變體）
referrer        - 參照來源
source          - 來源
sourceid        - 來源 ID
rsid            - Report Suite ID
spm             - Super Position Model (淘寶系)
scm             - Supply Chain Management (淘寶系)
pvid            - Page View ID
pos             - Position
abbucket        - A/B Test Bucket
algo_expid      - Algorithm Experiment ID
algo_pvid       - Algorithm Page View ID
btsid           - Button Session ID
ws_ab_test      - WebSocket A/B Test
```

---

## 技術實作說明

### 實作位置

- **檔案**: `background.js`
- **函數**: `cleanURL(urlString)`
- **設定物件**: `URL_RULES`

### 資料結構

```javascript
const URL_RULES = {
  'hostname': {
    keepParams: ['param1', 'param2'],  // 保留模式
    // 或
    removeParams: ['param1', 'param2']  // 移除模式
  }
}
```

### 處理邏輯

```javascript
function cleanURL(urlString) {
  const url = new URL(urlString);
  const hostname = url.hostname;
  const rule = URL_RULES[hostname] || URL_RULES['*'];

  if (rule.keepParams !== undefined) {
    // 保留指定參數
    const newParams = new URLSearchParams();
    rule.keepParams.forEach(param => {
      if (url.searchParams.has(param)) {
        newParams.set(param, url.searchParams.get(param));
      }
    });
    url.search = newParams.toString();
  }
  else if (rule.removeParams) {
    // 移除指定參數 + 通用規則
    rule.removeParams.forEach(param => {
      url.searchParams.delete(param);
    });
    // 同時套用通用規則
    URL_RULES['*'].removeParams.forEach(param => {
      url.searchParams.delete(param);
    });
  }

  return url.toString();
}
```

---

## 使用情境

### 剪貼簿自動清理

當使用者複製包含追蹤參數的 URL 時，插件會自動偵測並清理：

```javascript
// 監聽複製事件
document.addEventListener('copy', async (e) => {
  const selection = window.getSelection().toString();
  if (selection.startsWith('http')) {
    // 清理並替換剪貼簿內容
    const cleanedURL = cleanURL(selection);
    await navigator.clipboard.writeText(cleanedURL);
  }
});
```

### 剪貼簿輪詢監聽

每 500ms 檢查剪貼簿，自動清理網站內建的「複製連結」功能產生的 URL：

```javascript
setInterval(async () => {
  const clipboardText = await navigator.clipboard.readText();
  if (clipboardText.startsWith('http')) {
    const cleanedURL = cleanURL(clipboardText);
    if (cleanedURL !== clipboardText) {
      await navigator.clipboard.writeText(cleanedURL);
    }
  }
}, 500);
```

---

## 維護與更新

### 新增規則

1. 在 `background.js` 的 `URL_RULES` 物件中新增規則
2. 選擇適當的模式（`keepParams` 或 `removeParams`）
3. 測試確認規則正確運作
4. 更新本文件

### 測試方式

```javascript
// 在 Console 測試
const testURL = 'https://example.com/page?utm_source=test&id=123';
const cleaned = cleanURL(testURL);
console.log('原始:', testURL);
console.log('清理:', cleaned);
```

---

## 附錄：完整規則列表

### 使用 keepParams 的網站（嚴格模式）

| 網站 | 保留參數 | 用途 |
|------|---------|------|
| item.taobao.com | id | 淘寶商品 ID |
| detail.tmall.com | id | 天貓商品 ID |
| instagram.com | *無* | 移除所有參數（另有專用正規化與分享連結解析） |
| youtube.com | v, list | 影片 ID、播放清單 |
| youtu.be | *無* | 移除所有參數 |
| bilibili.com | *無* | 移除所有參數 |
| facebook.com | fbid | Facebook ID |
| linkedin.com | trackingId | 追蹤 ID |
| amazon.com | keywords, qid, sr | 搜尋參數 |
| ebay.com | hash, item | 商品識別 |

### 使用 removeParams 的網站（寬鬆模式 + 通用規則）

| 網站 | 移除參數 |
|------|---------|
| twitter.com / x.com | s, t, src |
| tiktok.com | is_from_webapp, sender_device, web_id |
| pinterest.com | mt, source_app_id |
| reddit.com | share_id, context |
| aliexpress.com | srcSns, spreadType, bizType, social_params |

---

## 許可與授權

本文件為 **Short URL Copier** Chrome 插件的技術文件，僅供參考。

---

**文件結束**
