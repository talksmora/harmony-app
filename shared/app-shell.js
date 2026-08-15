/* ============================================================
   Harmony Music — shared app shell (sidebar + topbar)
   Included on every page. Reads <body data-page="..."> to know
   which nav item to highlight, and builds the sidebar/topbar into
   the #appShellRoot container that must exist in each page's HTML.
   ============================================================ */

const NAV_ITEMS = [
  { section: { gu: 'મુખ્ય', hi: 'मुख्य', en: 'Main' } },
  { page: 'dashboard', icon: '🏠', label: { gu: 'ડેશબોર્ડ', hi: 'ડैशबोर्ड', en: 'Dashboard' }, href: 'dashboard.html' },
  { page: 'profile', icon: '👤', label: { gu: 'મારી પ્રોફાઇલ', hi: 'मेरी प्रोफाइल', en: 'My Profile' }, href: 'profile.html' },
  { page: 'daily-riyaz', icon: '📅', label: { gu: 'ડેઇલી રિયાઝ', hi: 'डेली रियाज़', en: 'Daily Riyaz' }, href: 'daily-riyaz.html' },
  { section: { gu: 'ફીચર્સ', hi: 'फीचर्स', en: 'Features' } },
  { page: 'pitch-monitor', icon: '🎤', label: { gu: 'વોકલ પિચ મોનિટર', hi: 'वोकल पिच मॉनिटर', en: 'Vocal Pitch Monitor' }, href: 'pitch-monitor.html' },
  { page: 'progress', icon: '📊', label: { gu: 'પ્રોગ્રેસ કાર્ડ', hi: 'प्रोगress कार्ड', en: 'Progress Card' }, href: 'progress.html' },
  { page: 'practice', icon: '🎧', label: { gu: 'Song Practice Tool', hi: 'Song Practice Tool', en: 'Song Practice Tool' }, href: 'practice-tool.html' },
  { page: 'metronome', icon: '⏱️', label: { gu: 'લયબદ્ધ મેટ્રોનોમ', hi: 'लयबद्ध मेट्रोनोम', en: 'Rhythmic Metronome' }, href: 'metronome.html' },
  { page: 'tabla', icon: '🥁', label: { gu: 'વર્ચ્યુઅલ તબલા', hi: 'वर्चुअल तबला', en: 'Virtual Tabla' }, href: 'tabla.html' },
  { page: 'instruments', icon: '🎵', label: { gu: 'બધા વાદ્ય સાધનો', hi: 'सभी वाद्य यंत्र', en: 'All Instruments' }, href: 'instruments.html' },
  { page: 'attendance', icon: '🗓️', label: { gu: 'હાજરી', hi: 'उपस्थिति', en: 'Attendance' }, href: 'attendance.html' },
  { page: 'fees', icon: '💳', label: { gu: 'ફી મેનેજમેન્ટ', hi: 'फीस प्रबंधन', en: 'Fee Management' }, href: 'fee-management.html' },
  { page: 'schedule', icon: '📅', label: { gu: 'ક્લાસ શેડ્યૂલ', hi: 'क्लास शेड्यूल', en: 'Class Schedule' }, href: 'class-schedule.html' },
  { page: 'students', icon: '🧑‍🎓', label: { gu: 'વિદ્યાર્થી યાદી', hi: 'छात्र सूची', en: 'Student List' }, href: 'student-list.html' },
  { section: { gu: 'મેનેજમેન્ટ', hi: 'प्रबंधन', en: 'Management' } },
  { page: 'owner-console', icon: '🛡️', label: { gu: 'ઓનર કન્સોલ', hi: 'ओनर कंसोल', en: 'Owner Console' }, href: 'owner-console.html', ownerOnly: true }
];

const SHELL_LANG = (() => {
  try { return localStorage.getItem('harmonyAppLang') || 'gu'; } catch (e) { return 'gu'; }
})();

function shellT(labelObj) {
  return labelObj[SHELL_LANG] || labelObj.gu;
}

