# 快速開發指南 - Short URL Copier

## 如何快速添加新網站支援

### 步驟 1: 確定過濾方案

根據網站特點選擇一種方案：

#### A. 只移除追蹤參數（推薦用於追蹤參數明確的網站）

如果網站的 URL 中有特定的追蹤參數（如 `utm_source`, `fbclid` 等），選擇此方案。

```javascript
// background.js 中的 URL_RULES 添加：
'momo.com': {
  removeParams: ['tracking', 'source', 'utm_source']
},
'www.momo.com': {
  removeParams: ['tracking', 'source', 'utm_source']
}
```

#### B. 只保留關鍵參數（推薦用於 URL 複雜的電商網站）

如果網站需要保留特定參數才能正確加載，選擇此方案。

```javascript
// background.js 中的 URL_RULES 添加：
'pchome.com.tw': {
  keepParams: ['id', 'productid', 'sku']
},
'www.pchome.com.tw': {
  keepParams: ['id', 'productid', 'sku']
}
```

#### C. 路徑轉換（僅用於需要特殊 URL 轉換的網站）

如果網站需要將長 URL 轉換為短格式，選擇此方案（參考蝦皮實現）。

```javascript
// 1. 添加轉換函數
function transformMomoURL(url) {
  const match = url.pathname.match(/\/product-(\d+)/);
  if (match) {
    url.pathname = `/p/${match[1]}`;
    return true;
  }
  return false;
}

// 2. 在 cleanURL 函數中添加條件（行 179 後）
if (rule.pathTransform && hostname === 'momo.com') {
  transformMomoURL(url);
}

// 3. 在 URL_RULES 中添加
'momo.com': {
  pathTransform: true,
  keepParams: []
}
```

---

### 步驟 2: 測試規則

在 Chrome DevTools Console 中測試：

```javascript
// 複製以下代碼到 background.js 所在頁面的 Console
const testURL = 'https://example.com/page?utm_source=test&id=123&other=abc';
const cleaned = cleanURL(testURL);
console.log('原始:', testURL);
console.log('清理:', cleaned);
console.log('是否改變:', testURL !== cleaned);
```

---

### 步驟 3: 更新文檔

在 `URL-FILTER-RULES.md` 的對應章節添加網站說明：

```markdown
#### 網站名稱 (domain.com)
- **模式**: 保留模式/移除模式/路徑轉換
- **保留參數**: ['param1', 'param2']
  或
- **移除參數**: ['param1', 'param2']
- **說明**: 簡要說明此網站的規則

**範例**:
```
原始: https://example.com/product?id=123&utm_source=test&utm_campaign=summer
清理: https://example.com/product?id=123
```
```

---

## 核心文件速查表

### background.js
| 行數 | 功能 |
|------|------|
| 1-142 | `URL_RULES` 規則定義 |
| 144-163 | `transformShopeeURL()` 函數 |
| 166-217 | `cleanURL()` 主函數 |
| 220-226 | Chrome 訊息監聽器 |

### content.js
| 行數 | 功能 |
|------|------|
| 16-23 | `loadSettings()` 加載設定 |
| 45-60 | `showNotification()` 顯示通知 |
| 65-171 | `initClipboardMonitoring()` 剪貼簿監聽 |
| 176-419 | `initBubble()` 浮動氣泡 |

### options.js
| 行數 | 功能 |
|------|------|
| 6-9 | `DEFAULT_SETTINGS` 預設設定 |
| 21-34 | `loadSettings()` 加載設定 |
| 39-54 | `saveSettings()` 儲存設定 |
| 59-72 | `resetSettings()` 重置設定 |

---

## 常見問題與解決方案

### Q1: 如何知道網站使用了哪些追蹤參數？

使用 Chrome DevTools：
1. 開啟 DevTools (F12)
2. 進入 Network 標籤
3. 複製網站上的連結並檢查 URL
4. 查看查詢參數有哪些是不必要的

### Q2: keepParams 和 removeParams 有什麼差別？

| 特性 | keepParams | removeParams |
|------|-----------|-------------|
| 邏輯 | 只保留指定參數 | 移除指定參數 + 通用規則 |
| 適用 | URL 簡單，參數少 | URL 複雜，參數多 |
| 風險 | 低（只保留必要參數） | 中等（可能遺漏新追蹤參數） |

### Q3: 為什麼蝦皮需要 pathTransform？

蝦皮的 URL 格式特殊，不僅有查詢參數，商品 ID 也在路徑中：

```
長格式: /商品名-i.12345.67890
短格式: /product/12345/67890
```

無法用簡單的參數過濾實現，需要路徑轉換。

### Q4: 規則優先級是什麼？

```
特定網站 keepParams (最高)
   ↓
特定網站 removeParams + 通用規則
   ↓
通用規則 (最低)
```

所以如果定義了 `keepParams`，`removeParams` 和通用規則都會被忽略。

---

## 測試檢查清單

添加新網站後，請檢查：

- [ ] URL 清理後符合預期
- [ ] 不必要的參數被移除
- [ ] 必要的參數被保留
- [ ] 文檔已更新
- [ ] `URL-FILTER-RULES.md` 已更新
- [ ] 在不同瀏覽器標籤中測試
- [ ] 重新載入插件（chrome://extensions 重新加載）

---

## 快速命令

### 重新載入插件
在 chrome://extensions 中找到 Short URL Copier，點擊重新整理按鈕

### 檢查插件訊息
在任何頁面開啟 DevTools，查看 Console 標籤中的日誌

### 查看設定儲存
在 DevTools Console 執行：
```javascript
chrome.storage.local.get((data) => console.log('儲存內容:', data));
```

### 清除所有設定
在 DevTools Console 執行：
```javascript
chrome.storage.local.clear(() => console.log('已清除'));
```

---

## 版本更新步驟

1. 修改 `manifest.json` 中的 version 號
2. 測試所有功能
3. 更新 `README.md` 中的更新日誌
4. 更新 `URL-FILTER-RULES.md` 版本號
5. 打包並發布

---

**需要幫助？** 查看 `PROJECT-STRUCTURE.md` 了解詳細的架構說明。
