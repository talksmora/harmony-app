/* ============================================================
   Harmony Music — shared utility functions
   Toast notifications, error handling, validation helpers.
   Include after theme.css and components.css on every page.
   ============================================================ */

/* ---------- Toast Notification System ---------- */
function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3000;
  // Remove existing toast if any
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger reflow then show
  void toast.offsetWidth;
  toast.classList.add('show');

  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

/* ---------- Global Error Handler ---------- */
window.onerror = function(msg, url, line, col, error) {
  console.error('[Harmony Error]', msg, url, line, col, error);
  // In production, could send to Sentry/logging service
  return false;
};

window.onunhandledrejection = function(event) {
  console.error('[Harmony Unhandled Promise]', event.reason);
};

/* ---------- Validation Helpers ---------- */
function isValidPhone(phone) {
  // E.164 format: +[country code][number], 7-15 digits total
  var cleaned = phone.replace(/\s/g, '');
  return /^\+?[1-9]\d{6,14}$/.test(cleaned);
}

function cleanPhone(phone) {
  var cleaned = phone.replace(/\s/g, '');
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

function isValidOtp(otp) {
  return /^\d{6}$/.test(otp.trim());
}

/* ---------- Safe HTML Escape ---------- */
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- LocalStorage Safe Wrapper ---------- */
function safeGetItem(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw !== null ? raw : (fallback !== undefined ? fallback : null);
  } catch (e) {
    return fallback !== undefined ? fallback : null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('[Harmony] localStorage write failed:', key, e);
    return false;
  }
}

function safeGetJson(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : null);
  } catch (e) {
    return fallback !== undefined ? fallback : null;
  }
}

function safeSetJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[Harmony] localStorage JSON write failed:', key, e);
    return false;
  }
}
