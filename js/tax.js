// ── МИРАС · Налоговый калькулятор ────────────────────────────────
// Ставки НК РК 2026

const MRP = 4325; // МРП 2026

// ── TAB SWITCHER ─────────────────────────────────────────────────
function switchTaxTab(tab) {
  ['transport', 'property', 'land'].forEach(id => {
    document.getElementById('tpanel-' + id).style.display = id === tab ? 'block' : 'none';
    document.getElementById('ttab-' + id).classList.toggle('active', id === tab);
  });
}

// ─────────────────────────────────────────────────────────────────
// TRANSPORT TAX  (ст. 492 НК РК)
// ─────────────────────────────────────────────────────────────────
function trTypeChange() {
  const type = document.getElementById('tr-type').value;
  const car  = ['car_le3','car_gt3_new','car_gt3_old'].includes(type);
  document.getElementById('tr-engine-wrap').style.display  = car            ? 'flex' : 'none';
  document.getElementById('tr-moto-wrap').style.display    = type === 'moto'  ? 'flex' : 'none';
  document.getElementById('tr-truck-wrap').style.display   = type === 'truck' ? 'flex' : 'none';
  document.getElementById('tr-bus-wrap').style.display     = type === 'bus'   ? 'flex' : 'none';
  calcTransport();
}

function calcTransport() {
  const type   = document.getElementById('tr-type').value;
  const months = parseInt(document.getElementById('tr-months').value) || 12;
  const yearEl = document.getElementById('tr-year').value;
  const year   = yearEl ? parseInt(yearEl) : null;
  let base = 0, breakdown = [];

  if (type === 'car_le3') {
    const eng = parseInt(document.getElementById('tr-engine').value);
    if (!eng || eng <= 0) return showTrPlaceholder();
    if (eng > 3000) { showTrError('Для ≤ 3 000 см³. Выберите другой тип.'); return; }
    const r = carLe3Rate(eng); base = r.tax; breakdown = r.breakdown;
  } else if (type === 'car_gt3_new') {
    const eng = parseInt(document.getElementById('tr-engine').value);
    if (!eng || eng <= 3000) return showTrPlaceholder();
    const r = carGt3NewRate(eng); base = r.tax; breakdown = r.breakdown;
  } else if (type === 'car_gt3_old') {
    const eng = parseInt(document.getElementById('tr-engine').value);
    if (!eng || eng <= 3000) return showTrPlaceholder();
    const r = carGt3OldRate(eng); base = r.tax; breakdown = r.breakdown;
  } else if (type === 'moto') {
    const power = document.getElementById('tr-moto-power').value;
    base = power === 'low' ? MRP * 1 : MRP * 10;
    breakdown = [{ label: 'Базовая ставка', value: base }];
  } else if (type === 'truck') {
    const cap = document.getElementById('tr-truck-cap').value;
    const rates = { '1.5': 3, '5': 5, '10': 7, 'max': 9 };
    base = MRP * rates[cap];
    breakdown = [{ label: 'Базовая ставка', value: base }];
  } else if (type === 'bus') {
    const seats = document.getElementById('tr-bus-seats').value;
    const rates = { '12': 9, '25': 14, 'max': 20 };
    base = MRP * rates[seats];
    breakdown = [{ label: 'Базовая ставка', value: base }];
  }

  let ageCf = 1, ageNote = '';
  if (year) {
    const age = 2026 - year;
    if (age >= 20) { ageCf = 0.5; ageNote = `Возраст ТС ${age} лет → коэфф. 0,5`; }
    else if (age >= 10) { ageCf = 0.7; ageNote = `Возраст ТС ${age} лет → коэфф. 0,7`; }
  }
  let tax = base * ageCf * (months / 12);

  const brows = breakdown.map(r => `<div class="tax-breakdown-row"><span>${r.label}</span><span>${fmtF(r.value)}</span></div>`).join('');
  let extra = '';
  if (ageCf !== 1) extra += `<div class="tax-breakdown-row"><span>${ageNote}</span><span>× ${ageCf}</span></div>`;
  if (months !== 12) extra += `<div class="tax-breakdown-row"><span>Месяцев: ${months}</span><span>× ${(months/12).toFixed(4)}</span></div>`;
  extra += `<div class="tax-breakdown-row"><span><strong>Итого</strong></span><span><strong>${fmtF(tax)}</strong></span></div>`;

  document.getElementById('tr-result').innerHTML = `
    <div class="tax-result-filled">
      <div class="tax-result-amount">
        <div class="label">ТРАНСПОРТНЫЙ НАЛОГ 2026</div>
        <div class="amount">${fmtF(tax)}</div>
        <div class="per-month">≈ ${fmtF(tax / 12)} в месяц</div>
      </div>
      <div class="tax-breakdown">${brows}${extra}</div>
      <div class="tax-note">Срок уплаты — до 1 апреля. Ст. 492 НК РК · МРП = ${fmtF(MRP)}</div>
    </div>`;
}

