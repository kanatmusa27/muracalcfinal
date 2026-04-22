// ── МИРАС · App ──────────────────────────────────────────────────

// ── DATA ─────────────────────────────────────────────────────────
const PEOPLE = [
  { id:'berik',     name:'Берик Айтмаханбет',  born:1975, died:2026,
    assets:[{i:'🏠',n:'Квартира в Астане (80 м²)',v:18000000},
            {i:'🚗',n:'Toyota Camry 2020',v:8000000},
            {i:'💰',n:'Банковский вклад',v:2000000}] },
  { id:'zhalgas',   name:'Жалгас Бегалиев',    born:1968, died:2026,
    assets:[{i:'🏡',n:'Жилой дом (180 м²)',v:25000000},
            {i:'🌿',n:'Земельный участок',v:3000000}] },
  { id:'samat',     name:'Самат Мажитов',       born:1982, died:2026,
    assets:[{i:'🏠',n:'Квартира (55 м²)',v:12000000},
            {i:'🏍',n:'Honda CB500F',v:1200000},
            {i:'🅿',n:'Гараж',v:1500000}] },
  { id:'aidarkhan', name:'Айдархан Жакупов',    born:1990, died:2026,
    assets:[{i:'💰',n:'Банковский вклад',v:500000}] }
];

const fam = { ch:0, sp:false, mo:false, fa:false, br:0, si:0, gp:0, un:0, ne:0 };
let selPerson = null;

// ── FORMAT ────────────────────────────────────────────────────────
function fmtC(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0','') + ' млн ₸';
  if (n >= 1000)    return Math.round(n / 1000) + ' тыс ₸';
  return n + ' ₸';
}
function fmtF(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸';
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ' ' + type : '');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

// ── PEOPLE CARDS ──────────────────────────────────────────────────
function renderPeople(list) {
  document.getElementById('pgrid').innerHTML = list.map(p => {
    const tot = p.assets.reduce((s, a) => s + a.v, 0);
    const isSel = selPerson && selPerson.id === p.id;
    return `<div class="pcard${isSel ? ' sel' : ''}" onclick="pickPerson('${p.id}')">
      <div class="pname">${p.name}</div>
      <div class="pyears">${p.born}–${p.died}</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">
        ${p.assets.slice(0,2).map(a => a.i + ' ' + a.n.split('(')[0].trim()).join(' · ')}${p.assets.length > 2 ? '...' : ''}
      </div>
      <span class="asset-badge">${t('calc.total')}${fmtC(tot)}</span>
    </div>`;
  }).join('');
}

function filterPeople(q) {
  const v = q.toLowerCase();
  renderPeople(PEOPLE.filter(p => p.name.toLowerCase().includes(v)));
}

function pickPerson(id) {
  selPerson = PEOPLE.find(p => p.id === id);
  const q = document.getElementById('psearch').value;
  renderPeople(PEOPLE.filter(p => p.name.toLowerCase().includes(q.toLowerCase())));
  document.getElementById('family-form').style.display = 'block';
  document.getElementById('sel-banner').textContent = t('calc.heir.prefix') + selPerson.name;
}

// ── FAMILY CONTROLS ───────────────────────────────────────────────
function chg(k, d) {
  const max = { ch:6, br:5, si:5, gp:4, un:4, ne:4 };
  fam[k] = Math.max(0, Math.min(max[k] || 5, fam[k] + d));
  document.getElementById('v' + k).textContent = fam[k];
}
function tog(k) {
  fam[k] = !fam[k];
  document.getElementById('t' + k).classList.toggle('on', fam[k]);
}

