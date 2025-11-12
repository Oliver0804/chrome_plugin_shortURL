# 🔗 Short URL Copier

一個強大的 Chrome 擴充功能，自動清理網址中的追蹤參數，讓分享連結更簡潔！

[![Version](https://img.shields.io/badge/version-1.3.7-blue.svg)](https://github.com/Oliver0804/chrome_plugin_shortURL)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ 主要功能

### 🎯 智能剪貼簿監聽 (v1.2.0+)
- 自動偵測並清理複製的網址
- 支援社群媒體「複製連結」按鈕
- 即時處理，無需手動操作

### 🫧 浮動氣泡
- 可拖曳的浮動按鈕
- 位置記憶功能（依網域儲存）
- 單擊複製清理後的網址
- 雙擊複製原始網址
- 鍵盤快捷鍵：`Alt + C`

### ⚙️ 完整設定選項 (v1.3.0+)
- 開關浮動氣泡顯示
- 開關剪貼簿自動清理
- 開關通知訊息
- 右鍵插件圖示 → 選項

## 🌐 支援的網站

### 🛒 電商平台
- **淘寶**：只保留商品 ID
- **天貓**：只保留商品 ID
- **蝦皮購物**：自動轉換為短網址格式，移除追蹤參數
- **Amazon**：保留關鍵字和搜尋參數
- **eBay**：保留必要參數
- **AliExpress**：移除分享追蹤參數

### 📱 社群媒體
- **Instagram**：移除所有查詢參數
- **Facebook**：只保留 fbid
- **Twitter / X**：移除追蹤參數
- **TikTok**：移除裝置和來源資訊
- **Threads** (.com/.net)：移除所有追蹤參數
- **LinkedIn**：保留追蹤 ID
- **Pinterest**：移除追蹤參數
- **Reddit**：移除分享 ID

### 🎬 影音平台
- **YouTube**：只保留影片 ID 和播放清單
- **Bilibili**：移除所有追蹤參數

### 🌍 通用追蹤參數
自動移除 40+ 追蹤參數：
- **UTM 參數**：utm_source, utm_medium, utm_campaign 等
- **Google Analytics**：_ga, _gl, gclid 等
- **Facebook**：fbclid, _fbc, _fbp
- **Microsoft Ads**：msclkid
- **TikTok Ads**：ttclid
- **Email 行銷**：mc_cid, mc_eid 等

## 📦 安裝方式

### 從 Release 下載
1. 前往 [Releases](https://github.com/Oliver0804/chrome_plugin_shortURL/releases) 下載最新版本 `short-url-copier-v1.3.7.zip`
2. 解壓縮 ZIP 檔案
3. 開啟 Chrome 瀏覽器，進入 `chrome://extensions/`
4. 開啟右上角「開發人員模式」
5. 點擊「載入未封裝項目」
6. 選擇解壓縮後的資料夾

### 從原始碼安裝
```bash
git clone git@github.com:Oliver0804/chrome_plugin_shortURL.git
cd chrome_plugin_shortURL
```

然後按照上述步驟載入到 Chrome。

## 🚀 使用方式

### 方式一：浮動氣泡
1. 每個網頁右下角會出現粉紅色角色圖案
2. **單擊**：複製清理後的網址
3. **雙擊**：複製原始網址
4. **拖曳**：調整位置（會自動記憶）

### 方式二：鍵盤快捷鍵
- 按下 `Alt + C` 複製清理後的網址

### 方式三：自動清理（社群媒體）
- 在 Instagram、Facebook、TikTok 等網站
- 使用網站的「複製連結」按鈕
- 自動清理後放入剪貼簿

### 設定
右鍵點擊插件圖示 → 選擇「選項」開啟設定頁面

## 🔒 隱私權

本插件：
- ✅ 僅在本地處理網址清理
- ✅ 不會上傳任何資料到伺服器
- ✅ 不會收集個人資訊
- ✅ 開源透明

需要的權限：
- `activeTab`：取得當前頁面網址
- `clipboardWrite`：寫入剪貼簿
- `clipboardRead`：讀取剪貼簿（僅用於自動清理功能）
- `storage`：儲存設定和氣泡位置

## 🛠️ 開發

### 技術棧
- Manifest V3
- Vanilla JavaScript
- Chrome Extension APIs

### 檔案結構
```
shortURL/
├── manifest.json          # 擴充功能配置
├── background.js          # URL 清理邏輯
├── content.js             # 內容腳本（浮動氣泡）
├── content.css            # 浮動氣泡樣式
├── popup.html/css/js      # 彈出視窗
├── options.html/css/js    # 設定頁面
├── icons/                 # 圖示檔案
├── logo.png               # Logo
└── 安裝說明.md            # 安裝說明
```

## 📝 更新日誌

### v1.3.7 (2025-01-12)
- 💬 新增 Threads (threads.com / threads.net) URL 支援
- 🧹 自動移除 Threads 連結的追蹤參數（xmt, slof 等）
- 🌐 同時支援 .com 和 .net 兩個域名

### v1.3.6 (2025-01-10)
- 🎬 新增 Bilibili (bilibili.com) URL 支援
- 🧹 自動移除 B 站影片連結的追蹤參數
- ✨ 支援「標題 + URL」格式的剪貼簿清理（B站複製連結格式）
- 🔧 新增 `host_permissions` 以確保 Content Script 正常注入
- 🛠️ 改進剪貼簿監聽邏輯，使用正則表達式智能提取 URL

### v1.3.4 (2025-01-10)
- 🛒 新增蝦皮購物 (shopee.tw) URL 支援
- 🔄 自動轉換長網址為短網址格式
- 🧹 移除蝦皮網址追蹤參數

### v1.3.3 (2025-01-09)
- 🛒 新增天貓 (tmall.com) URL 支援
- 📄 新增 URL 過濾規則文件

### v1.3.0 (2025-01-09)
- ⚙️ 新增設定頁面
- 🎛️ 可開關浮動氣泡、剪貼簿監聽、通知訊息

### v1.2.0 (2025-01-09)
- 🎯 智能剪貼簿監聽功能
- 📋 自動清理社群媒體複製的網址

### v1.1.0 (2025-01-09)
- ✨ 新增多個網站支援
- 📌 浮動氣泡位置記憶功能
- 🧹 擴充追蹤參數清理列表

### v1.0.0 (2024-10-24)
- 🎉 初始版本發布

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 👨‍💻 作者

**BASHCAT**
- GitHub: [@Oliver0804](https://github.com/Oliver0804)

---

**享受更簡潔的網址分享！** 🎉