function carLe3Rate(eng) {
  let tax = 0, breakdown = [];
  if (eng <= 1100)      { tax = MRP*1;  breakdown = [{label:`${eng} см³ → 1 МРП`,value:tax}]; }
  else if (eng <= 1500) { const b=MRP*2,e=(eng-1100)*7; tax=b+e; breakdown=[{label:'2 МРП',value:b},{label:`+7₸×${eng-1100}см³`,value:e}]; }
  else if (eng <= 2000) { const b=MRP*3,e=(eng-1500)*7; tax=b+e; breakdown=[{label:'3 МРП',value:b},{label:`+7₸×${eng-1500}см³`,value:e}]; }
  else if (eng <= 2500) { const b=MRP*6,e=(eng-2000)*7; tax=b+e; breakdown=[{label:'6 МРП',value:b},{label:`+7₸×${eng-2000}см³`,value:e}]; }
  else                  { const b=MRP*9,e=(eng-2500)*7; tax=b+e; breakdown=[{label:'9 МРП',value:b},{label:`+7₸×${eng-2500}см³`,value:e}]; }
  return { tax, breakdown };
}
function carGt3NewRate(eng) {
  let tax=0,breakdown=[];
  if(eng<=3200)      {const b=MRP*35,e=(eng-3000)*7;tax=b+e;breakdown=[{label:'35 МРП',value:b},{label:`+7₸×${eng-3000}см³`,value:e}];}
  else if(eng<=3500) {const b=MRP*46,e=(eng-3200)*7;tax=b+e;breakdown=[{label:'46 МРП',value:b},{label:`+7₸×${eng-3200}см³`,value:e}];}
  else if(eng<=4000) {const b=MRP*66,e=(eng-3500)*7;tax=b+e;breakdown=[{label:'66 МРП',value:b},{label:`+7₸×${eng-3500}см³`,value:e}];}
  else if(eng<=5000) {const b=MRP*130,e=(eng-4000)*7;tax=b+e;breakdown=[{label:'130 МРП',value:b},{label:`+7₸×${eng-4000}см³`,value:e}];}
  else               {const b=MRP*200,e=(eng-5000)*7;tax=b+e;breakdown=[{label:'200 МРП',value:b},{label:`+7₸×${eng-5000}см³`,value:e}];}
  return {tax,breakdown};
}
function carGt3OldRate(eng) {
  let tax=0,breakdown=[];
  if(eng<=4000) {const b=MRP*15,e=(eng-3000)*7;tax=b+e;breakdown=[{label:'15 МРП',value:b},{label:`+7₸×${eng-3000}см³`,value:e}];}
  else          {const b=MRP*117,e=(eng-4000)*7;tax=b+e;breakdown=[{label:'117 МРП',value:b},{label:`+7₸×${eng-4000}см³`,value:e}];}
  return {tax,breakdown};
}
function showTrPlaceholder() {
  document.getElementById('tr-result').innerHTML = `<div class="tax-result-placeholder"><div style="font-size:2rem">🚗</div><div>Заполните форму</div></div>`;
}
function showTrError(msg) {
  document.getElementById('tr-result').innerHTML = `<div class="tax-result-placeholder" style="color:#c0392b"><div style="font-size:2rem">⚠️</div><div>${msg}</div></div>`;
}

