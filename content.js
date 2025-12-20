/**
 * Content Script - 浮動氣泡按鈕 & 剪貼簿監聽
 * 功能一：在網頁上顯示一個可拖曳的浮動按鈕，點擊後複製清理後的網址
 * 功能二：監聽剪貼簿變化，自動清理追蹤參數
 */

console.log('🚀 Short URL Copier: Content Script 開始載入');

// 避免重複注入
if (window.shortURLCopierInjected) {
  console.log('⚠️ Short URL Copier: 已注入，跳過');
} else {
  window.shortURLCopierInjected = true;
  console.log('✓ Short URL Copier: 設定注入標記');

  // 讀取設定
  async function loadSettings() {
    const result = await chrome.storage.local.get('settings');
    return result.settings || {
      showBubble: true,
      showNotifications: true,
      unlockRightClick: true
    };
  }

  // 建立通知容器（全域，兩個功能都會用到）
  let notificationElement = null;

  /**
   * 取得或建立通知元素
   */
  function getNotificationElement() {
    if (!notificationElement) {
      notificationElement = document.createElement('div');
      notificationElement.id = 'short-url-copier-notification';
      if (document.body) {
        document.body.appendChild(notificationElement);
      }
    }
    return notificationElement;
  }

  /**
   * 顯示通知訊息（全域函數）
   */
  async function showNotification(message, type = 'success') {
    const settings = await loadSettings();
    if (!settings.showNotifications) {
      console.log('🔕 通知已關閉:', message);
      return;
    }

    const notification = getNotificationElement();
    notification.textContent = message;
    notification.className = `show ${type}`;
    console.log('📢 通知:', message, type);

    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }

  /**
   * 初始化剪貼簿監聽功能（始終運作，不受設定影響）
   */
  async function initClipboardMonitoring() {
    console.log('📋 Short URL Copier: 開始初始化剪貼簿監聽');

    if (!document.body) {
      console.log('⏳ Short URL Copier: body 尚未載入，等待中...');
      setTimeout(initClipboardMonitoring, 100);
      return;
    }

    // 剪貼簿監聽始終啟用，不檢查 autoCleanClipboard 設定
    console.log('✓ 剪貼簿監聽已啟用（始終運作）');

    // 監聽複製事件，自動清理剪貼簿中的 URL
    let isProcessingClipboard = false; // 防止無限循環
    let lastClipboardCheck = '';
    let pendingClipboardCheck = false; // 標記是否有待處理的剪貼簿檢查

    /**
     * 清理剪貼簿中的 URL
     * @param {string} clipboardText - 剪貼簿內容
     * @param {string} source - 來源（用於 log）
     */
    async function cleanClipboardURL(clipboardText, source = 'unknown') {
      if (isProcessingClipboard) return;
      if (clipboardText === lastClipboardCheck) return;

      // 提取 URL（支援「標題 + URL」格式）
      const urlMatch = clipboardText.match(/(https?:\/\/[^\s]+)/);
      if (!urlMatch) return;

      const originalURL = urlMatch[1];
      lastClipboardCheck = clipboardText;
      console.log(`📋 [${source}] 偵測到剪貼簿內容:`, clipboardText);
      console.log('🔗 提取到 URL:', originalURL);

      // 清理 URL
      chrome.runtime.sendMessage(
        { action: 'cleanURL', url: originalURL },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error('通訊錯誤:', chrome.runtime.lastError);
            return;
          }
          if (response && response.cleanedURL && response.cleanedURL !== originalURL) {
            console.log('🧹 清理後的 URL:', response.cleanedURL);

            isProcessingClipboard = true;
            try {
              // 替換原文中的 URL 為清理後的版本
              const cleanedText = clipboardText.replace(originalURL, response.cleanedURL);
              await navigator.clipboard.writeText(cleanedText);
              lastClipboardCheck = cleanedText;
              showNotification('✓ 已自動清理剪貼簿網址！', 'success');
              console.log('✓ 已將清理後的內容放入剪貼簿:', cleanedText);
            } catch (error) {
              console.error('寫入剪貼簿失敗:', error);
            } finally {
              isProcessingClipboard = false;
            }
          }
        }
      );
    }

    /**
     * 嘗試讀取並清理剪貼簿
     */
    async function tryReadAndCleanClipboard(source = 'poll') {
      if (isProcessingClipboard) return;

      try {
        const clipboardText = await navigator.clipboard.readText();
        // 只在非輪詢或有變化時才 log（避免 console 刷屏）
        if (source !== 'poll' || (clipboardText && clipboardText !== lastClipboardCheck)) {
          console.log(`📋 [${source}] 讀取剪貼簿:`, clipboardText ? clipboardText.substring(0, 50) + '...' : '(空)');
        }
        if (clipboardText && clipboardText !== lastClipboardCheck) {
          await cleanClipboardURL(clipboardText, source);
        }
      } catch (error) {
        // 只在非輪詢時 log 錯誤（避免 console 刷屏）
        if (source !== 'poll') {
          console.log(`⚠️ [${source}] 讀取剪貼簿失敗:`, error.message);
        }
      }
    }

    // ========== 方法 1: 監聽 copy 事件 ==========
    document.addEventListener('copy', async (e) => {
      if (isProcessingClipboard) return;

      try {
        // 取得選取的內容
        const selection = window.getSelection().toString();

        if (!selection) return;

        // 檢查選取內容中是否包含 URL
        const urlMatch = selection.match(/(https?:\/\/[^\s]+)/);

        if (urlMatch) {
          const originalURL = urlMatch[1];
          console.log('📋 [copy事件] 偵測到複製內容:', selection);
          console.log('🔗 提取到 URL:', originalURL);

          // 清理 URL
          chrome.runtime.sendMessage(
            { action: 'cleanURL', url: originalURL },
            async (response) => {
              if (response && response.cleanedURL && response.cleanedURL !== originalURL) {
                console.log('🧹 清理後的 URL:', response.cleanedURL);

                // 阻止原本的複製
                e.preventDefault();

                // 替換原文中的 URL 為清理後的版本
                const cleanedText = selection.replace(originalURL, response.cleanedURL);

                isProcessingClipboard = true;
                try {
                  await navigator.clipboard.writeText(cleanedText);
                  lastClipboardCheck = cleanedText;
                  showNotification('✓ 已自動清理並複製網址！', 'success');
                  console.log('✓ 已將清理後的內容放入剪貼簿:', cleanedText);
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

    // ========== 方法 2: 監聽 Facebook 複製連結按鈕 ==========
    if (window.location.hostname.includes('facebook.com')) {
      console.log('🔵 Facebook 頁面：啟用複製按鈕監聽');

      // 使用 MutationObserver 監聽 DOM 變化，捕捉動態載入的按鈕
      const observer = new MutationObserver((mutations) => {
        // 當 DOM 變化時，檢查是否有點擊複製相關的動作
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 監聽所有點擊事件，檢測複製按鈕
      document.addEventListener('click', async (e) => {
        const target = e.target;
        const text = target.textContent || '';
        const ariaLabel = target.getAttribute('aria-label') || '';
        const parentText = target.closest('[role="menuitem"], [role="button"]')?.textContent || '';

        // 檢測可能的複製按鈕（多語言支援）
        const copyKeywords = [
          '複製連結', '复制链接', 'Copy link', 'Copy Link',
          '複製網址', '复制网址', 'Copy URL',
          '複製', '复制', 'Copy'
        ];

        const isCopyButton = copyKeywords.some(keyword =>
          text.includes(keyword) || ariaLabel.includes(keyword) || parentText.includes(keyword)
        );

        if (isCopyButton) {
          console.log('🔵 [Facebook] 偵測到複製按鈕點擊');
          pendingClipboardCheck = true;

          // 延遲檢查剪貼簿（等待 Facebook 完成複製操作）
          setTimeout(() => tryReadAndCleanClipboard('FB按鈕-100ms'), 100);
          setTimeout(() => tryReadAndCleanClipboard('FB按鈕-300ms'), 300);
          setTimeout(() => tryReadAndCleanClipboard('FB按鈕-500ms'), 500);
          setTimeout(() => tryReadAndCleanClipboard('FB按鈕-1000ms'), 1000);
        }
      }, true); // 使用 capture 模式確保先捕捉到事件
    }

    // ========== 方法 3: 監聽頁面焦點變化 ==========
    // 當頁面獲得焦點時，立即檢查剪貼簿
    window.addEventListener('focus', async () => {
      console.log('👁️ 頁面獲得焦點，檢查剪貼簿...');
      // 延遲一點確保剪貼簿已更新
      setTimeout(() => tryReadAndCleanClipboard('focus-50ms'), 50);
      setTimeout(() => tryReadAndCleanClipboard('focus-200ms'), 200);
    });

    // 當文件可見性改變時檢查
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ 頁面變為可見，檢查剪貼簿...');
        setTimeout(() => tryReadAndCleanClipboard('visible-50ms'), 50);
        setTimeout(() => tryReadAndCleanClipboard('visible-200ms'), 200);
      }
    });

    // ========== 方法 4: 持續輪詢剪貼簿 ==========
    console.log('🔍 啟用剪貼簿輪詢監聽');

    // 每 300ms 檢查一次剪貼簿（加快頻率）
    let pollCount = 0;
    setInterval(async () => {
      pollCount++;
      // 每 10 秒 log 一次狀態，確認輪詢正常運作
      if (pollCount % 33 === 0) {
        console.log(`🔄 剪貼簿輪詢中... (已執行 ${pollCount} 次, lastCheck: ${lastClipboardCheck.substring(0, 30)}...)`);
      }

      // 直接在這裡檢查，不透過 tryReadAndCleanClipboard 以便更詳細 debug
      if (isProcessingClipboard) return;

      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText !== lastClipboardCheck) {
          console.log('📋 [poll] 偵測到新內容:', clipboardText.substring(0, 80));
          await cleanClipboardURL(clipboardText, 'poll');
        }
      } catch (error) {
        // 沒有焦點時會失敗，這是正常的
      }
    }, 300);

    console.log('✓ Short URL Copier: 剪貼簿監聽已完全載入');
  }

  /**
   * 初始化浮動氣泡（獨立功能）
   */
  async function initBubble() {
    console.log('📝 Short URL Copier: 開始初始化浮動氣泡');

    if (!document.body) {
      console.log('⏳ Short URL Copier: body 尚未載入，等待中...');
      setTimeout(initBubble, 100);
      return;
    }

    const settings = await loadSettings();
    console.log('⚙️ 浮動氣泡設定:', settings);

    // 如果設定為不顯示浮動氣泡，則跳過氣泡建立
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

    // 添加到頁面
    try {
      document.body.appendChild(bubble);
      // 確保通知元素也存在
      getNotificationElement();
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

    console.log('✓ Short URL Copier: 浮動氣泡已完全載入');
  }

  /**
   * 初始化解鎖右鍵與選取功能
   */
  async function initUnlockFeature() {
    console.log('🔓 Short URL Copier: 開始初始化解鎖功能');

    if (!document.body) {
      console.log('⏳ Short URL Copier: body 尚未載入，等待中...');
      setTimeout(initUnlockFeature, 100);
      return;
    }

    // 解鎖狀態管理
    let isUnlocked = false;
    let unlockStyleElement = null;
    const eventHandlers = {};
    let mutationObserver = null;

    // 解鎖用的 CSS 規則
    const UNLOCK_CSS = `
      * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
      *::selection {
        background: #b3d4fc !important;
      }
      *::-moz-selection {
        background: #b3d4fc !important;
      }
    `;

    /**
     * 通用事件攔截器 - 在 capture 階段阻止事件傳播
     */
    function createEventBlocker(eventName) {
      return function(e) {
        e.stopPropagation();
        // 不呼叫 preventDefault()，讓瀏覽器預設行為執行
        console.log(`🔓 已攔截 ${eventName} 事件`);
      };
    }

    /**
     * 移除元素上的 inline 事件處理器
     */
    function removeInlineHandlers(element) {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

      const handlersToRemove = [
        'oncontextmenu', 'onselectstart', 'ondragstart',
        'onmousedown', 'oncopy', 'oncut'
      ];

      handlersToRemove.forEach(handler => {
        if (element[handler]) {
          element[handler] = null;
        }
        if (element.hasAttribute && element.hasAttribute(handler)) {
          element.removeAttribute(handler);
        }
      });
    }

    /**
     * 掃描並移除所有元素的 inline 事件處理器
     */
    function scanAndRemoveInlineHandlers() {
      // 處理 document 和 body
      removeInlineHandlers(document.documentElement);
      removeInlineHandlers(document.body);

      // 處理所有有 inline handler 的元素
      const selectors = [
        '[oncontextmenu]', '[onselectstart]', '[ondragstart]',
        '[onmousedown]', '[oncopy]', '[oncut]'
      ];
      const elements = document.querySelectorAll(selectors.join(', '));
      elements.forEach(removeInlineHandlers);

      if (elements.length > 0) {
        console.log(`🔓 已移除 ${elements.length} 個元素的 inline 事件處理器`);
      }
    }

    /**
     * 啟用解鎖功能
     */
    function enableUnlock() {
      if (isUnlocked) return;
      console.log('🔓 啟用解鎖功能');

      // 1. 注入 CSS
      unlockStyleElement = document.createElement('style');
      unlockStyleElement.id = 'short-url-copier-unlock-style';
      unlockStyleElement.textContent = UNLOCK_CSS;
      document.head.appendChild(unlockStyleElement);

      // 2. 添加事件攔截器（capture 階段）
      // 注意：不攔截 copy/cut，保持剪貼簿監聽功能正常
      const eventsToBlock = ['contextmenu', 'selectstart', 'dragstart'];

      eventsToBlock.forEach(eventName => {
        eventHandlers[eventName] = createEventBlocker(eventName);
        document.addEventListener(eventName, eventHandlers[eventName], true);
      });

      // 3. 移除 inline 事件處理器
      scanAndRemoveInlineHandlers();

      // 4. 使用 MutationObserver 監視動態添加的元素
      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              removeInlineHandlers(node);
              // 也處理子元素
              if (node.querySelectorAll) {
                const children = node.querySelectorAll('[oncontextmenu], [onselectstart], [ondragstart]');
                children.forEach(removeInlineHandlers);
              }
            }
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      isUnlocked = true;
      showNotification('🔓 已解鎖右鍵與選取限制', 'success');
    }

    /**
     * 停用解鎖功能
     */
    function disableUnlock() {
      if (!isUnlocked) return;
      console.log('🔒 停用解鎖功能');

      // 1. 移除 CSS
      if (unlockStyleElement && unlockStyleElement.parentNode) {
        unlockStyleElement.parentNode.removeChild(unlockStyleElement);
        unlockStyleElement = null;
      }

      // 2. 移除事件攔截器
      const eventsToBlock = ['contextmenu', 'selectstart', 'dragstart'];
      eventsToBlock.forEach(eventName => {
        if (eventHandlers[eventName]) {
          document.removeEventListener(eventName, eventHandlers[eventName], true);
          delete eventHandlers[eventName];
        }
      });

      // 3. 停止 MutationObserver
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }

      isUnlocked = false;
      showNotification('🔒 已還原右鍵與選取限制', 'info');
    }

    // 載入設定並初始化
    const settings = await loadSettings();
    if (settings.unlockRightClick) {
      enableUnlock();
    }

    // 監聽設定變化，實現即時切換
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.settings) {
        const newSettings = changes.settings.newValue || {};
        const oldSettings = changes.settings.oldValue || {};

        if (newSettings.unlockRightClick !== oldSettings.unlockRightClick) {
          if (newSettings.unlockRightClick) {
            enableUnlock();
          } else {
            disableUnlock();
          }
        }
      }
    });

    console.log('✓ Short URL Copier: 解鎖功能已初始化');
  }

  // 開始初始化 - 三個功能獨立啟動
  if (document.readyState === 'loading') {
    console.log('⏳ Short URL Copier: 等待 DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      initBubble();              // 氣泡功能
      initClipboardMonitoring(); // 剪貼簿監聽功能
      initUnlockFeature();       // 解鎖右鍵與選取功能
    });
  } else {
    console.log('✓ Short URL Copier: DOM 已就緒，立即初始化');
    initBubble();              // 氣泡功能
    initClipboardMonitoring(); // 剪貼簿監聽功能
    initUnlockFeature();       // 解鎖右鍵與選取功能
  }
}
