// Popup.js - 彈出視窗腳本
console.log('Short URL Copier popup loaded');

const image = document.querySelector('.main-image');
const bubbleToggle = document.getElementById('bubbleToggle');

// 載入浮動氣泡設定
async function loadBubbleSetting() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || { showBubble: true };
    bubbleToggle.checked = settings.showBubble !== false;
  } catch (error) {
    console.error('載入設定失敗:', error);
  }
}

// 儲存浮動氣泡設定
async function saveBubbleSetting(showBubble) {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    settings.showBubble = showBubble;
    await chrome.storage.local.set({ settings });
    console.log('✓ 設定已儲存:', settings);
  } catch (error) {
    console.error('儲存設定失敗:', error);
  }
}

// 監聽開關變化
bubbleToggle.addEventListener('change', async () => {
  await saveBubbleSetting(bubbleToggle.checked);

  // 提示用戶重新整理頁面
  if (bubbleToggle.checked) {
    console.log('✓ 浮動氣泡已啟用，請重新整理頁面');
  } else {
    console.log('❌ 浮動氣泡已停用，請重新整理頁面');
  }
});

// 點擊圖片時複製當前頁面的簡短網址
if (image) {
  image.style.cursor = 'pointer';

  image.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const currentURL = tabs[0].url;

        chrome.runtime.sendMessage(
          { action: 'cleanURL', url: currentURL },
          (response) => {
            if (response && response.cleanedURL) {
              navigator.clipboard.writeText(response.cleanedURL).then(() => {
                // 視覺反饋：圖片閃爍
                image.style.opacity = '0.5';
                setTimeout(() => {
                  image.style.opacity = '1';
                }, 200);
              });
            }
          }
        );
      }
    });
  });
}

// 初始化
loadBubbleSetting();