// ─────────────────────────────────────────────────────────────────
// PROPERTY TAX  (ст. 531–535 НК РК)
// Полные ставки по площади + тип + льготная площадь
// ─────────────────────────────────────────────────────────────────

// Ставки за м² по городу
const PR_AREA_RATES = {
  astana:   240,
  almaty:   240,
  shymkent: 180,
  regional: 140,
  district:  90,
  rural:     55
};

// Коэффициенты по типу недвижимости
const PR_TYPE_MULTIPLIERS = {
  apartment: 1.0,
  house:     1.3,
  dacha:     0.75,
  garage:    0.55
};

// Льготная необлагаемая площадь (м²)
const PR_BENEFIT_AREA = {
  astana:   65,
  almaty:   65,
  shymkent: 70,
  regional: 80,
  district: 100,
  rural:    150
};

const PR_CITY_LABELS = {
  astana:   'Астана — 240 ₸/м²',
  almaty:   'Алматы — 240 ₸/м²',
  shymkent: 'Шымкент — 180 ₸/м²',
  regional: 'Областной центр — 140 ₸/м²',
  district: 'Районный центр — 90 ₸/м²',
  rural:    'Сельская местность — 55 ₸/м²'
};

function prMethodChange() {
  const method = document.getElementById('pr-method').value;
  document.getElementById('pr-value-wrap').style.display    = method === 'value' ? 'flex' : 'none';
  document.getElementById('pr-area-wrap').style.display     = method === 'area'  ? 'flex' : 'none';
  document.getElementById('pr-type-wrap').style.display     = method === 'area'  ? 'flex' : 'none';
  document.getElementById('pr-city-wrap').style.display     = method === 'area'  ? 'flex' : 'none';
  calcProperty();
}

function calcProperty() {
  const method  = document.getElementById('pr-method').value;
  const benefit = document.getElementById('pr-benefit').checked;

  // ── By value (progressive scale) ──
  if (method === 'value') {
    const val = parseFloat(document.getElementById('pr-value').value);
    if (!val || val <= 0) { showPrPlaceholder(); return; }

    if (benefit) {
      document.getElementById('pr-result').innerHTML = buildPrResult(0,
        [{ label:'Оценочная стоимость', value:val },
         { label:'Льгота — полное освобождение', value:0 },
         { label:'Итого к уплате', value:0 }],
        'Льготная категория — полное освобождение от налога на один объект.');
      return;
    }

    let tax = 0, breakdown = [{ label:`Оценочная стоимость`, value:val }];

    if (val <= 52_000_000) {
      tax = 0;
      breakdown.push({ label:'До 52 млн ₸ — освобождён', value:0 });
    } else if (val <= 104_000_000) {
      const excess = val - 52_000_000;
      tax = excess * 0.0005;
      breakdown.push({ label:'Превышение 52 млн ₸', value:excess });
      breakdown.push({ label:'× 0,05%', value:tax });
    } else if (val <= 156_000_000) {
      const excess = val - 104_000_000;
      tax = 26_000 + excess * 0.0007;
      breakdown.push({ label:'База до 104 млн (26 000 ₸)', value:26_000 });
      breakdown.push({ label:`Превышение 104 млн × 0,07%`, value:excess * 0.0007 });
    } else {
      const excess = val - 156_000_000;
      tax = 62_400 + excess * 0.001;
      breakdown.push({ label:'База до 156 млн (62 400 ₸)', value:62_400 });
      breakdown.push({ label:`Превышение 156 млн × 0,1%`, value:excess * 0.001 });
    }
    breakdown.push({ label:'Итого к уплате', value:tax });
    document.getElementById('pr-result').innerHTML = buildPrResult(tax, breakdown, 'Ст. 531–535 НК РК · Срок уплаты — до 1 октября.');

  // ── By area ──
  } else {
    const area     = parseFloat(document.getElementById('pr-area').value);
    const cityKey  = document.getElementById('pr-city').value;
    const typeKey  = document.getElementById('pr-type').value;
    if (!area || area <= 0) { showPrPlaceholder(); return; }

    const baseRate   = PR_AREA_RATES[cityKey]   || 55;
    const multiplier = PR_TYPE_MULTIPLIERS[typeKey] || 1.0;
    const benefitM2  = benefit ? (PR_BENEFIT_AREA[cityKey] || 65) : 0;
    const taxableArea = Math.max(0, area - benefitM2);
    const tax = taxableArea * baseRate * multiplier;

    const typeName = { apartment:'Квартира', house:'Жилой дом', dacha:'Дача', garage:'Гараж' }[typeKey] || typeKey;
    const breakdown = [
      { label:`Общая площадь: ${area} м²`, value:null },
      { label:`Базовая ставка: ${baseRate} ₸/м²`, value:null },
      { label:`Тип объекта: ${typeName} (× ${multiplier})`, value:null },
      ...(benefit ? [{ label:`Льготная площадь: ${benefitM2} м² (не облагается)`, value:null }] : []),
      { label:`Налогооблагаемая площадь: ${taxableArea.toFixed(1)} м²`, value:null },
      { label:'Итого к уплате', value:tax }
    ];
    const note = benefit
      ? `Льгота применена: вычтено ${benefitM2} м². Ст. 531–535 НК РК.`
      : 'Ст. 531–535 НК РК · Срок уплаты — до 1 октября.';
    document.getElementById('pr-result').innerHTML = buildPrResult(tax, breakdown, note);
  }
}

