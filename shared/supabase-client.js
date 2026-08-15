/* ============================================================
   SUPABASE INTEGRATION — fill this in inside Antigravity
   ============================================================
   1. npm install @supabase/supabase-js  (or use the CDN script tag
      below in each HTML page, right before this file):
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

   2. Create a Supabase project → Settings → API → copy the
      Project URL and anon public key into the two constants below.

   3. In Supabase, enable Phone Auth (Authentication → Providers →
      Phone) and connect an SMS provider (Twilio / MessageBird /
      Vonage) — Supabase needs a real SMS provider to send OTPs.

   4. Create a table to control who is allowed into the app, e.g.:

        create table allowed_numbers (
          id uuid primary key default gen_random_uuid(),
          phone text unique not null,
          full_name text,
          role text default 'student', -- 'student' | 'admin' | 'owner'
          created_at timestamptz default now()
        );

      Add Row Level Security so only the service role (server side)
      can write to it, and only authenticated users can read their
      own row.

   5. The OWNER CONSOLE should be locked to ONE specific phone number
      AND email pair. Store that pair as a row in allowed_numbers with
      role = 'owner', and check both phone + email match in
      isOwner() below (see TODO inside).
   ============================================================ */

const SUPABASE_URL = 'https://bzfpcedrfqhnetecazvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnBjZWRyZnFobmV0ZWNhenZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTc2MjAsImV4cCI6MjEwMjMzMzYyMH0.fmMXXn-Yw5wn_Wi7z3E73LEtG5xYXM9_jT_hUv7TMJc';

let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

/* ---------- Auth actions (wire these to your login.html form) ---------- */

// Step 1: send OTP to a phone number (E.164 format, e.g. +919876543210)
async function sendOtp(phone) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured yet — fill in SUPABASE_URL/KEY above.');
  const { error } = await sb.auth.signInWithOtp({ phone });
  if (error) throw error;
  return true;
}

// Step 2: verify the OTP the user typed in
async function verifyOtp(phone, token) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured yet.');
  const { data, error } = await sb.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw error;
  return data.session;
}

// Get the currently logged-in user (or null)
async function getCurrentUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data ? data.user : null;
}

async function signOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  try { localStorage.removeItem('harmonyMockSession'); } catch (e) {}
}

// Check if a phone number is in the allowed_numbers table at all
// (i.e. this student/user is permitted to use the app)
async function isAllowedNumber(phone) {
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb
    .rpc('is_phone_allowed', { target_phone: phone });
  if (error) { console.error('Error checking allowed number:', error); return false; }
  return !!data;
}

// Owner Console access check — TODO: replace the hardcoded pair below
// with a real Supabase lookup once you've decided your owner's
// phone + email. Example real version:
//
//   async function isOwner(user) {
//     const sb = getSupabase();
//     const { data } = await sb.from('allowed_numbers')
//       .select('role, phone').eq('phone', user.phone).maybeSingle();
//     return data && data.role === 'owner' && user.email === 'YOUR_OWNER_EMAIL';
//   }
//
async function isOwner(user) {
  if (!user || !user.phone) return false;
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb
    .from('allowed_numbers')
    .select('role')
    .eq('phone', user.phone)
    .maybeSingle();
  if (error || !data) return false;
  return data.role === 'owner';
}

/* ---------- TEMPORARY mock session (until Supabase is wired up) ----------
   This lets the app shell + pages work today without a backend.
   Once Supabase is connected, app-shell.js should be switched to call
   getCurrentUser() above instead of readMockSession(). */
function readMockSession() {
  try {
    const raw = localStorage.getItem('harmonyMockSession');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function writeMockSession(session) {
  try { localStorage.setItem('harmonyMockSession', JSON.stringify(session)); } catch (e) {}
}

/* ---------- Supabase Sync Helpers ---------- */

async function getProfile(phone) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data, error } = await sb
          .from('profiles')
          .select('name, batch, photo_url, category, raga')
          .eq('phone', phone)
          .maybeSingle();
        if (!error && data) {
          try { localStorage.setItem('harmonyProfile:' + phone, JSON.stringify(data)); } catch(e) {}
          return data;
        }
      }
    } catch(e) {}
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem('harmonyProfile:' + phone);
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
}

async function upsertProfile(phone, name, batch, photo_url, category, raga) {
  const profileData = { phone, name, batch, photo_url, category, raga };
  try { localStorage.setItem('harmonyProfile:' + phone, JSON.stringify(profileData)); } catch(e) {}

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { error } = await sb
          .from('profiles')
          .upsert(profileData);
        if (error) throw error;
      }
    } catch(e) {
      console.warn('Supabase upsertProfile failed or not authenticated - saved locally only');
    }
  }
  return true;
}

