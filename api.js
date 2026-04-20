// ============================================================
// BTB Pilote — Couche API avec cache localStorage
// ============================================================

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzybmjxfM6YPA-V5Ibi8-dzJIV0DfjXUhKSurLq1d4CGoyeNOtnjKi3Z6lL4z9oZm6DjQ/exec';
const API_SECRET = 'BTB360-SECRET-2026';

// ─── CACHE ──────────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000; // 5 min
const CACHE_PREFIX = 'btb_';

const CACHEABLE = new Set([
  'getInitialData', 'getChantiers', 'getProspects', 'getSuivi',
  'getDashboardStats', 'getUsers'
]);

const INVALIDATIONS = {
  saveChantier:   ['getChantiers', 'getDashboardStats', 'getInitialData'],
  deleteChantier: ['getChantiers', 'getDashboardStats', 'getInitialData'],
  convertProspect:['getChantiers', 'getProspects', 'getDashboardStats', 'getInitialData'],
  saveProspect:   ['getProspects', 'getDashboardStats', 'getInitialData'],
  deleteProspect: ['getProspects', 'getDashboardStats', 'getInitialData'],
  saveSuivi:      ['getSuivi', 'getDashboardStats', 'getInitialData'],
  deleteSuivi:    ['getSuivi', 'getDashboardStats', 'getInitialData']
};

function _cacheKey(action, params) {
  return CACHE_PREFIX + action + '_' + JSON.stringify(params || {});
}
function _getCached(action, params) {
  try {
    const raw = localStorage.getItem(_cacheKey(action, params));
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.ts > CACHE_TTL) {
      localStorage.removeItem(_cacheKey(action, params));
      return null;
    }
    return item.data;
  } catch (e) { return null; }
}
function _setCache(action, params, data) {
  try { localStorage.setItem(_cacheKey(action, params), JSON.stringify({ ts: Date.now(), data })); }
  catch (e) {}
}
function _invalidate(actions) {
  try {
    const keys = Object.keys(localStorage);
    actions.forEach(a => {
      keys.filter(k => k.startsWith(CACHE_PREFIX + a + '_'))
          .forEach(k => localStorage.removeItem(k));
    });
  } catch (e) {}
}
function clearApiCache() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

// ─── GET ────────────────────────────────────────────────────
async function apiGet(action, params = {}) {
  if (CACHEABLE.has(action)) {
    const cached = _getCached(action, params);
    if (cached !== null) return cached;
  }
  const url = new URL(GAS_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('token', API_SECRET);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res  = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.msg || 'Erreur API');
  if (CACHEABLE.has(action)) _setCache(action, params, json.data);
  return json.data;
}

// ─── POST (via GET write pour contourner CORS) ─────────────
async function apiPost(action, data = {}) {
  const url = new URL(GAS_URL);
  url.searchParams.set('action', 'write');
  url.searchParams.set('token', API_SECRET);
  url.searchParams.set('op', action);
  url.searchParams.set('payload', JSON.stringify(data));
  const res  = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.msg || 'Erreur API');
  const inv = INVALIDATIONS[action] || [];
  if (inv.length) _invalidate(inv);
  return json.data;
}

// ─── Alias métier ──────────────────────────────────────────
const API = {
  login:           (email, pwd) => apiGet('login', { user: email, pwd }),
  getInitialData: ()            => apiGet('getInitialData'),
  getChantiers:   ()            => apiGet('getChantiers'),
  getProspects:   ()            => apiGet('getProspects'),
  getSuivi:       ()            => apiGet('getSuivi'),
  getDashboardStats: ()         => apiGet('getDashboardStats'),
  getUsers:       ()            => apiGet('getUsers'),

  saveChantier:    (d)  => apiPost('saveChantier', d),
  deleteChantier:  (id) => apiPost('deleteChantier', { id }),
  convertProspect: (id, user) => apiPost('convertProspect', { id, _user: user }),

  saveProspect:    (d)  => apiPost('saveProspect', d),
  deleteProspect:  (id) => apiPost('deleteProspect', { id }),

  saveSuivi:       (d)  => apiPost('saveSuivi', d),
  deleteSuivi:     (id) => apiPost('deleteSuivi', { id })
};