function buildPrResult(tax, breakdown, note) {
  const rows = breakdown.map((r, i) => {
    const isLast = i === breakdown.length - 1;
    const valStr = r.value !== null ? fmtF(r.value) : '';
    return `<div class="tax-breakdown-row"${isLast ? ' style="font-weight:600"' : ''}>
      <span>${r.label}</span><span>${valStr}</span>
    </div>`;
  }).join('');
  return `<div class="tax-result-filled">
    <div class="tax-result-amount">
      <div class="label">НАЛОГ НА ИМУЩЕСТВО 2026</div>
      <div class="amount">${fmtF(tax)}</div>
      ${tax > 0 ? `<div class="per-month">≈ ${fmtF(tax/12)} в месяц</div>` : '<div class="per-month">Налог не начисляется</div>'}
    </div>
    <div class="tax-breakdown">${rows}</div>
    <div class="tax-note">${note}</div>
  </div>`;
}

function showPrPlaceholder() {
  document.getElementById('pr-result').innerHTML = `<div class="tax-result-placeholder"><div style="font-size:2rem">🏠</div><div>Заполните форму</div></div>`;
}

// ─────────────────────────────────────────────────────────────────
// LAND TAX  (ст. 505–514 НК РК)
// Полные ставки по 17 регионам, все категории, назначения
// ─────────────────────────────────────────────────────────────────

// Ставки земель населённых пунктов (₸/сотка)
const LA_SETTLEMENT_RATES = {
  astana:    700,
  almaty:    700,
  shymkent:  480,
  akmola:    290,
  aktobe:    290,
  almaty_r:  350,
  atyrau:    350,
  vko:       290,
  zhambyl:   290,
  zko:       260,
  karaganda: 320,
  kostanay:  290,
  kyzylorda: 260,
  mangystau: 350,
  pavlodar:  290,
  sko:       260,
  turkestan: 290
};

// Ставки сельхоз земель (₸/га)
const LA_AGRI_RATES = {
  astana:    58,
  almaty:    70,
  shymkent:  52,
  akmola:    46,
  aktobe:    46,
  almaty_r:  52,
  atyrau:    58,
  vko:       46,
  zhambyl:   46,
  zko:       40,
  karaganda: 46,
  kostanay:  46,
  kyzylorda: 40,
  mangystau: 52,
  pavlodar:  46,
  sko:       40,
  turkestan: 46
};

// Ставки промышленных земель (₸/га)
const LA_INDUSTRIAL_RATES = {
  astana:    480,
  almaty:    480,
  shymkent:  360,
  akmola:    240,
  aktobe:    240,
  almaty_r:  300,
  atyrau:    300,
  vko:       240,
  zhambyl:   240,
  zko:       200,
  karaganda: 260,
  kostanay:  240,
  kyzylorda: 200,
  mangystau: 280,
  pavlodar:  240,
  sko:       200,
  turkestan: 240
};

