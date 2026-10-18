const KEYS = {
  users: 'doorlist:users',
  session: 'doorlist:session',
  registrations: 'doorlist:registrations',
};

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked (private mode) - the app still works for this tab
  }
}

const asArray = (v) => (Array.isArray(v) ? v : []);

export const loadUsers = () => asArray(read(KEYS.users, []));
export const saveUsers = (users) => write(KEYS.users, users);

export const loadSession = () => read(KEYS.session, null);
export const saveSession = (user) => write(KEYS.session, user);

export const loadRegistrations = () => asArray(read(KEYS.registrations, []));
export const saveRegistrations = (items) => write(KEYS.registrations, items);