function buildSidebarHtml(currentPage, ownerUnlocked) {
  let html = `
    <div class="sidebar-brand">
      <img src="icon-192.png" alt="Harmony Music">
      <span>Harmony Music</span>
    </div>
    <nav class="sidebar-nav">`;

  NAV_ITEMS.forEach(item => {
    if (item.section) {
      html += `<div class="sidebar-section-label">${shellT(item.section)}</div>`;
      return;
    }
    if (item.ownerOnly && !ownerUnlocked) return; // hide Owner Console entirely from non-owners
    const activeClass = item.page === currentPage ? 'active' : '';
    const disabledClass = item.soon ? 'disabled' : '';
    const soonTag = item.soon ? `<span class="soon-tag">${SHELL_LANG === 'en' ? 'Soon' : SHELL_LANG === 'hi' ? 'जल्द' : 'ટૂંક સમયમાં'}</span>` : '';
    html += `<a class="sidebar-link ${activeClass} ${disabledClass}" href="${item.soon ? 'javascript:void(0)' : item.href}">
      <span class="icon">${item.icon}</span><span>${shellT(item.label)}</span>${soonTag}
    </a>`;
  });

  html += `</nav>
    <div class="sidebar-footer">
      <div class="user-line" id="sidebarUserLine">👤 ${SHELL_LANG === 'en' ? 'Guest' : SHELL_LANG === 'hi' ? 'अतिथि' : 'મહેમાન'}</div>
      <button class="sidebar-logout-btn" id="sidebarLogoutBtn">${SHELL_LANG === 'en' ? 'Log out' : SHELL_LANG === 'hi' ? 'लॉग आउट' : 'લોગ આઉટ'}</button>
    </div>`;
  return html;
}