async function getProgress(phone) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data, error } = await sb
          .from('progress')
          .select('ratings')
          .eq('phone', phone)
          .maybeSingle();
        if (!error && data) {
          try { localStorage.setItem('progress:' + phone, JSON.stringify(data.ratings)); } catch(e) {}
          return data.ratings;
        }
      }
    } catch(e) {}
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem('progress:' + phone);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

async function saveProgress(phone, ratings) {
  try { localStorage.setItem('progress:' + phone, JSON.stringify(ratings)); } catch(e) {}

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { error } = await sb
          .from('progress')
          .upsert({ phone, ratings, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
    } catch(e) {
      console.warn('Supabase saveProgress failed or not authenticated - saved locally only');
    }
  }
  return true;
}

async function uploadRiyazAudio(phone, blob, filename) {
  const sb = getSupabase();
  if (!sb) return null;
  const path = `${phone}/${filename}`;
  const { data, error } = await sb.storage
    .from('riyaz_audio')
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true
    });
  if (error) { console.error('Error uploading audio:', error); throw error; }
  const { data: { publicUrl } } = sb.storage.from('riyaz_audio').getPublicUrl(path);
  return publicUrl;
}

async function saveRiyazLog(phone, category, topic, hours, minutes, audio_url) {
  const today = new Date().toISOString().split('T')[0];
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { error } = await sb
          .from('daily_riyaz')
          .upsert({
            phone,
            practice_date: today,
            category,
            topic,
            hours: Number(hours),
            minutes: Number(minutes),
            audio_url
          }, { onConflict: 'phone, practice_date' });
        if (error) { console.error('Error saving riyaz log:', error); throw error; }
      }
    } catch (e) {
      console.warn('Supabase save failed or not authenticated - saving locally');
    }
  }

  // Always save to localStorage as a cache/fallback for mock mode
  const logKey = `harmonyRiyazLog:${phone}:${today}`;
  const logData = { phone, practice_date: today, category, topic, hours, minutes, audio_url };
  localStorage.setItem(logKey, JSON.stringify(logData));
  return true;
}

async function getRiyazLogToday(phone) {
  const today = new Date().toISOString().split('T')[0];
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data, error } = await sb
          .from('daily_riyaz')
          .select('*')
          .eq('phone', phone)
          .eq('practice_date', today)
          .maybeSingle();
        if (!error && data) return data;
      }
    } catch (e) {}
  }

  // Fallback to localStorage
  try {
    const logKey = `harmonyRiyazLog:${phone}:${today}`;
    const raw = localStorage.getItem(logKey);
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
}

async function saveAchievement(phone, event_date, event_name, song_details, prize_details) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { error } = await sb
          .from('competitions_achievements')
          .insert([{ phone, event_date, event_name, song_details, prize_details }]);
        if (error) { console.error('Error saving achievement:', error); throw error; }
      }
    } catch(e) {
      console.warn('Supabase achievement insert failed or not authenticated - saving locally');
    }
  }

  // Always save to localStorage as fallback
  let list = [];
  try { list = JSON.parse(localStorage.getItem(`harmonyAchievements:${phone}`) || '[]'); } catch(e) {}
  list.push({ phone, event_date, event_name, song_details, prize_details, created_at: new Date().toISOString() });
  localStorage.setItem(`harmonyAchievements:${phone}`, JSON.stringify(list));
  return true;
}

async function getAchievements(phone) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data, error } = await sb
          .from('competitions_achievements')
          .select('*')
          .eq('phone', phone)
          .order('event_date', { ascending: false });
        if (!error && data) return data;
      }
    } catch(e) {}
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(`harmonyAchievements:${phone}`);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    return [];
  }
}

async function getWeeklyRiyazLogs(phone) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 7);
        const pastStr = pastDate.toISOString().split('T')[0];

        const { data, error } = await sb
          .from('daily_riyaz')
          .select('practice_date, hours, minutes')
          .eq('phone', phone)
          .gte('practice_date', pastStr)
          .order('practice_date', { ascending: true });
        if (!error && data) return data;
      }
    } catch(e) {}
  }

  // Fallback to localStorage
  const logs = [];
  try {
    const prefix = `harmonyRiyazLog:${phone}:`;
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const raw = localStorage.getItem(prefix + dStr);
      if (raw) logs.push(JSON.parse(raw));
    }
    logs.sort((a, b) => a.practice_date.localeCompare(b.practice_date));
  } catch(e) {}
  return logs;
}
