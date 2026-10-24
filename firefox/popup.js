// Popup.js - 彈出視窗腳本
console.log('Short URL Copier popup loaded');

const image = document.querySelector('.main-image');
const bubbleToggle = document.getElementById('bubbleToggle');
const unlockToggle = document.getElementById('unlockToggle');
const openOptionsButton = document.getElementById('openOptions');

// 開啟進階設定頁
if (openOptionsButton) {
  openOptionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage(() => {
      if (chrome.runtime.lastError) {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      }
    });
  });
}

// 載入設定
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {
      showBubble: true,
      unlockRightClick: true
    };
    bubbleToggle.checked = settings.showBubble !== false;
    unlockToggle.checked = settings.unlockRightClick === true;
  } catch (error) {
    console.error('載入設定失敗:', error);
  }
}

// 儲存設定
async function saveSetting(key, value) {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    settings[key] = value;
    await chrome.storage.local.set({ settings });
    console.log('✓ 設定已儲存:', key, value);
  } catch (error) {
    console.error('儲存設定失敗:', error);
  }
}

// 監聽浮動氣泡開關變化（即時生效，無需重整頁面）
bubbleToggle.addEventListener('change', async () => {
  const show = bubbleToggle.checked;
  await saveSetting('showBubble', show);

  // 通知當前分頁的 content script 立即顯示/隱藏氣泡
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id != null) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBubble', show }, () => {
        // content script 未注入時忽略錯誤
        void chrome.runtime.lastError;
      });
    }
  });

  console.log(show ? '✓ 浮動氣泡已啟用' : '❌ 浮動氣泡已停用');
});

// 監聯解鎖開關變化（即時生效，無需重整頁面）
unlockToggle.addEventListener('change', async () => {
  await saveSetting('unlockRightClick', unlockToggle.checked);
  console.log(unlockToggle.checked ? '🔓 解鎖功能已啟用' : '🔒 解鎖功能已停用');
});

// 點擊圖片時複製當前頁面的簡短網址
if (image) {
  image.style.cursor = 'pointer';

  image.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const currentURL = tabs[0].url;

        // 顯示處理中狀態
        image.style.opacity = '0.5';
        image.style.cursor = 'wait';

        chrome.runtime.sendMessage(
          { action: 'cleanURL', url: currentURL },
          (response) => {
            // 恢復正常狀態
            image.style.cursor = 'pointer';

            if (response && response.cleanedURL) {
              navigator.clipboard.writeText(response.cleanedURL).then(() => {
                // 視覺反饋：成功閃爍
                image.style.opacity = '1';
                image.style.filter = 'brightness(1.2)';
                setTimeout(() => {
                  image.style.filter = 'none';
                }, 200);
              });
            } else {
              // 失敗時恢復
              image.style.opacity = '1';
            }
          }
        );
      }
    });
  });
}

// 初始化
loadSettings();
