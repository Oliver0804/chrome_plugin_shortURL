/**
 * Options Page - 設定頁面腳本
 */

// 預設設定
const DEFAULT_SETTINGS = {
  showBubble: true,
  showNotifications: true
};

// DOM 元素
const showBubbleCheckbox = document.getElementById('showBubble');
const showNotificationsCheckbox = document.getElementById('showNotifications');
const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');
const statusDiv = document.getElementById('status');

/**
 * 載入設定
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || DEFAULT_SETTINGS;

    showBubbleCheckbox.checked = settings.showBubble !== false;
    showNotificationsCheckbox.checked = settings.showNotifications !== false;

    console.log('✓ 設定已載入:', settings);
  } catch (error) {
    console.error('載入設定失敗:', error);
    showStatus('載入設定失敗', 'error');
  }
}

/**
 * 儲存設定
 */
async function saveSettings() {
  try {
    const settings = {
      showBubble: showBubbleCheckbox.checked,
      showNotifications: showNotificationsCheckbox.checked
    };

    await chrome.storage.local.set({ settings });

    console.log('✓ 設定已儲存:', settings);
    showStatus('設定已儲存！請重新整理頁面以套用新設定', 'success');
  } catch (error) {
    console.error('儲存設定失敗:', error);
    showStatus('儲存失敗，請重試', 'error');
  }
}

/**
 * 重置為預設值
 */
async function resetSettings() {
  try {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });

    showBubbleCheckbox.checked = DEFAULT_SETTINGS.showBubble;
    showNotificationsCheckbox.checked = DEFAULT_SETTINGS.showNotifications;

    console.log('✓ 設定已重置為預設值');
    showStatus('已重置為預設值！請重新整理頁面以套用新設定', 'success');
  } catch (error) {
    console.error('重置設定失敗:', error);
    showStatus('重置失敗，請重試', 'error');
  }
}

/**
 * 顯示狀態訊息
 */
function showStatus(message, type = 'success') {
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;

  setTimeout(() => {
    statusDiv.classList.remove('show');
  }, 3000);
}

// 事件監聽
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

// 頁面載入時載入設定
loadSettings();
