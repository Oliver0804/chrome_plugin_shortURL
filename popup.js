// 簡化版 popup.js
// 彈出視窗只顯示圖片，所有功能都在浮動氣泡上

console.log('Short URL Copier popup loaded');

// 點擊圖片時複製當前頁面的簡短網址（可選功能）
const image = document.querySelector('.main-image');

if (image) {
  image.style.cursor = 'pointer';

  image.addEventListener('click', () => {
    // 取得當前標籤頁的 URL 並複製簡短版本
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
