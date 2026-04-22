// ── МИРАС · Auth ─────────────────────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem('miras_users') || '[]'); } catch { return []; }
}
function saveUsers(u) { localStorage.setItem('miras_users', JSON.stringify(u)); }

function hashPass(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['#c9a961','#7a6a4f','#5a8a6a','#5a7aaa','#8a5a9a','#9a5a6a'];
function avatarColor(name) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem('miras_current') ||
      sessionStorage.getItem('miras_current') ||
      'null'
    );
  } catch { return null; }
}

function setCurrentUser(u) {
  sessionStorage.setItem('miras_current', JSON.stringify(u));
  localStorage.setItem('miras_current', JSON.stringify(u));
}

function updateAuthUI() {
  const u = getCurrentUser();
  const authArea = document.getElementById('nav-auth-area');
  const userArea = document.getElementById('nav-user-area');
  if (u) {
    authArea.style.display = 'none';
    userArea.style.display = 'flex';
    const ini = getInitials(u.name);
    const col = avatarColor(u.name);
    ['nav-avatar','dd-avatar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ini; el.style.background = col; }
    });
    const nu = document.getElementById('nav-username');
    if (nu) nu.textContent = u.name.split(' ')[0];
    const dn = document.getElementById('dd-name');
    const de = document.getElementById('dd-email');
    if (dn) dn.textContent = u.name;
    if (de) de.textContent = u.email;
  } else {
    authArea.style.display = 'flex';
    userArea.style.display = 'none';
  }
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const alert = document.getElementById('login-alert');
  alert.style.display = 'none';
  if (!email || !pass) { alert.textContent = t('auth.login.fill'); alert.style.display = 'block'; return; }
  const users = getUsers();
  const user  = users.find(u => u.email === email);
  if (!user) { alert.textContent = t('auth.login.notfound'); alert.style.display = 'block'; return; }
  if (user.passwordHash !== hashPass(pass)) { alert.textContent = t('auth.login.badpass'); alert.style.display = 'block'; return; }
  setCurrentUser(user);
  closeModal('login');
  updateAuthUI();
  showToast(t('auth.welcome') + user.name.split(' ')[0] + t('auth.welcome.suf'), 'success');
}

function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const alert = document.getElementById('reg-alert');
  alert.style.display = 'none';
  let ok = true;
  if (name.split(/\s+/).length < 2) {
    document.getElementById('reg-name-err').style.display = 'block'; ok = false;
  } else { document.getElementById('reg-name-err').style.display = 'none'; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    document.getElementById('reg-email-err').style.display = 'block'; ok = false;
  } else { document.getElementById('reg-email-err').style.display = 'none'; }
  if (pass.length < 6) {
    document.getElementById('reg-pass-err').style.display = 'block'; ok = false;
  } else { document.getElementById('reg-pass-err').style.display = 'none'; }
  if (!ok) return;
  const users = getUsers();
  if (users.find(u => u.email === email)) { alert.textContent = t('auth.reg.dup'); alert.style.display = 'block'; return; }
  const newUser = { id: Date.now().toString(), name, email, passwordHash: hashPass(pass), createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  closeModal('register');
  updateAuthUI();
  showToast(t('auth.created') + name.split(' ')[0] + t('auth.welcome.suf'), 'success');
}

function logout() {
  localStorage.removeItem('miras_current');
  sessionStorage.removeItem('miras_current');
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.remove('open');
  updateAuthUI();
  showToast(t('auth.logout.msg'));
}

function toggleDropdown() {
  document.getElementById('user-dropdown').classList.toggle('open');
}

function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
  const al = document.getElementById(id === 'login' ? 'login-alert' : 'reg-alert');
  if (al) al.style.display = 'none';
}
function closeModal(id) { document.getElementById('modal-' + id).classList.remove('open'); }
function switchModal(from, to) { closeModal(from); openModal(to); }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  });
  document.addEventListener('click', e => {
    const ua = document.getElementById('nav-user-area');
    if (ua && !ua.contains(e.target)) {
      const dd = document.getElementById('user-dropdown');
      if (dd) dd.classList.remove('open');
    }
  });
  updateAuthUI();
});