// ── BUILD TREE ────────────────────────────────────────────────────
function buildTree() {
  if (!selPerson) return;
  const p   = selPerson;
  const tot = p.assets.reduce((s, a) => s + a.v, 0);

  // Build heir lists
  const q1 = [], q2 = [], q3 = [];
  for (let i = 0; i < fam.ch; i++) q1.push({ n: t('rel.child.n')  + (i+1), r:'child',   q:1 });
  if (fam.sp) q1.push({ n: t('rel.spouse'),  r:'spouse', q:1 });
  if (fam.mo) q1.push({ n: t('calc.mother'), r:'parent', q:1 });
  if (fam.fa) q1.push({ n: t('calc.father'), r:'parent', q:1 });
  for (let i = 0; i < fam.br; i++) q2.push({ n: t('rel.brother.n') + (i+1), r:'brother', q:2 });
  for (let i = 0; i < fam.si; i++) q2.push({ n: t('rel.sister.n')  + (i+1), r:'sister',  q:2 });
  for (let i = 0; i < fam.gp; i++) q2.push({ n: t('rel.gp.n')     + (i+1), r:'grandp',  q:2 });
  for (let i = 0; i < fam.un; i++) q3.push({ n: t('rel.uncle.n')   + (i+1), r:'uncle',   q:3 });
  for (let i = 0; i < fam.ne; i++) q3.push({ n: t('rel.nephew.n')  + (i+1), r:'nephew',  q:3 });

  let activeQ = 0, activeHeirs = [];
  if (q1.length)      { activeQ = 1; activeHeirs = q1; }
  else if (q2.length) { activeQ = 2; activeHeirs = q2; }
  else if (q3.length) { activeQ = 3; activeHeirs = q3; }
  const share = activeHeirs.length > 0 ? tot / activeHeirs.length : 0;

  const relMap = { child:'rel.child', spouse:'rel.spouse', parent:'rel.parent',
                   brother:'rel.brother', sister:'rel.sister', grandp:'rel.grandp',
                   uncle:'rel.uncle', nephew:'rel.nephew' };

  // ── Queue HTML renderer ──
  function queueHtml(heirs, qn, active) {
    if (!heirs.length) return '';
    const lc  = active ? '#c9a961' : '#e0d8cc';
    const rows = [];
    for (let r = 0; r < heirs.length; r += 4) rows.push(heirs.slice(r, r + 4));
    const BW = 120, BGAP = 12;
    let html = `
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:16px">
        <div style="width:2px;height:20px;background:${lc}"></div>
        <div style="padding:5px 20px;background:${active?'#fef3d0':'#f5f0e8'};border:1.5px solid ${lc};border-radius:100px;font-size:.72rem;font-weight:600;color:${active?'#7a5900':'#bbb'}">${qn}${t('calc.queue.sfx')}</div>
        <div style="width:2px;height:20px;background:${lc}"></div>
      </div>`;
    rows.forEach(row => {
      html += `<div style="display:flex;gap:${BGAP}px;justify-content:center;margin-bottom:12px">`;
      row.forEach(h => {
        if (active) {
          html += `<div style="width:${BW}px;background:#fff;border:2px solid var(--gold);border-radius:10px;padding:10px 8px;text-align:center;transition:transform .2s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
            <div style="font-size:.72rem;font-weight:600;color:var(--black);margin-bottom:2px">${h.n}</div>
            <div style="font-size:.65rem;color:var(--text-muted);margin-bottom:6px">${t(relMap[h.r])}</div>
            <div style="font-size:.72rem;font-weight:700;color:var(--gold)">1/${activeHeirs.length}${t('calc.share')}</div>
            <div style="font-size:.65rem;color:var(--text-muted)">${fmtC(share)}</div>
          </div>`;
        } else {
          html += `<div style="width:${BW}px;background:var(--beige-light);border:1.5px solid var(--beige-dark);border-radius:10px;padding:10px 8px;text-align:center;opacity:.45">
            <div style="font-size:.72rem;font-weight:500;color:#aaa;margin-bottom:4px">${h.n}</div>
            <div style="font-size:.65rem;color:#bbb;font-style:italic">${t('calc.not.inherit')}</div>
          </div>`;
        }
      });
      html += `</div>`;
    });
    return html;
  }

  const allQueues = [
    { q: q1, n:1, act: activeQ === 1 },
    { q: q2, n:2, act: activeQ === 2 },
    { q: q3, n:3, act: activeQ === 3 }
  ].filter(x => x.q.length > 0);

  // Assets HTML
  const assetsHtml = p.assets.map(a =>
    `<div class="asset-row"><span>${a.i} ${a.n}</span><strong>${fmtF(a.v)}</strong></div>`
  ).join('');

  // Heirs table rows
  const heirsRows = activeHeirs.length > 0
    ? activeHeirs.map(h =>
        `<tr>
          <td>${h.n}</td>
          <td><span class="heir-rel">${t(relMap[h.r])}</span></td>
          <td><span class="queue-badge q${h.q}">${h.q}${t('calc.queue.sfx')}</span></td>
          <td class="heir-share" style="text-align:right;font-weight:600;color:var(--gold)">1/${activeHeirs.length} = ${fmtF(share)}</td>
        </tr>`
      ).join('')
    : `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);font-style:italic;padding:1.5rem">${t('calc.no.heirs')}</td></tr>`;

  const html = `
    <div class="tree-header">
      <h2>${p.name}</h2>
      <p>${p.born} – ${p.died} &nbsp;·&nbsp; <span class="total">${fmtF(tot)}</span></p>
      ${activeQ > 0 ? `<p style="margin-top:6px;font-size:.8rem;color:var(--text-muted)">${t('calc.active.q')}<strong>${activeQ}${t('calc.queue.sfx')}</strong> — ${activeHeirs.length}${t('calc.people')}</p>` : ''}
    </div>

    <div style="overflow-x:auto;padding:0 .5rem">
      <div style="display:flex;flex-direction:column;align-items:center;min-width:400px">
        <div style="background:var(--black);color:#fff;border-radius:12px;padding:12px 28px;text-align:center;min-width:220px">
          <div style="font-size:.62rem;font-weight:600;letter-spacing:.12em;color:var(--gold);margin-bottom:3px">${t('calc.heir.label')}</div>
          <div style="font-weight:600;font-size:.95rem">${p.name}</div>
          <div style="font-size:.72rem;color:#aaa;margin-top:3px">${fmtC(tot)}</div>
        </div>
        ${allQueues.map(x => queueHtml(x.q, x.n, x.act)).join('') ||
          `<div style="padding:2rem;color:var(--text-muted);font-size:.875rem;text-align:center;margin-top:1rem">${t('calc.no.title')}</div>`
        }
      </div>
    </div>

    <div class="estate-box" style="margin-top:2rem">
      <div class="estate-title">${t('calc.assets.title')}</div>
      ${assetsHtml}
      <div class="estate-total"><span>${t('calc.total').replace(': ','')}</span><span>${fmtF(tot)}</span></div>
    </div>

    ${activeHeirs.length > 0 ? `
    <div style="margin-top:1.5rem">
      <div class="estate-title">${t('calc.heirs.title')}</div>
      <table class="heirs-table">
        <thead><tr>
          <th>${t('calc.heir')}</th><th>${t('calc.rel')}</th>
          <th>${t('calc.queue.col')}</th><th style="text-align:right">${t('calc.share.col')}</th>
        </tr></thead>
        <tbody>${heirsRows}</tbody>
      </table>
    </div>` : ''}
  `;

  document.getElementById('no-result').style.display  = 'none';
  document.getElementById('tree-result').style.display = 'block';
  document.getElementById('tree-result').innerHTML     = html;
}

function resetAll() {
  selPerson = null;
  Object.assign(fam, { ch:0, sp:false, mo:false, fa:false, br:0, si:0, gp:0, un:0, ne:0 });
  ['ch','br','si','gp','un','ne'].forEach(k => { document.getElementById('v'+k).textContent = '0'; });
  ['tsp','tmo','tfa'].forEach(id => document.getElementById(id).classList.remove('on'));
  document.getElementById('family-form').style.display  = 'none';
  document.getElementById('no-result').style.display    = 'block';
  document.getElementById('tree-result').style.display  = 'none';
  document.getElementById('psearch').value = '';
  renderPeople(PEOPLE);
}

// ── PAGES ─────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const el = document.getElementById('nav-' + id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

// ── LANG CHANGE HOOK ──────────────────────────────────────────────
window.onLangChange = function () {
  if (selPerson) {
    document.getElementById('sel-banner').textContent = t('calc.heir.prefix') + selPerson.name;
  }
  renderPeople(PEOPLE.filter(p =>
    p.name.toLowerCase().includes(document.getElementById('psearch').value.toLowerCase())
  ));
};

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPeople(PEOPLE);
});