const THEME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-palette" style="pointer-events:none;"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.2338 21.7225 10.5057 21.22 9.93L19.78 8.27C19.2775 7.69429 19 6.96624 19 6.2C19 4.98497 18.015 4 16.8 4C16.0338 4 15.3057 4.27746 14.73 4.78L13.07 6.22C12.4943 6.72254 11.7662 7 11 7H8C4.68629 7 2 9.68629 2 13C2 17.9706 6.02944 22 11 22H12Z"></path><circle cx="7.5" cy="11.5" r="1.5" fill="currentColor"></circle><circle cx="11.5" cy="10.5" r="1.5" fill="currentColor"></circle><circle cx="15.5" cy="12.5" r="1.5" fill="currentColor"></circle></svg>`;
const LANG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe" style="pointer-events:none;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

function buildTopbarHtml(pageTitle, customButtons) {
  let buttonsHtml = '';
  if (customButtons) {
    customButtons.forEach(btn => {
      buttonsHtml += `<button id="${btn.id}" class="ctrl-btn" title="${btn.title}">${btn.html}</button>`;
    });
  }
  buttonsHtml += `
    <button id="themeBtn" class="ctrl-btn" title="Theme">${THEME_SVG}</button>
    <button id="langBtn" class="ctrl-btn" title="Language">${LANG_SVG}</button>
  `;
  return `
    <button class="hamburger-btn" id="hamburgerBtn">☰</button>
    <div class="topbar-title">${pageTitle}</div>
    <div class="topbar-controls">
      ${buttonsHtml}
    </div>`;
}

async function initAppShell(options) {
  options = options || {};
  const currentPage = document.body.getAttribute('data-page') || '';
  const pageTitle = options.title || '';

  // ---- auth guard (mock session until Supabase is wired up in Antigravity) ----
  // TODO: once Supabase is connected, replace readMockSession() with:
  //   const user = await getCurrentUser();
  const session = (typeof readMockSession === 'function') ? readMockSession() : null;
  const isLoggedIn = !!session;
  const ownerUnlocked = !!(session && (session.isOwner || session.role === 'owner' || session.role === 'admin'));

  if (!isLoggedIn && currentPage !== 'login') {
    window.location.href = 'login.html';
    return;
  }
  if (currentPage === 'owner-console' && !ownerUnlocked) {
    alert(SHELL_LANG === 'en' ? 'Management access only.' : SHELL_LANG === 'hi' ? 'केवल प्रबंधन पहुंच।' : 'ફક્ત મેનેજમેન્ટ એક્સેસ.');
    window.location.href = 'dashboard.html';
    return;
  }

  const root = document.getElementById('appShellRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">${buildSidebarHtml(currentPage, ownerUnlocked)}</aside>
    <div class="main-area">
      <div class="topbar">${buildTopbarHtml(pageTitle, options.customHeaderButtons)}</div>
      <div class="page-content" id="pageContent"></div>
    </div>`;

  // move any pre-existing page body content into #pageContent
  const existingContent = document.getElementById('pageBody');
  if (existingContent) {
    document.getElementById('pageContent').appendChild(existingContent);
    existingContent.style.display = '';
  }

  // Update user line dynamically and enforce profile completion globally
  const userLine = document.getElementById('sidebarUserLine');
  if (session && session.phone) {
    (async () => {
      const isProfilePage = currentPage === 'profile';
      const isLoginPage = currentPage === 'login';

      const checkProfile = (prof) => {
        if (!prof || !prof.name || !prof.name.trim() || prof.name === 'Guest' || prof.name === 'મહેમાન' || !prof.batch || !prof.batch.trim()) {
          if (!isProfilePage) {
            window.location.href = 'profile.html?forceComplete=1';
          } else {
            // Lock sidebar navigation on profile page until completed
            const style = document.createElement('style');
            style.id = 'profileForceLockStyle';
            style.textContent = `
              .sidebar-nav a {
                pointer-events: none !important;
                opacity: 0.3 !important;
              }
              .hamburger-btn {
                display: none !important;
              }
            `;
            if (!document.getElementById('profileForceLockStyle')) {
              document.head.appendChild(style);
            }
            
            const addWarning = () => {
              const warning = document.createElement('div');
              warning.id = 'profileForceWarning';
              warning.style.cssText = 'background:var(--accent); color:#fff; padding:12px; border-radius:8px; margin-bottom:20px; font-weight:700; text-align:center; font-size:0.95rem;';
              warning.textContent = SHELL_LANG === 'en' 
                ? '⚠️ Please complete your name and batch to proceed!' 
                : SHELL_LANG === 'hi' 
                  ? '⚠️ आगे बढ़ने के लिए कृपया अपना नाम और बैच पूरा करें!' 
                  : '⚠️ આગળ વધતા પહેલા કૃપા કરીને તમારું નામ અને બેચ પૂર્ણ કરો!';
              const card = document.querySelector('.profile-card');
              if (card && !document.getElementById('profileForceWarning')) {
                card.insertBefore(warning, card.firstChild);
              }
            };
            if (document.readyState === 'loading') {
              window.addEventListener('DOMContentLoaded', addWarning);
            } else {
              addWarning();
            }
          }
        }
      };

      const getPhotoHtml = (photo) => {
        if (!photo) return '👤 ';
        if (photo.startsWith('http') || photo.startsWith('data:image')) {
          return `<img src="${photo}" style="width:24px; height:24px; border-radius:50%; margin-right:8px; object-fit:cover; vertical-align:middle;">`;
        }
        return `<span style="margin-right:8px; font-size:1.1rem; vertical-align:middle;">${photo}</span>`;
      };

      // 1. Show cached version first for instant load and verify
      let cachedProf = null;
      try {
        const raw = localStorage.getItem('harmonyProfile:' + session.phone);
        if (raw) cachedProf = JSON.parse(raw);
      } catch(e) {}
      if (cachedProf && cachedProf.name) {
        if (userLine) {
          const photoStr = getPhotoHtml(cachedProf.photo_url);
          userLine.innerHTML = `${photoStr}${cachedProf.name}`;
        }
      }
      if (!isLoginPage) {
        checkProfile(cachedProf);
      }

      // 2. Query database for freshest data if authenticated in Supabase
      if (typeof getProfile === 'function') {
        try {
          const sb = getSupabase();
          const { data: { user } } = sb ? await sb.auth.getUser() : { data: {} };
          if (user) {
            const dbProfile = await getProfile(session.phone);
            if (dbProfile && dbProfile.name) {
              localStorage.setItem('harmonyProfile:' + session.phone, JSON.stringify(dbProfile));
              if (userLine) {
                const photoStr = getPhotoHtml(dbProfile.photo_url);
                userLine.innerHTML = `${photoStr}${dbProfile.name}`;
              }
              if (!isLoginPage) {
                checkProfile(dbProfile);
              }
            }
          }
        } catch(e) {}
      }
    })();
  }

  // hamburger toggle (mobile)
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // logout
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (typeof signOut === 'function') await signOut();
      window.location.href = 'login.html';
    });
  }

  // theme (shared key with pitch-monitor.html so preference stays consistent app-wide)
  const currentTheme = (() => {
    try { return localStorage.getItem('harmonyAppTheme') || 'light'; } catch (e) { return 'light'; }
  })();
  document.body.classList.toggle('dark-theme', currentTheme === 'dark');
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      try { localStorage.setItem('harmonyAppTheme', isDark ? 'dark' : 'light'); } catch (e) {}
    });
  }

  // language (cycles gu -> hi -> en, shared key; reloads shell text)
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const cycle = ['gu', 'hi', 'en'];
      const idx = cycle.indexOf(SHELL_LANG);
      const next = cycle[(idx + 1) % cycle.length];
      try { localStorage.setItem('harmonyAppLang', next); } catch (e) {}
      window.location.reload();
    });
  }

  // Register service worker globally
  if ('serviceWorker' in navigator) {
    const registerSW = () => {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch(() => {});
    };
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }
  }

  // ---- Global Fee Lock Check ----
  (function checkGlobalFeeLock() {
    if (!isLoggedIn || currentPage === 'login' || currentPage === 'index') return;

    let feeStatus = localStorage.getItem('harmony_fee_status');
    let dueDateStr = localStorage.getItem('harmony_fee_due_date');

    if (!dueDateStr) {
      dueDateStr = '2026-08-10';
      localStorage.setItem('harmony_fee_due_date', dueDateStr);
    }

    const today = new Date();
    const dueDate = new Date(dueDateStr);

    if (today > dueDate && feeStatus !== 'Paid') {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.head.appendChild(script);
      }

      const style = document.createElement('style');
      style.textContent = `
        .global-lock-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 15, 20, 0.96);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          color: #f7e6d5;
          text-align: center;
          padding: 24px;
        }
        .global-lock-card {
          max-width: 440px;
          background: #111;
          border: 3px solid #e74c3c;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 15px 40px rgba(231,76,60,0.3);
        }
        .lock-btn {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          border: none;
          color: white;
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          margin-top: 20px;
          box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
          transition: all 0.2s;
        }
        .lock-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(231, 76, 60, 0.6);
        }
      `;
      document.head.appendChild(style);

      const overlay = document.createElement('div');
      overlay.className = 'global-lock-overlay';

      const tObj = {
        gu: {
          title: '🔒 એપ લોક કરેલ છે',
          msg: 'આ મહિનાની સંગીત ક્લાસની ફી બાકી હોવાથી સબ્સ્ક્રિપ્શન અસ્થાયી રૂપે બંધ કરવામાં આવ્યું છે. કૃપા કરીને અનલોક કરવા માટે Razorpay દ્વારા ફી ભરો.',
          pay: '💳 ફી ભરો (₹2,000)'
        },
        hi: {
          title: '🔒 ऐप लॉक है',
          msg: 'इस महीने की संगीत क्लास की फीस बकाया होने के कारण आपकी सदस्यता अस्थायी रूप से बंद कर दी गई है। कृपया अनलॉक करने के लिए Razorpay द्वारा फीस का भुगतान करें।',
          pay: '💳 फीस भरें (₹2,000)'
        },
        en: {
          title: '🔒 App Locked',
          msg: 'Tuition fees for this month are overdue. The application has been temporarily locked. Please pay ₹2,000 via Razorpay to unlock it.',
          pay: '💳 Pay Fees Now (₹2,000)'
        }
      };
      const lockT = tObj[SHELL_LANG] || tObj.en;

      overlay.innerHTML = `
        <div class="global-lock-card">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🔒</div>
          <h2 style="margin: 0 0 12px; color: #e74c3c;">${lockT.title}</h2>
          <p style="font-size: 0.95rem; color: #a6b9c7; line-height: 1.6; margin: 0 0 20px;">${lockT.msg}</p>
          
          <div style="margin-bottom: 20px; text-align: left;">
            <label style="font-size: 0.75rem; color: var(--subtitle); font-weight: 700; display: block; margin-bottom: 6px;">Select Subscription Plan:</label>
            <select id="globalLockPlanSelect" style="width: 100%; padding: 12px 16px; border-radius: 12px; background: #222; border: 1.5px solid var(--border); color: #fff; font-weight: 700; font-size: 0.95rem; outline: none; cursor: pointer;">
              <option value="1" data-amount="2000" selected>1 Month / ૧ મહિનો — ₹2,000</option>
              <option value="3" data-amount="5100">3 Months / ૩ મહિના — ₹5,100 (₹1,700/mo)</option>
              <option value="6" data-amount="9000">6 Months / ૬ મહિના — ₹9,000 (₹1,500/mo)</option>
            </select>
          </div>

          <button class="lock-btn" id="globalLockPayBtn" style="width: 100%;">${lockT.pay}</button>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const planSelect = document.getElementById('globalLockPlanSelect');
      const payBtn = document.getElementById('globalLockPayBtn');

      planSelect.onchange = () => {
        const amt = planSelect.options[planSelect.selectedIndex].getAttribute('data-amount');
        payBtn.textContent = SHELL_LANG === 'en' 
          ? `💳 Pay Fees Now (₹${parseInt(amt).toLocaleString()})` 
          : SHELL_LANG === 'hi' 
            ? `💳 फीस भरें (₹${parseInt(amt).toLocaleString()})` 
            : `💳 ફી ભરો (₹${parseInt(amt).toLocaleString()})`;
      };

      payBtn.onclick = () => {
        if (!window.Razorpay) {
          alert('Razorpay is loading, please try again in a second...');
          return;
        }

        const selectedOption = planSelect.options[planSelect.selectedIndex];
        const monthsCount = parseInt(planSelect.value);
        const amountRs = parseInt(selectedOption.getAttribute('data-amount'));

        const options = {
          key: 'rzp_test_HarmonyMusicKey123',
          amount: amountRs * 100,
          currency: 'INR',
          name: 'Harmony Music Class',
          description: `${monthsCount} Month Tuition Fees`,
          handler: function(response) {
            localStorage.setItem('harmony_fee_status', 'Paid');
            
            // Advance due date by selected months count
            const nextDueDate = new Date(dueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + monthsCount);
            localStorage.setItem('harmony_fee_due_date', nextDueDate.toISOString().split('T')[0]);

            // Save to payment history
            const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const newPayment = {
              date: todayStr,
              amount: `₹${amountRs.toLocaleString()}`,
              method: 'UPI (Razorpay)',
              status: 'Paid',
              receiptNo: '#HM-' + Math.floor(1000 + Math.random() * 9000)
            };
            const localPayList = JSON.parse(localStorage.getItem('harmony_payments_list') || '[]');
            localPayList.unshift(newPayment);
            localStorage.setItem('harmony_payments_list', JSON.stringify(localPayList));

            alert(SHELL_LANG === 'en' ? 'Payment Successful! App Unlocked.' : SHELL_LANG === 'hi' ? 'भुगतान सफल! ऐप अनलॉक हो गया।' : 'ચુકવણી સફળ! એપ અનલોક થઈ ગઈ છે.');
            window.location.reload();
          },
          prefill: {
            name: session ? session.name : 'Learner',
            email: session ? session.email : 'learner@example.com'
          },
          theme: {
            color: '#e74c3c'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    }
  })();
}
