// Popup.js - 彈出視窗腳本
console.log('Short URL Copier popup loaded');

const image = document.querySelector('.main-image');
const bubbleToggle = document.getElementById('bubbleToggle');
const unlockToggle = document.getElementById('unlockToggle');

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

// 監聽浮動氣泡開關變化
bubbleToggle.addEventListener('change', async () => {
  await saveSetting('showBubble', bubbleToggle.checked);

  // 提示用戶重新整理頁面
  if (bubbleToggle.checked) {
    console.log('✓ 浮動氣泡已啟用，請重新整理頁面');
  } else {
    console.log('❌ 浮動氣泡已停用，請重新整理頁面');
  }
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