// Коэффициенты целевого назначения
const LA_AGRI_PURPOSE_CF = {
  arable:    1.0,   // пашни
  perennial: 1.2,   // многолетние насаждения
  hayfield:  0.55,  // сенокосы
  pasture:   0.35,  // пастбища
  fallow:    0.25   // залежи
};
const LA_SETTLE_PURPOSE_CF = {
  residential: 1.0,  // жилая
  commercial:  1.6,  // коммерческая
  garden:      0.45, // садоводство
  personal:    0.35, // личное хозяйство
  recreation:  0.8   // рекреация
};
const LA_INDUSTRIAL_PURPOSE_CF = {
  industry:      1.0,
  transport:     0.75,
  communication: 0.55,
  energy:        0.85,
  defense:       0.5
};

// Города — льготный лимит 0.25 га (25 соток)
const LA_MAJOR_CITIES = new Set(['astana','almaty','shymkent']);

// Фиксированные ставки для прочих категорий (₸/га)
const LA_OTHER_RATES = { forest:24, water:18, reserve:12 };

function laCategoryChange() {
  const cat = document.getElementById('la-category').value;
  const showEl = (id, show) => { document.getElementById(id).style.display = show ? 'flex' : 'none'; };
  showEl('la-region-wrap',      cat !== 'forest' && cat !== 'water' && cat !== 'reserve');
  showEl('la-settle-purpose-wrap',   cat === 'settlement');
  showEl('la-agri-purpose-wrap',     cat === 'agri');
  showEl('la-industrial-purpose-wrap', cat === 'industrial');
  calcLand();
}

