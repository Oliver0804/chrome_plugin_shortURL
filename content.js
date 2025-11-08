/**
 * Content Script - 浮動氣泡按鈕
 * 在網頁上顯示一個可拖曳的浮動按鈕，點擊後複製清理後的網址
 */

console.log('🚀 Short URL Copier: Content Script 開始載入');

// 避免重複注入
if (window.shortURLCopierInjected) {
  console.log('⚠️ Short URL Copier: 已注入，跳過');
} else {
  window.shortURLCopierInjected = true;
  console.log('✓ Short URL Copier: 設定注入標記');

  // 等待 DOM 完全載入
  async function initBubble() {
    console.log('📝 Short URL Copier: 開始初始化浮動氣泡');

    if (!document.body) {
      console.log('⏳ Short URL Copier: body 尚未載入，等待中...');
      setTimeout(initBubble, 100);
      return;
    }

    // 讀取設定
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {
      showBubble: true,
      autoCleanClipboard: true,
      showNotifications: true
    };

    console.log('⚙️ 目前設定:', settings);

    // 如果設定為不顯示浮動氣泡，則直接返回
    if (!settings.showBubble) {
      console.log('❌ 浮動氣泡已在設定中關閉');
      return;
    }

    // 建立浮動氣泡
    const bubble = document.createElement('div');
    bubble.id = 'short-url-copier-bubble';

    // 設定 logo.png 作為背景圖片
    const logoUrl = chrome.runtime.getURL('logo.png');
    console.log('📸 Logo URL:', logoUrl);
    bubble.style.backgroundImage = `url('${logoUrl}')`;
    bubble.style.backgroundSize = 'cover';
    bubble.style.backgroundPosition = 'center';
    bubble.style.backgroundRepeat = 'no-repeat';
    console.log('✓ 背景圖片已設定:', bubble.style.backgroundImage);

    bubble.innerHTML = `
      <div class="bubble-tooltip">點擊複製簡短網址</div>
    `;

    // 通知訊息容器
    const notification = document.createElement('div');
    notification.id = 'short-url-copier-notification';

    // 添加到頁面
    try {
      document.body.appendChild(bubble);
      document.body.appendChild(notification);
      console.log('✓ Short URL Copier: 浮動氣泡已添加到 DOM');
    } catch (error) {
      console.error('✗ Short URL Copier: 添加失敗', error);
      return;
    }

    // 氣泡狀態
    let isDragging = false;
    let hasMoved = false;
    let startX, startY;
    const bubbleSize = 120; // 氣泡大小
    let currentX = window.innerWidth - bubbleSize - 20;
    let currentY = window.innerHeight / 2;

    // 取得當前域名（用於記憶位置）
    const currentDomain = window.location.hostname;

    // 從儲存中載入位置
    async function loadPosition() {
      try {
        const result = await chrome.storage.local.get('bubblePositions');
        const positions = result.bubblePositions || {};

        if (positions[currentDomain]) {
          currentX = positions[currentDomain].x;
          currentY = positions[currentDomain].y;
          console.log('✓ 已載入記憶位置:', positions[currentDomain]);
        } else {
          console.log('📍 使用預設位置');
        }

        // 確保位置在視窗範圍內
        currentX = Math.max(0, Math.min(window.innerWidth - bubbleSize, currentX));
        currentY = Math.max(0, Math.min(window.innerHeight - bubbleSize, currentY));

        bubble.style.left = currentX + 'px';
        bubble.style.top = currentY + 'px';
        console.log('✓ Short URL Copier: 設定位置', { currentX, currentY });
      } catch (error) {
        console.error('載入位置失敗:', error);
      }
    }

    // 儲存位置
    async function savePosition() {
      try {
        const result = await chrome.storage.local.get('bubblePositions');
        const positions = result.bubblePositions || {};

        positions[currentDomain] = {
          x: currentX,
          y: currentY,
          timestamp: Date.now()
        };

        await chrome.storage.local.set({ bubblePositions: positions });
        console.log('✓ 位置已儲存:', positions[currentDomain]);
      } catch (error) {
        console.error('儲存位置失敗:', error);
      }
    }

    // 載入位置
    loadPosition();

    /**
     * 顯示通知訊息
     */
    function showNotification(message, type = 'success') {
      if (!settings.showNotifications) {
        console.log('🔕 通知已關閉:', message);
        return;
      }

      notification.textContent = message;
      notification.className = `show ${type}`;
      console.log('📢 通知:', message, type);

      setTimeout(() => {
        notification.classList.remove('show');
      }, 2500);
    }

    /**
     * 複製文字到剪貼簿
     */
    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        showNotification('✓ 已複製簡短網址！', 'success');

        // 視覺反饋
        bubble.classList.add('copied');
        setTimeout(() => {
          bubble.classList.remove('copied');
        }, 300);

        console.log('✓ 複製成功:', text);
      } catch (error) {
        console.error('✗ 複製失敗:', error);
        showNotification('✗ 複製失敗，請重試', 'error');
      }
    }

    /**
     * 處理點擊事件
     */
    bubble.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasMoved = false;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      bubble.classList.add('dragging');
      console.log('🖱️ 開始拖曳');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = Math.abs(e.clientX - (currentX + startX));
      const deltaY = Math.abs(e.clientY - (currentY + startY));

      if (deltaX > 5 || deltaY > 5) {
        hasMoved = true;
      }

      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // 限制在視窗範圍內
      currentX = Math.max(0, Math.min(window.innerWidth - bubbleSize, currentX));
      currentY = Math.max(0, Math.min(window.innerHeight - bubbleSize, currentY));

      bubble.style.left = currentX + 'px';
      bubble.style.top = currentY + 'px';
    });

    document.addEventListener('mouseup', async () => {
      if (isDragging) {
        bubble.classList.remove('dragging');

        // 如果沒有移動，則視為點擊
        if (!hasMoved) {
          console.log('🖱️ 點擊氣泡');
          const currentURL = window.location.href;

          // 向背景腳本請求清理 URL
          try {
            chrome.runtime.sendMessage(
              { action: 'cleanURL', url: currentURL },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error('通訊錯誤:', chrome.runtime.lastError);
                  showNotification('✗ 通訊失敗', 'error');
                  return;
                }
                if (response && response.cleanedURL) {
                  console.log('收到清理後的 URL:', response.cleanedURL);
                  copyToClipboard(response.cleanedURL);
                }
              }
            );
          } catch (error) {
            console.error('發送訊息失敗:', error);
          }
        } else {
          console.log('🖱️ 拖曳結束，儲存位置');
          // 拖曳後儲存位置
          savePosition();
        }

        isDragging = false;
      }
    });

    // 雙擊顯示原始網址
    bubble.addEventListener('dblclick', () => {
      console.log('🖱️ 雙擊氣泡');
      const currentURL = window.location.href;
      copyToClipboard(currentURL);
      showNotification('✓ 已複製原始網址', 'info');
    });

    // 滑鼠懸停顯示提示
    bubble.addEventListener('mouseenter', () => {
      if (!isDragging) {
        bubble.classList.add('hover');
      }
    });

    bubble.addEventListener('mouseleave', () => {
      bubble.classList.remove('hover');
    });

    // 視窗大小改變時調整位置
    window.addEventListener('resize', () => {
      currentX = Math.max(0, Math.min(window.innerWidth - bubbleSize, currentX));
      currentY = Math.max(0, Math.min(window.innerHeight - bubbleSize, currentY));
      bubble.style.left = currentX + 'px';
      bubble.style.top = currentY + 'px';
    });

    // 鍵盤快捷鍵：Alt + C 複製簡短網址
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        console.log('⌨️ 快捷鍵觸發: Alt+C');
        const currentURL = window.location.href;

        chrome.runtime.sendMessage(
          { action: 'cleanURL', url: currentURL },
          (response) => {
            if (response && response.cleanedURL) {
              copyToClipboard(response.cleanedURL);
            }
          }
        );
      }
    });

    // 監聽複製事件，自動清理剪貼簿中的 URL
    let isProcessingClipboard = false; // 防止無限循環

    document.addEventListener('copy', async (e) => {
      if (isProcessingClipboard) return;

      try {
        // 取得剪貼簿內容
        const selection = window.getSelection().toString();

        // 如果選取的內容看起來像 URL，則清理它
        if (selection && (selection.startsWith('http://') || selection.startsWith('https://'))) {
          console.log('📋 偵測到複製 URL:', selection);

          // 清理 URL
          chrome.runtime.sendMessage(
            { action: 'cleanURL', url: selection },
            async (response) => {
              if (response && response.cleanedURL && response.cleanedURL !== selection) {
                console.log('🧹 清理後的 URL:', response.cleanedURL);

                // 阻止原本的複製
                e.preventDefault();

                // 複製清理後的 URL
                isProcessingClipboard = true;
                try {
                  await navigator.clipboard.writeText(response.cleanedURL);
                  showNotification('✓ 已自動清理並複製網址！', 'success');
                  console.log('✓ 已將清理後的 URL 放入剪貼簿');
                } catch (error) {
                  console.error('寫入剪貼簿失敗:', error);
                } finally {
                  isProcessingClipboard = false;
                }
              }
            }
          );
        }
      } catch (error) {
        console.error('處理複製事件失敗:', error);
      }
    });

    // 監聽剪貼簿變化（使用 Clipboard API 的替代方案）
    // 當用戶使用網站自帶的「複製連結」按鈕時觸發
    let lastClipboardCheck = '';
    let clipboardCheckInterval = null;

    // 只在特定社群媒體網站啟用主動監聽
    const socialMediaDomains = [
      'instagram.com', 'facebook.com', 'twitter.com', 'x.com',
      'tiktok.com', 'linkedin.com', 'pinterest.com', 'reddit.com'
    ];

    const currentHost = window.location.hostname;
    const isSocialMedia = socialMediaDomains.some(domain => currentHost.includes(domain));

    if (isSocialMedia && settings.autoCleanClipboard) {
      console.log('🔍 在社群媒體網站啟用剪貼簿監聽');

      // 每 500ms 檢查一次剪貼簿
      clipboardCheckInterval = setInterval(async () => {
        if (isProcessingClipboard) return;

        try {
          const clipboardText = await navigator.clipboard.readText();

          // 如果剪貼簿內容改變且是 URL
          if (clipboardText !== lastClipboardCheck &&
              (clipboardText.startsWith('http://') || clipboardText.startsWith('https://'))) {

            lastClipboardCheck = clipboardText;
            console.log('📋 偵測到剪貼簿變化:', clipboardText);

            // 清理 URL
            chrome.runtime.sendMessage(
              { action: 'cleanURL', url: clipboardText },
              async (response) => {
                if (response && response.cleanedURL && response.cleanedURL !== clipboardText) {
                  console.log('🧹 自動清理剪貼簿 URL:', response.cleanedURL);

                  isProcessingClipboard = true;
                  try {
                    await navigator.clipboard.writeText(response.cleanedURL);
                    lastClipboardCheck = response.cleanedURL;
                    showNotification('✓ 已自動清理剪貼簿網址！', 'success');
                  } catch (error) {
                    console.error('更新剪貼簿失敗:', error);
                  } finally {
                    isProcessingClipboard = false;
                  }
                }
              }
            );
          }
        } catch (error) {
          // 讀取剪貼簿失敗（可能沒有權限），忽略錯誤
        }
      }, 500);
    }

    console.log('✓ Short URL Copier: 浮動氣泡已完全載入');
  }

  // 開始初始化
  if (document.readyState === 'loading') {
    console.log('⏳ Short URL Copier: 等待 DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initBubble);
  } else {
    console.log('✓ Short URL Copier: DOM 已就緒，立即初始化');
    initBubble();
  }
}