function calcLand() {
  const cat     = document.getElementById('la-category').value;
  const areaRaw = parseFloat(document.getElementById('la-area').value);
  const unit    = document.getElementById('la-unit').value;
  const benefit = document.getElementById('la-benefit').checked;
  if (!areaRaw || areaRaw <= 0) { showLaPlaceholder(); return; }

  // Normalize to sotki and ga
  let areaSotki, areaGa;
  if      (unit === 'sotki') { areaSotki = areaRaw;         areaGa = areaRaw / 100; }
  else if (unit === 'ga')    { areaSotki = areaRaw * 100;   areaGa = areaRaw; }
  else                       { areaSotki = areaRaw / 100;   areaGa = areaRaw / 10000; }

  const region = document.getElementById('la-region').value;
  let tax = 0, breakdown = [];

  if (cat === 'settlement') {
    const baseRate  = LA_SETTLEMENT_RATES[region] || 260;
    const purposeKey= document.getElementById('la-settle-purpose').value;
    const cf        = LA_SETTLE_PURPOSE_CF[purposeKey] || 1.0;
    const rate      = baseRate * cf;

    const isMajor   = LA_MAJOR_CITIES.has(region);
    const limitSotki= benefit ? (isMajor ? 25 : 100) : 0;
    const taxable   = Math.max(0, areaSotki - limitSotki);
    tax = taxable * rate;

    const purposeNames = { residential:'Жилая',commercial:'Коммерческая',garden:'Садоводство',personal:'Личное хозяйство',recreation:'Рекреация' };
    breakdown = [
      { label:`Площадь: ${areaSotki.toFixed(2)} сот.` },
      { label:`Базовая ставка региона: ${baseRate} ₸/сот.` },
      { label:`Назначение: ${purposeNames[purposeKey]||purposeKey} (× ${cf})` },
      { label:`Ставка с коэфф.: ${rate.toFixed(2)} ₸/сот.` },
      ...(benefit ? [{ label:`Льгота: −${limitSotki} сот. (до ${(limitSotki/100).toFixed(2)} га)` }] : []),
      { label:`Налогооблагаемая площадь: ${taxable.toFixed(2)} сот.`, final: true }
    ];

  } else if (cat === 'agri') {
    const baseRate  = LA_AGRI_RATES[region] || 40;
    const purposeKey= document.getElementById('la-agri-purpose').value;
    const cf        = LA_AGRI_PURPOSE_CF[purposeKey] || 1.0;
    const rate      = baseRate * cf;

    const limitGa   = benefit ? 1 : 0;
    const taxable   = Math.max(0, areaGa - limitGa);
    tax = taxable * rate;

    const purposeNames = { arable:'Пашни',perennial:'Многолетние насаждения',hayfield:'Сенокосы',pasture:'Пастбища',fallow:'Залежи' };
    breakdown = [
      { label:`Площадь: ${areaGa.toFixed(4)} га` },
      { label:`Базовая ставка: ${baseRate} ₸/га` },
      { label:`Назначение: ${purposeNames[purposeKey]||purposeKey} (× ${cf})` },
      { label:`Ставка с коэфф.: ${rate.toFixed(2)} ₸/га` },
      ...(benefit ? [{ label:`Льгота: −${limitGa} га` }] : []),
      { label:`Налогооблагаемая площадь: ${taxable.toFixed(4)} га`, final:true }
    ];

  } else if (cat === 'industrial') {
    const baseRate  = LA_INDUSTRIAL_RATES[region] || 200;
    const purposeKey= document.getElementById('la-industrial-purpose').value;
    const cf        = LA_INDUSTRIAL_PURPOSE_CF[purposeKey] || 1.0;
    const rate      = baseRate * cf;
    tax = areaGa * rate;

    const purposeNames = { industry:'Промышленность',transport:'Транспорт',communication:'Связь',energy:'Энергетика',defense:'Оборона' };
    breakdown = [
      { label:`Площадь: ${areaGa.toFixed(4)} га` },
      { label:`Базовая ставка: ${baseRate} ₸/га` },
      { label:`Назначение: ${purposeNames[purposeKey]||purposeKey} (× ${cf})` },
      { label:`Ставка с коэфф.: ${rate.toFixed(2)} ₸/га`, final:true }
    ];

  } else {
    // forest / water / reserve
    const rate = LA_OTHER_RATES[cat] || 12;
    tax = areaGa * rate;
    const catNames = { forest:'Лесной фонд', water:'Водный фонд', reserve:'Земли запаса' };
    breakdown = [
      { label:`Площадь: ${areaGa.toFixed(4)} га` },
      { label:`Ставка: ${rate} ₸/га (${catNames[cat]})`, final:true }
    ];
  }

  const rows = [...breakdown, { label:'Итого к уплате ₸', final:true, tax:true }].map((r, i, arr) => {
    const isTotal = r.tax;
    return `<div class="tax-breakdown-row"${(r.final || isTotal) ? ' style="font-weight:600"' : ''}>
      <span>${r.label || 'Итого'}</span>
      <span>${isTotal ? fmtF(tax) : (r.value !== undefined ? fmtF(r.value) : '')}</span>
    </div>`;
  });

  // Remove last duplicate — the final row with no value is followed by the tax row
  const cleanRows = breakdown.map(r =>
    `<div class="tax-breakdown-row"${r.final ? ' style="font-weight:500"' : ''}>
      <span>${r.label}</span>
      <span>${r.value !== undefined ? fmtF(r.value) : ''}</span>
    </div>`
  ).join('') +
  `<div class="tax-breakdown-row" style="font-weight:700"><span>Итого к уплате</span><span>${fmtF(tax)}</span></div>`;

  document.getElementById('la-result').innerHTML = `
    <div class="tax-result-filled">
      <div class="tax-result-amount">
        <div class="label">ЗЕМЕЛЬНЫЙ НАЛОГ 2026</div>
        <div class="amount">${fmtF(tax)}</div>
        ${tax > 0 ? `<div class="per-month">≈ ${fmtF(tax/12)} в месяц</div>` : '<div class="per-month">Налог не начисляется</div>'}
      </div>
      <div class="tax-breakdown">${cleanRows}</div>
      <div class="tax-note">Ст. 505–514 НК РК · Срок уплаты — до 1 октября.<br>Расчёт ориентировочный — уточняйте ставки в местном акимате.</div>
    </div>`;
}

function showLaPlaceholder() {
  document.getElementById('la-result').innerHTML = `<div class="tax-result-placeholder"><div style="font-size:2rem">🌿</div><div>Заполните форму</div></div>`;
}
