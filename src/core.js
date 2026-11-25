(function(){
/* ================== narzędzia ================== */
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const nf = (x, d=0) => x.toLocaleString('pl-PL', {minimumFractionDigits:d, maximumFractionDigits:d});
const nv = (x, d=4) => x.toLocaleString('pl-PL', {maximumFractionDigits:d});
const si = (x, unit) => {
  const a = Math.abs(x); if (a < 1e-12) return '0 ' + unit;
  for (const [f, p] of [[1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ']]) if (a >= f*0.99995) { const v = x/f, av = Math.abs(v); return nv(v, av >= 100 ? 0 : av >= 10 ? 1 : 2) + ' ' + p + unit; }
  return nv(x/1e-6, 3) + ' µ' + unit;
};
const svgPoint = (svg, evt) => { const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
function arrow(parent, x1, y1, x2, y2, color){
  el('line', {x1, y1, x2, y2, class:'arrow', style:color ? `stroke:${color}` : ''}, parent);
  const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
  el('path', {d:`M${x2} ${y2} L${x2 - s*Math.cos(a - 0.5)} ${y2 - s*Math.sin(a - 0.5)} L${x2 - s*Math.cos(a + 0.5)} ${y2 - s*Math.sin(a + 0.5)}Z`, class:'arrowhead', style:color ? `fill:${color}` : ''}, parent);
}
function chipGroup(container, onPick){
  container.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b || !container.contains(b)) return;
    container.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b ? 'true' : 'false'));
    onPick(b, e);
  });
}
const sims = {};
const S = {};
let onSlideChange = null;
let playing = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const CC = {};
function refreshColors(){ const cs = getComputedStyle(document.documentElement); ['--pri','--pri-soft','--ink','--muted','--line','--glass','--acc','--surface','--bg','--cu','--el','--ion','--glow','--good','--bad','--alt'].forEach(n => CC[n] = cs.getPropertyValue(n).trim()); }
refreshColors();
function fitCanvas(c, W, H){
  const w0 = c.clientWidth; if (!w0) return null;
  const dpr = window.devicePixelRatio || 1, w = Math.round(w0*dpr);
  if (c.width !== w) { c.width = w; c.height = Math.round(w*H/W); }
  const ctx = c.getContext('2d'); ctx.setTransform(c.width/W, 0, 0, c.width/W, 0, 0); return ctx;
}
function holdButton(b, set){
  const on = e => { e.preventDefault(); set(true); b.classList.add('held'); }, off = () => { set(false); b.classList.remove('held'); };
  b.addEventListener('pointerdown', on);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, off));
  b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) on(e); });
  b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') off(); });
  b.addEventListener('contextmenu', e => e.preventDefault());
}
/* ścieżka do przesuwania elektronów */
function Poly(pts){
  const seg = []; let L = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], l = Math.hypot(x2 - x1, y2 - y1); seg.push([x1, y1, x2, y2, L, l]); L += l; }
  return {L, at(t){ let d = ((t % 1) + 1) % 1*L; for (const s of seg) if (d <= s[4] + s[5]) { const f = s[5] ? (d - s[4])/s[5] : 0; return [s[0] + (s[2] - s[0])*f, s[1] + (s[3] - s[1])*f]; } const s = seg[seg.length - 1]; return [s[2], s[3]]; }};
}
const wire = (g, pts, extra) => el('path', Object.assign({d:'M' + pts.map(p => p.join(' ')).join(' L'), class:'wire'}, extra || {}), g);
function cellV(g, x, y, lab){
  el('rect', {x:x - 18, y:y - 11, width:36, height:22, fill:'var(--surface)'}, g);
  el('line', {x1:x - 16, x2:x + 16, y1:y - 5, y2:y - 5, stroke:'var(--ink)', 'stroke-width':2.5}, g);
  el('line', {x1:x - 8, x2:x + 8, y1:y + 5, y2:y + 5, stroke:'var(--ink)', 'stroke-width':6}, g);
  el('text', {x:x - 22, y:y - 6, 'text-anchor':'end', class:'svgt-b'}, g).textContent = '+';
  if (lab) el('text', {x:x + 22, y:y + 5, class:'svgt-b'}, g).textContent = lab;
}
function cellH(g, x, y, lab){
  el('rect', {x:x - 11, y:y - 18, width:22, height:36, fill:'var(--surface)'}, g);
  el('line', {x1:x - 5, x2:x - 5, y1:y - 16, y2:y + 16, stroke:'var(--ink)', 'stroke-width':2.5}, g);
  el('line', {x1:x + 5, x2:x + 5, y1:y - 8, y2:y + 8, stroke:'var(--ink)', 'stroke-width':6}, g);
  el('text', {x:x - 10, y:y - 20, 'text-anchor':'middle', class:'svgt-b'}, g).textContent = '+';
  if (lab) el('text', {x, y:y + 32, 'text-anchor':'middle', class:'svgt-b'}, g).textContent = lab;
}
function bulb(g, x, y, b, r){
  r = r || 16; b = Math.max(0, Math.min(1.3, b)); const bb = Math.min(1, b);
  if (b > 0.02) el('circle', {cx:x, cy:y, r:r + 4 + 22*bb, fill:'var(--glow)', opacity:(0.12 + 0.4*bb).toFixed(2)}, g);
  el('circle', {cx:x, cy:y, r, fill:b > 0.02 ? 'var(--glow)' : 'var(--surface)', 'fill-opacity':b > 0.02 ? (0.35 + 0.65*bb).toFixed(2) : 1, stroke:'var(--ink)', 'stroke-width':2}, g);
  const k = r*0.7;
  el('path', {d:`M${x - k} ${y - k} L${x + k} ${y + k} M${x + k} ${y - k} L${x - k} ${y + k}`, stroke:'var(--ink)', 'stroke-width':1.6}, g);
}
function socket(g, x, y, r){ el('circle', {cx:x, cy:y, r:r || 16, fill:'var(--surface)', stroke:'var(--muted)', 'stroke-width':1.5, 'stroke-dasharray':'4 3'}, g); }
function meter(g, x, y, letter, val){
  el('circle', {cx:x, cy:y, r:15, class:'comp'}, g);
  el('text', {x, y:y + 5.5, 'text-anchor':'middle', class:'svgt-b', style:'font-size:15px'}, g).textContent = letter;
  if (val != null) el('text', {x, y:y + 33, 'text-anchor':'middle', class:'svgt', style:'fill:var(--pri);font-weight:600'}, g).textContent = val;
}
function resistor(g, x, y, vertical){ if (vertical) el('rect', {x:x - 8, y:y - 24, width:16, height:48, class:'comp'}, g); else el('rect', {x:x - 24, y:y - 8, width:48, height:16, class:'comp'}, g); }
function dots(g, poly, n, phase, cls){ for (let k = 0; k < n; k++) { const [x, y] = poly.at(k/n + phase); el('circle', {cx:x, cy:y, r:3.3, class:cls || 'eldot'}, g); } }
function cArrow(ctx, x1, y1, x2, y2, color){
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 10*Math.cos(a - .5), y2 - 10*Math.sin(a - .5)); ctx.lineTo(x2 - 10*Math.cos(a + .5), y2 - 10*Math.sin(a + .5)); ctx.fill();
}
const mkChips = (box, names, def) => names.forEach((n, i) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = n; b.dataset.i = i; b.setAttribute('aria-pressed', i === def ? 'true' : 'false'); box.appendChild(b); });

/* ================== nawigacja ================== */
const slides = [...document.querySelectorAll('.slide')];
const ids = slides.map(s => s.dataset.id);
let cur = 0;
const dotsBox = $('dots'), toc = $('toc');
slides.forEach((s, i) => {
  const d = document.createElement('button');
  d.setAttribute('aria-label', 'Slajd ' + (i + 1) + ': ' + s.getAttribute('aria-label'));
  d.addEventListener('click', () => go(i));
  dotsBox.appendChild(d);
  if (s.dataset.part) { const ph = document.createElement('li'); ph.className = 'part'; ph.textContent = s.dataset.part; toc.appendChild(ph); }
  if (i > 0) {
    const li = document.createElement('li');
    li.innerHTML = `<button><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${s.getAttribute('aria-label')}</span></button>`;
    li.firstChild.addEventListener('click', () => go(i));
    toc.appendChild(li);
  }
});
function go(i, fromHash){
  i = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, k) => s.hidden = k !== i);
  cur = i;
  $('counter').textContent = (i + 1) + ' / ' + slides.length;
  $('bar').style.width = ((i + 1)/slides.length*100) + '%';
  [...dotsBox.children].forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
  $('prev').disabled = i === 0;
  $('next').disabled = i === slides.length - 1;
  $('main').scrollTop = 0;
  if (onSlideChange) onSlideChange(i);
  if (!fromHash) { try { history.replaceState(null, '', '#' + ids[i]); } catch(e) {} }
}
$('prev').onclick = () => go(cur - 1);
$('next').onclick = () => go(cur + 1);
document.addEventListener('keydown', e => {
  const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(cur + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(cur - 1); e.preventDefault(); }
});
function fromHash(){ const k = ids.indexOf(location.hash.slice(1)); go(k >= 0 ? k : 0, true); }
window.addEventListener('hashchange', fromHash);
fromHash();

/* ================== START: elektrony w drucie ================== */
(function(){
  const W = 420, H = 250, cv = $('cHero'), sU = $('hU'), ions = [], E = [];
  for (let x = 20; x < W; x += 40) for (let y = 95; y <= 175; y += 40) ions.push([x + ((y - 95) % 80 ? 20 : 0), y]);
  const kick = e => { const a = Math.random()*6.283, v = 60 + Math.random()*80; e.vx = Math.cos(a)*v; e.vy = Math.sin(a)*v; };
  for (let i = 0; i < 70; i++) { const e = {x:Math.random()*W, y:80 + Math.random()*110}; kick(e); E.push(e); }
  sims.start = dt => {
    const ctx = fitCanvas(cv, W, H); if (!ctx) return;
    const U = +sU.value, drift = -U*7;
    $('hUo').textContent = nv(U, 1) + ' V';
    S.hero = {U};
    for (const e of E) {
      if (Math.random() < dt*2.5) kick(e);
      e.x += (e.vx + drift)*dt; e.y += e.vy*dt;
      if (e.y < 78) { e.y = 78; e.vy = Math.abs(e.vy); } if (e.y > 192) { e.y = 192; e.vy = -Math.abs(e.vy); }
      if (e.x < 0) e.x += W; if (e.x > W) e.x -= W;
    }
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = CC['--cu']; ctx.globalAlpha = .2; ctx.fillRect(0, 70, W, 130); ctx.globalAlpha = 1;
    ctx.strokeStyle = CC['--cu']; ctx.lineWidth = 2; ctx.strokeRect(-2, 70, W + 4, 130);
    ctx.globalAlpha = .55; ctx.fillStyle = CC['--ion']; ions.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill(); }); ctx.globalAlpha = 1;
    ctx.fillStyle = CC['--surface']; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ions.forEach(([x, y]) => ctx.fillText('+', x, y + 4));
    ctx.fillStyle = CC['--el']; E.forEach(e => { ctx.beginPath(); ctx.arc(e.x, e.y, 3.6, 0, 6.283); ctx.fill(); });
    ctx.font = '600 14px "IBM Plex Sans", sans-serif'; ctx.fillStyle = CC['--ink'];
    if (U > 0) { ctx.textAlign = 'left'; ctx.fillText('+ biegun dodatni', 6, 58); ctx.textAlign = 'right'; ctx.fillText('biegun ujemny −', W - 6, 58); cArrow(ctx, 300, 225, 180, 225, CC['--el']); ctx.font = '12px "IBM Plex Mono", monospace'; ctx.fillStyle = CC['--muted']; ctx.textAlign = 'left'; ctx.fillText('dryf elektronów', 306, 229); }
    ctx.font = '12px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = CC['--el']; ctx.beginPath(); ctx.arc(12, 30, 4, 0, 6.283); ctx.fill();
    ctx.fillStyle = CC['--muted']; ctx.fillText('elektron swobodny', 22, 34);
    ctx.fillStyle = CC['--ion']; ctx.beginPath(); ctx.arc(170, 30, 6, 0, 6.283); ctx.fill();
    ctx.fillStyle = CC['--muted']; ctx.fillText('jon metalu (+)', 182, 34);
  };
})();

/* ================== Co to jest prąd ================== */
(function(){
  const W = 420, H = 260, cv = $('cFlow'), ions = [], E = [], P = [], N = []; let mode = 'metal';
  for (let x = 70; x <= 350; x += 40) for (let y = 55; y <= 175; y += 40) ions.push([x, y]);
  const rnd = (a, b) => a + Math.random()*(b - a);
  const kick = (e, v) => { const a = Math.random()*6.283; e.vx = Math.cos(a)*v; e.vy = Math.sin(a)*v; };
  for (let i = 0; i < 55; i++) { const e = {x:rnd(45, 375), y:rnd(35, 185)}; kick(e, 90); E.push(e); }
  for (let i = 0; i < 16; i++) { const p = {x:rnd(45, 375), y:rnd(35, 185)}; kick(p, 30); P.push(p); const n = {x:rnd(45, 375), y:rnd(35, 185)}; kick(n, 30); N.push(n); }
  chipGroup($('pcMode'), b => { mode = b.dataset.m; S.pcMode = mode; });
  const move = (arr, dt, drift, v) => arr.forEach(e => { if (Math.random() < dt*2.5) kick(e, v); e.x += (e.vx + drift)*dt; e.y += e.vy*dt; if (e.y < 35) { e.y = 35; e.vy = Math.abs(e.vy); } if (e.y > 185) { e.y = 185; e.vy = -Math.abs(e.vy); } if (e.x < 44) e.x = 374; if (e.x > 376) e.x = 46; });
  sims['prad-co'] = dt => {
    const ctx = fitCanvas(cv, W, H); if (!ctx) return;
    const dir = $('pcDir').checked; S.pcDir = dir;
    if (mode === 'metal') move(E, dt, -40, 90); else { move(P, dt, 28, 30); move(N, dt, -28, 30); }
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = mode === 'metal' ? CC['--cu'] : CC['--pri']; ctx.globalAlpha = .15; ctx.fillRect(40, 25, 340, 170); ctx.globalAlpha = 1;
    ctx.fillStyle = CC['--ion']; ctx.fillRect(22, 20, 16, 180); ctx.fillStyle = CC['--el']; ctx.fillRect(382, 20, 16, 180);
    ctx.font = '700 18px "IBM Plex Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = CC['--ink']; ctx.fillText('+', 30, 16); ctx.fillText('−', 390, 16);
    ctx.strokeStyle = CC['--ink']; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(30, 200); ctx.lineTo(30, 238); ctx.lineTo(200, 238); ctx.moveTo(216, 238); ctx.lineTo(390, 238); ctx.lineTo(390, 200); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(200, 222); ctx.lineTo(200, 254); ctx.stroke(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(216, 230); ctx.lineTo(216, 246); ctx.stroke();
    if (mode === 'metal') {
      ctx.globalAlpha = .5; ctx.fillStyle = CC['--ion']; ions.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill(); }); ctx.globalAlpha = 1;
      ctx.fillStyle = CC['--el']; E.forEach(e => { ctx.beginPath(); ctx.arc(e.x, e.y, 3.5, 0, 6.283); ctx.fill(); });
    } else {
      ctx.font = '700 11px sans-serif';
      [[P, '--ion', '+'], [N, '--el', '−']].forEach(([arr, c, s]) => arr.forEach(e => { ctx.fillStyle = CC[c]; ctx.beginPath(); ctx.arc(e.x, e.y, 7, 0, 6.283); ctx.fill(); ctx.fillStyle = CC['--surface']; ctx.fillText(s, e.x, e.y + 4); }));
    }
    ctx.font = '12px "IBM Plex Mono", monospace'; ctx.fillStyle = CC['--muted']; ctx.textAlign = 'left';
    ctx.fillText(mode === 'metal' ? 'metal: płyną elektrony w stronę +' : 'roztwór: jony + płyną do −, jony − do +', 48, 41 + 150);
    if (dir) { cArrow(ctx, 110, 212, 310, 212, CC['--acc']); ctx.fillStyle = CC['--acc']; ctx.textAlign = 'center'; ctx.font = '600 12px "IBM Plex Sans", sans-serif'; ctx.fillText('kierunek umowny prądu: od + do −', 210, 228); }
  };
})();

/* ================== Przewodniki i izolatory ================== */
(function(){
  const M = [['Miedź', 1, '--cu'], ['Aluminium', 0.97, '--glass'], ['Grafit (ołówek)', 0.6, '--ink'], ['Woda z solą', 0.35, '--pri'], ['Woda z kranu', 0.06, '--pri'], ['Woda destylowana', 0, '--pri'], ['Plastik', 0, '--alt'], ['Guma', 0, '--ink'], ['Szkło', 0, '--line'], ['Suche drewno', 0, '--acc']];
  let m = M[0], ph = 0; const box = $('tsMat'), G = $('tsG');
  mkChips(box, M.map(x => x[0]), 0);
  S.tsUser = new Set();
  chipGroup(box, (b, e) => { m = M[+b.dataset.i]; if (e.isTrusted) S.tsUser.add(m[0]); });
  S.tsPick = i => { [...box.children].forEach((c, k) => c.setAttribute('aria-pressed', k === i ? 'true' : 'false')); m = M[i]; };
  const poly = Poly([[60, 150], [60, 60], [360, 60], [360, 240], [60, 240], [60, 150]]);
  sims.przewodniki = dt => {
    const b = m[1]; ph -= dt*b*0.22;
    G.innerHTML = '';
    wire(G, [[60, 139], [60, 60], [244, 60]]); wire(G, [[316, 60], [360, 60], [360, 240], [60, 240], [60, 161]]);
    cellV(G, 60, 150, '4,5 V');
    bulb(G, 150, 60, b);
    el('rect', {x:244, y:47, width:72, height:26, rx:4, fill:`var(${m[2]})`, opacity:m[0].startsWith('Woda') ? 0.45 : 0.85, stroke:'var(--ink)'}, G);
    [236, 316].forEach(x => el('rect', {x, y:44, width:8, height:32, rx:2, fill:'var(--glass)'}, G));
    el('text', {x:280, y:98, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = m[0];
    el('text', {x:280, y:30, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'badany materiał';
    if (b > 0) dots(G, poly, 20, ph);
    $('tsR').textContent = b >= 0.3 ? 'dobry przewodnik' : b > 0 ? 'słaby przewodnik' : 'izolator';
    $('tsB').textContent = b >= 0.9 ? 'świeci jasno' : b >= 0.3 ? 'świeci słabiej' : b > 0 ? 'ledwo się żarzy' : 'nie świeci';
  };
})();

/* ================== Obwód ================== */
(function(){
  let closed = false, cut = false, bulbIn = true, ph = 0;
  const G = $('obG'), sw = $('obSw'), ct = $('obCut'), bb = $('obBulb');
  const upd = () => { sw.textContent = closed ? 'Wyłącz' : 'Włącz'; ct.textContent = cut ? 'Napraw przewód' : 'Przetnij przewód'; bb.textContent = bulbIn ? 'Wykręć żarówkę' : 'Wkręć żarówkę'; };
  sw.onclick = () => { closed = !closed; upd(); }; ct.onclick = () => { cut = !cut; upd(); }; bb.onclick = () => { bulbIn = !bulbIn; upd(); };
  S.obSet = (c, k, b) => { closed = c; cut = k; bulbIn = b; upd(); };
  upd();
  const poly = Poly([[70, 160], [70, 60], [350, 60], [350, 260], [70, 260], [70, 160]]);
  sims.obwod = dt => {
    const on = closed && !cut && bulbIn; if (on) ph -= dt*0.12;
    S.ob = {on, closed, cut};
    G.innerHTML = '';
    wire(G, [[70, 149], [70, 60], [180, 60]]); wire(G, [[240, 60], [350, 60], [350, 144]]);
    if (cut) { wire(G, [[350, 176], [350, 260], [228, 260]]); wire(G, [[192, 260], [70, 260], [70, 171]]); el('text', {x:210, y:284, 'text-anchor':'middle', class:'svgt', style:'fill:var(--bad)'}, G).textContent = 'przerwa'; }
    else wire(G, [[350, 176], [350, 260], [70, 260], [70, 171]]);
    cellV(G, 70, 160, '4,5 V');
    const sg = el('g', {class:'clk'}, G); sg.addEventListener('click', () => sw.click());
    el('rect', {x:170, y:20, width:80, height:55, fill:'transparent'}, sg);
    el('circle', {cx:180, cy:60, r:4, fill:'var(--ink)'}, sg); el('circle', {cx:240, cy:60, r:4, fill:'var(--ink)'}, sg);
    el('line', {x1:180, y1:60, x2:closed ? 240 : 230, y2:closed ? 60 : 28, stroke:'var(--ink)', 'stroke-width':3, 'stroke-linecap':'round'}, sg);
    el('text', {x:210, y:92, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'wyłącznik';
    const bg = el('g', {class:'clk'}, G); bg.addEventListener('click', () => bb.click());
    if (bulbIn) bulb(bg, 350, 160, on ? 1 : 0); else socket(bg, 350, 160);
    el('text', {x:326, y:165, 'text-anchor':'end', class:'svgt'}, G).textContent = 'żarówka';
    if (on) dots(G, poly, 22, ph);
    if (on && $('obDir').checked) { arrow(G, 110, 44, 160, 44); arrow(G, 370, 90, 370, 130); arrow(G, 300, 278, 250, 278); arrow(G, 50, 235, 50, 195); el('text', {x:135, y:36, 'text-anchor':'middle', class:'svgt', style:'fill:var(--acc)'}, G).textContent = 'kierunek umowny'; }
    $('obS').textContent = on ? 'zamknięty: płynie prąd, żarówka świeci' : !closed ? 'otwarty: wyłącznik wyłączony' : cut ? 'otwarty: przerwany przewód' : 'otwarty: brak żarówki';
  };
})();

/* ================== Natężenie: liczymy ładunek ================== */
(function(){
  const W = 420, H = 200, cv = $('cI'), sI = $('niI'), SP = 30; let off = 0, t = 0, q = 0;
  $('niReset').onclick = () => { t = 0; q = 0; };
  S.niReset = () => { t = 0; q = 0; };
  sI.addEventListener('input', () => { t = 0; q = 0; });
  sims.natezenie = dt => {
    const ctx = fitCanvas(cv, W, H); if (!ctx) return;
    const I = +sI.value, v = 2*I*SP, prev = off; off += v*dt;
    q += (Math.floor(off/SP) - Math.floor(prev/SP))*0.5; t += dt;
    S.ni = {I, t};
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = CC['--cu']; ctx.globalAlpha = .2; ctx.fillRect(0, 70, W, 60); ctx.globalAlpha = 1;
    ctx.strokeStyle = CC['--cu']; ctx.lineWidth = 2; ctx.strokeRect(-2, 70, W + 4, 60);
    const Wn = SP*Math.ceil((W + SP)/SP);
    ctx.fillStyle = CC['--acc'];
    for (let k = 0; k*SP < Wn; k++) { const x = (((k*SP - off + 210) % Wn) + Wn) % Wn - SP/2; ctx.beginPath(); ctx.arc(x, 100, 8, 0, 6.283); ctx.fill(); }
    ctx.strokeStyle = CC['--pri']; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.ellipse(210, 100, 9, 40, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '600 12px "IBM Plex Sans", sans-serif'; ctx.fillStyle = CC['--pri']; ctx.textAlign = 'center'; ctx.fillText('przekrój przewodu', 210, 52);
    ctx.font = '12px "IBM Plex Mono", monospace'; ctx.fillStyle = CC['--muted'];
    ctx.textAlign = 'left'; ctx.fillStyle = CC['--acc']; ctx.beginPath(); ctx.arc(14, 166, 7, 0, 6.283); ctx.fill(); ctx.fillStyle = CC['--muted']; ctx.fillText('= 0,5 C ładunku', 26, 170);
    ctx.textAlign = 'right'; ctx.fillText('przepłynęło: ' + nv(q, 1) + ' C', W - 8, 170);
    $('niIo').textContent = nv(I, 1) + ' A';
    $('niT').textContent = nf(t, 1) + ' s';
    $('niQ').textContent = nv(q, 1) + ' C';
    $('niR').textContent = t > 0.4 ? nf(q/t, 2) + ' A' : '…';
  };
})();

/* ================== Amperomierz ================== */
(function(){
  let pos = 's', on = false, blown = false, tShort = 0, ph = 0;
  const G = $('amG'), swb = $('amSw');
  const upd = () => { swb.textContent = on ? 'Otwórz obwód' : 'Zamknij obwód'; };
  chipGroup($('amPos'), b => { pos = b.dataset.p; tShort = 0; });
  swb.onclick = () => { on = !on; tShort = 0; upd(); };
  $('amFix').onclick = () => { blown = false; tShort = 0; };
  S.amSet = (p, o) => { pos = p; on = o; tShort = 0; upd(); [...$('amPos').children].forEach(c => c.setAttribute('aria-pressed', c.dataset.p === p ? 'true' : 'false')); };
  S.amFix = () => { blown = false; tShort = 0; };
  const polyS = Poly([[70, 160], [70, 60], [350, 60], [350, 260], [70, 260], [70, 160]]);
  const polyR = Poly([[70, 160], [70, 60], [350, 60], [350, 110], [280, 110], [280, 210], [350, 210], [350, 260], [70, 260], [70, 160]]);
  sims.amperomierz = dt => {
    let Ia = 0, b = 0, status, short = false;
    if (pos === 's') {
      if (on && !blown) { Ia = 0.3; b = 1; }
      status = !on ? 'obwód otwarty, prąd nie płynie' : blown ? 'bezpiecznik miernika jest przepalony' : 'dobrze: cały prąd płynie przez amperomierz';
    } else {
      if (on && !blown) { tShort += dt; Ia = 90; short = true; if (tShort > 0.9) blown = true; }
      if (on && blown) b = 1;
      status = !on ? 'obwód otwarty' : blown ? 'w mierniku przepalił się bezpiecznik. Żarówka świeci, ale miernik nic nie mierzy' : 'ZWARCIE! prawie cały prąd płynie przez amperomierz, a nie przez żarówkę';
    }
    S.am = {blown, pos};
    if (on && (b > 0 || short)) ph -= dt*(short ? 1.1 : 0.12);
    G.innerHTML = '';
    const sx = 210;
    if (pos === 's') { wire(G, [[70, 149], [70, 60], [sx - 15, 60]]); wire(G, [[sx + 15, 60], [350, 60], [350, 144]]); }
    else { wire(G, [[70, 149], [70, 60], [350, 60], [350, 144]]); wire(G, [[350, 110], [280, 110], [280, 145]]); wire(G, [[280, 175], [280, 210], [350, 210]]); }
    wire(G, [[350, 176], [350, 260], [70, 260], [70, 171]]);
    cellV(G, 70, 160, '4,5 V');
    bulb(G, 350, 160, b);
    const reading = blown ? '—' : si(Ia, 'A');
    if (pos === 's') meter(G, sx, 60, 'A', reading); else meter(G, 280, 160, 'A', reading);
    if (blown) { const [mx, my] = pos === 's' ? [sx, 60] : [280, 160]; el('path', {d:`M${mx - 10} ${my - 10} L${mx + 10} ${my + 10} M${mx + 10} ${my - 10} L${mx - 10} ${my + 10}`, stroke:'var(--bad)', 'stroke-width':3}, G); }
    if (short && Math.random() < 0.6) for (let k = 0; k < 5; k++) { const a = Math.random()*6.283; el('line', {x1:280, y1:160, x2:280 + Math.cos(a)*30, y2:160 + Math.sin(a)*30, stroke:'var(--acc)', 'stroke-width':2}, G); }
    if (on && (b > 0 || short)) dots(G, (pos === 'r' && !blown) ? polyR : polyS, 22, ph);
    $('amI').textContent = blown ? '— (uszkodzony)' : short ? 'ponad 50 A!' : si(Ia, 'A');
    $('amS').textContent = status;
  };
})();

/* ================== Wykresy logarytmiczne ================== */
function logChart(gid, infoId, items, lo, hi, dangerV, dangerLbl, unit, key){
  const G = $(gid), L0 = Math.log10(lo), L1 = Math.log10(hi), X = v => 170 + 232*(Math.log10(v) - L0)/(L1 - L0), RH = 30, TOP = 40;
  let sel = 0;
  function draw(){
    G.innerHTML = '';
    for (let d = Math.ceil(L0); d <= L1; d++) el('line', {x1:X(10**d), x2:X(10**d), y1:TOP - 6, y2:TOP + items.length*RH, class:'grid'}, G);
    const xd = X(dangerV);
    el('line', {x1:xd, x2:xd, y1:TOP - 10, y2:TOP + items.length*RH, stroke:'var(--bad)', 'stroke-width':2, 'stroke-dasharray':'4 4'}, G);
    el('text', {x:Math.min(410, xd), y:TOP - 16, 'text-anchor':xd > 330 ? 'end' : 'middle', class:'svgt', style:'fill:var(--bad);font-weight:600'}, G).textContent = dangerLbl;
    items.forEach(([n, v], i) => {
      const y = TOP + i*RH, g = el('g', {class:'clk'}, G);
      g.addEventListener('click', e => { if (e.isTrusted) S[key + 'User'] = n; select(i); });
      el('rect', {x:0, y, width:420, height:RH, fill:i === sel ? 'var(--pri-soft)' : 'transparent'}, g);
      el('text', {x:6, y:y + 19, class:'svgt-b', style:'font-size:12px'}, g).textContent = n;
      const xe = X(v);
      el('rect', {x:170, y:y + 7, width:Math.max(2, xe - 170), height:RH - 14, rx:3, fill:v >= dangerV ? 'var(--bad)' : 'var(--pri)', opacity:i === sel ? 1 : .65}, g);
      const inside = xe > 330;
      el('text', {x:inside ? xe - 5 : xe + 5, y:y + 19, 'text-anchor':inside ? 'end' : 'start', class:'svgt', style:inside ? 'fill:var(--surface);font-weight:600' : ''}, g).textContent = si(v, unit);
    });
  }
  function select(i){ sel = i; draw(); $(infoId).innerHTML = `<b>${items[i][0]}: ${si(items[i][1], unit)}</b><br>${items[i][2]}`; S[key] = items[i][0]; }
  select(0);
  return select;
}
S.niSel = logChart('niG', 'niInfo', [
  ['Zegarek elektroniczny', 0.000002, 'Bateria w zegarku wystarcza na kilka lat, bo zegarek pobiera bardzo mały prąd.'],
  ['Dioda LED', 0.02, 'Typowa mała dioda LED świeci przy ok. 20 mA.'],
  ['Żarówka LED 8 W', 0.035, 'Żarówka LED zasilana z gniazdka 230 V pobiera ok. 35 mA.'],
  ['Ładowanie telefonu', 2, 'Szybka ładowarka podaje do telefonu prąd ok. 2 A przy napięciu 5 V.'],
  ['Odkurzacz', 6.5, 'Odkurzacz o mocy 1500 W pobiera z gniazdka ok. 6,5 A.'],
  ['Czajnik', 8.7, 'Czajnik o mocy 2000 W pobiera ok. 8,7 A. To jedno z najbardziej „prądożernych” urządzeń w domu.'],
  ['Rozrusznik samochodu', 200, 'Przy uruchamianiu silnika akumulator daje przez chwilę ok. 200 A.'],
  ['Błyskawica', 30000, 'Typowa błyskawica to ok. 30 000 A, ale trwa tylko ułamek sekundy.']], 1e-6, 1e5, 0.03, '30 mA: groźne dla człowieka', 'A', 'niPick');
S.nnSel = logChart('nnG', 'nnInfo', [
  ['Impuls nerwowy', 0.07, 'Napięcie na błonie komórki nerwowej to ok. 70 mV.'],
  ['Bateria AA', 1.5, 'Zwykły „paluszek” ma napięcie 1,5 V.'],
  ['Dioda LED', 2, 'Czerwona dioda LED świeci przy napięciu ok. 2 V.'],
  ['Akumulator telefonu', 3.7, 'Akumulator w telefonie ma ok. 3,7 V.'],
  ['Port USB', 5, 'Gniazdo USB i zwykła ładowarka dają 5 V.'],
  ['Akumulator auta', 12, 'Akumulator samochodowy ma 12 V.'],
  ['Gniazdko', 230, 'W polskich gniazdkach jest 230 V. To napięcie może zabić!'],
  ['Tramwaj', 600, 'Sieć zasilająca tramwaje ma zwykle ok. 600 V.'],
  ['Pociąg PKP', 3000, 'Linie kolejowe w Polsce zasila napięcie 3000 V.'],
  ['Linia przesyłowa', 400000, 'Największe linie przesyłowe w Polsce mają 400 kV. Wysokie napięcie zmniejsza straty energii w przewodach.'],
  ['Piorun', 100000000, 'Napięcie między chmurą a ziemią sięga ok. 100 milionów woltów.']], 0.01, 1e9, 50, '50 V: granica bezpieczeństwa', 'V', 'nnPick');

/* ================== Przelicznik ================== */
(function(){
  const Q = {'Natężenie':[['A', 1], ['mA', 1e-3], ['µA', 1e-6], ['kA', 1e3]], 'Napięcie':[['V', 1], ['mV', 1e-3], ['kV', 1e3], ['MV', 1e6]], 'Opór':[['Ω', 1], ['kΩ', 1e3], ['MΩ', 1e6]], 'Moc':[['W', 1], ['kW', 1e3], ['MW', 1e6]]};
  let q = 'Natężenie'; const box = $('jnQ'), sel = $('jnU'), inp = $('jnV');
  Object.keys(Q).forEach((k, i) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = k; b.dataset.q = k; b.setAttribute('aria-pressed', i ? 'false' : 'true'); box.appendChild(b); });
  const units = () => { sel.innerHTML = ''; Q[q].forEach(([u]) => { const o = document.createElement('option'); o.value = u; o.textContent = u; sel.appendChild(o); }); };
  const fmt = x => x.toLocaleString('pl-PL', {maximumSignificantDigits:6});
  function draw(){
    const v = parseFloat(inp.value.replace(/\s/g, '').replace(',', '.')), out = $('jnOut');
    if (isNaN(v)) { out.innerHTML = '<div><div class="k">Uwaga</div><div class="v vt">Wpisz liczbę</div></div>'; return; }
    const base = v*Q[q].find(u => u[0] === sel.value)[1];
    out.innerHTML = Q[q].map(([u, f]) => `<div class="${u === sel.value ? 'hl' : ''}"><div class="k">${u}</div><div class="v">${fmt(base/f)}</div></div>`).join('');
  }
  chipGroup(box, b => { q = b.dataset.q; units(); sel.value = Q[q][0][0]; draw(); });
  inp.addEventListener('input', e => { if (e.isTrusted) S.jnTyped = true; draw(); });
  sel.addEventListener('change', e => { if (e.isTrusted) S.jnTyped = true; draw(); });
  chipGroup($('jnPre'), b => { q = b.dataset.q; [...box.children].forEach(c => c.setAttribute('aria-pressed', c.dataset.q === q ? 'true' : 'false')); units(); sel.value = b.dataset.u; inp.value = b.dataset.v.replace('.', ','); draw(); });
  units(); sel.value = 'mA'; draw();
})();

/* ================== Napięcie: woda i prąd ================== */
(function(){
  const G = $('naG'), sU = $('naU'), sR = $('naR'); let phW = 0, phE = 0;
  const polyE = Poly([[270, 160], [270, 70], [410, 70], [410, 250], [270, 250], [270, 160]]);
  sims.napiecie = dt => {
    const U = +sU.value, R = +sR.value, I = U/R, yt = Math.min(240, 250 - U*15);
    const polyW = Poly([[40, 250], [40, yt], [170, yt], [170, 250], [40, 250]]);
    const sp = Math.min(240, 45*I);
    phW += sp/polyW.L*dt; phE += sp/polyE.L*dt;
    S.na = {I};
    G.innerHTML = '';
    el('path', {d:`M40 250 V${yt} H170`, fill:'none', stroke:'var(--pri)', 'stroke-width':12, opacity:.35, 'stroke-linejoin':'round'}, G);
    el('path', {d:'M170 250 H40', fill:'none', stroke:'var(--pri)', 'stroke-width':12, opacity:.35}, G);
    el('path', {d:`M170 ${yt} V250`, fill:'none', stroke:'var(--pri)', 'stroke-width':Math.max(3, 60/R), opacity:.35}, G);
    el('circle', {cx:40, cy:225, r:16, class:'comp'}, G); arrow(G, 40, 236, 40, 214, 'var(--pri)');
    el('text', {x:62, y:229, class:'svgt'}, G).textContent = 'pompa';
    el('text', {x:178, y:(yt + 250)/2 + 4, class:'svgt'}, G).textContent = 'zwężenie';
    el('line', {x1:20, x2:190, y1:yt, y2:yt, class:'dash'}, G);
    el('line', {x1:20, x2:190, y1:250, y2:250, class:'dash'}, G);
    if (U > 0.3) { arrow(G, 12, 250, 12, yt + 4); el('text', {x:60, y:yt - 8, class:'svgt', style:'fill:var(--acc)'}, G).textContent = 'wysokość'; }
    if (I > 0) dots(G, polyW, 16, phW, 'eldot');
    wire(G, [[270, 149], [270, 70], [410, 70], [410, 136]]); wire(G, [[410, 184], [410, 250], [270, 250], [270, 171]]);
    cellV(G, 270, 160, nv(U, 1) + ' V');
    resistor(G, 410, 160, true);
    el('text', {x:396, y:164, 'text-anchor':'end', class:'svgt'}, G).textContent = nv(R, 0) + ' Ω';
    if (I > 0) dots(G, polyE, 16, phE, 'qdot');
    el('text', {x:105, y:290, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = 'obwód wodny';
    el('text', {x:340, y:290, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = 'obwód elektryczny';
    el('text', {x:340, y:40, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'ładunki (kierunek umowny)';
    el('text', {x:105, y:40, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'woda';
    $('naUo').textContent = nv(U, 1) + ' V'; $('naRo').textContent = R + ' Ω';
    $('naUv').textContent = nv(U, 1) + ' V'; $('naIv').textContent = si(I, 'A');
  };
})();

/* ================== Źródła: budujemy baterię ================== */
(function(){
  let cells = [1, 1, 1], ph = 0; const G = $('zrG');
  $('zrAdd').onclick = () => { if (cells.length < 6) cells.push(1); };
  $('zrDel').onclick = () => { if (cells.length > 1) cells.pop(); };
  $('zrFlip').onclick = () => { cells[cells.length - 1] *= -1; };
  S.zrSet = arr => { cells = arr.slice(); };
  sims.zrodla = dt => {
    const n = cells.length, U = 1.5*cells.reduce((a, b) => a + b, 0), burnt = Math.abs(U) > 7.6, b = burnt ? 0 : Math.min(1.3, (Math.abs(U)/4.5)**2);
    S.zr = {U, n};
    const x0 = 210 - n*25, x1 = x0 + n*50;
    const poly = Poly([[x0, 70], [40, 70], [40, 210], [380, 210], [380, 70], [x1, 70], [x0, 70]]);
    if (b > 0) ph += Math.sign(U)*(-0.1)*Math.sqrt(b)*dt;
    G.innerHTML = '';
    wire(G, [[x0, 70], [40, 70], [40, 210], [194, 210]]); wire(G, [[226, 210], [380, 210], [380, 70], [x1, 70]]);
    cells.forEach((d, k) => {
      const x = x0 + k*50;
      wire(G, [[x, 70], [x + 20, 70]]); wire(G, [[x + 30, 70], [x + 50, 70]]);
      const xl = d > 0 ? x + 20 : x + 30, xs = d > 0 ? x + 30 : x + 20;
      el('line', {x1:xl, x2:xl, y1:52, y2:88, stroke:'var(--ink)', 'stroke-width':2.5}, G);
      el('line', {x1:xs, x2:xs, y1:61, y2:79, stroke:'var(--ink)', 'stroke-width':6}, G);
      el('text', {x:xl, y:46, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = '+';
      el('text', {x:x + 25, y:108, 'text-anchor':'middle', class:'svgt', style:d < 0 ? 'fill:var(--bad);font-weight:600' : ''}, G).textContent = d > 0 ? '1,5 V' : 'odwrócone';
    });
    if (burnt) { socket(G, 210, 210); el('path', {d:'M198 198 L222 222 M222 198 L198 222', stroke:'var(--bad)', 'stroke-width':3}, G); }
    else bulb(G, 210, 210, b);
    el('text', {x:210, y:250, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'żarówka 4,5 V';
    if (b > 0) dots(G, poly, 24, ph);
    $('zrU').textContent = nv(U, 1) + ' V';
    $('zrS').textContent = burnt ? 'przepaliła się! za duże napięcie' : U === 0 ? 'nie świeci: napięcia się znoszą' : b < 0.5 ? 'świeci słabo' : b <= 1.05 ? 'świeci normalnie' : 'świeci za jasno!';
  };
})();

/* ================== Woltomierz ================== */
(function(){
  const P = {A:[110, 60, 9], B:[300, 60, 6], C:[360, 100, 6], D:[300, 260, 0], E:[110, 260, 0]};
  let red = 'A', black = 'E', next = 'red', ph = 0; const G = $('vmG');
  S.vmSet = (r, b) => { red = r; black = b; };
  const poly = Poly([[60, 160], [60, 60], [360, 60], [360, 260], [60, 260], [60, 160]]);
  const desc = (r, b) => {
    if (r === b) return 'wybierz dwa różne punkty';
    const s = [r, b].sort().join('');
    if (P[r][2] === P[b][2]) return 'oba punkty łączy sam przewód: brak napięcia';
    if (s === 'AB' || s === 'AC') return 'napięcie na oporniku R₁';
    if (['BD', 'BE', 'CD', 'CE'].includes(s)) return 'napięcie na oporniku R₂';
    if (['AD', 'AE'].includes(s)) return 'napięcie baterii = U₁ + U₂';
    return '';
  };
  sims.woltomierz = dt => {
    ph -= dt*0.04;
    G.innerHTML = '';
    wire(G, [[60, 149], [60, 60], [186, 60]]); wire(G, [[234, 60], [360, 60], [360, 146]]); wire(G, [[360, 194], [360, 260], [60, 260], [60, 171]]);
    cellV(G, 60, 160, '9 V');
    resistor(G, 210, 60, false); el('text', {x:210, y:40, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'R₁ = 1 kΩ';
    resistor(G, 360, 170, true); el('text', {x:346, y:174, 'text-anchor':'end', class:'svgt'}, G).textContent = 'R₂ = 2 kΩ';
    dots(G, poly, 18, ph);
    const V = P[red][2] - P[black][2];
    const [rx, ry] = P[red], [bx, by] = P[black];
    el('path', {d:`M${rx} ${ry} Q${(rx + 200)/2} ${(ry + 190)/2 - 20} 196 182`, fill:'none', stroke:'var(--bad)', 'stroke-width':2.2}, G);
    el('path', {d:`M${bx} ${by} Q${(bx + 224)/2} ${(by + 190)/2 + 20} 224 182`, fill:'none', stroke:'var(--ink)', 'stroke-width':2.2, 'stroke-dasharray':'2 0'}, G);
    el('rect', {x:180, y:150, width:60, height:46, rx:8, fill:'var(--surface)', stroke:'var(--ink)', 'stroke-width':2}, G);
    el('text', {x:210, y:170, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = 'V';
    el('text', {x:210, y:189, 'text-anchor':'middle', class:'svgt', style:'fill:var(--pri);font-weight:600'}, G).textContent = nv(V, 1) + ' V';
    Object.entries(P).forEach(([k, [x, y]]) => {
      const g = el('g', {class:'clk'}, G);
      g.addEventListener('click', e => { if (e.isTrusted) S.vmUser = true; if (next === 'red') { red = k; next = 'black'; } else { black = k; next = 'red'; } });
      el('circle', {cx:x, cy:y, r:14, fill:'transparent'}, g);
      el('circle', {cx:x, cy:y, r:7, fill:k === red ? 'var(--bad)' : k === black ? 'var(--ink)' : 'var(--surface)', stroke:'var(--ink)', 'stroke-width':2}, g);
      const lp = {A:[0, -14], B:[0, -14], C:[18, 4], D:[0, 24], E:[0, 24]}[k];
      el('text', {x:x + lp[0], y:y + lp[1], 'text-anchor':'middle', class:'svgt-b'}, g).textContent = k;
    });
    el('text', {x:210, y:300, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'następne kliknięcie: ' + (next === 'red' ? 'czerwona sonda (+)' : 'czarna sonda (−)');
    S.vm = {V, same:red !== black && P[red][2] === P[black][2]};
    $('vmV').textContent = nv(V, 1) + ' V';
    $('vmInfo').textContent = desc(red, black);
  };
})();

/* ================== Prawo Ohma ================== */
(function(){
  let R = 20, ph = 0; const G = $('ohG'), sU = $('ohU');
  chipGroup($('ohR'), b => { R = +b.dataset.r; });
  const poly = Poly([[40, 170], [40, 60], [200, 60], [200, 260], [40, 260], [40, 170]]);
  const X = u => 275 + u*12.5, Y = i => 250 - i*170;
  sims.ohm = dt => {
    const U = +sU.value, I = U/R; ph -= dt*I*0.25;
    S.oh = {I};
    G.innerHTML = '';
    wire(G, [[40, 140], [40, 60], [105, 60]]); wire(G, [[135, 60], [200, 60], [200, 136]]); wire(G, [[200, 184], [200, 260], [40, 260], [40, 200]]);
    el('rect', {x:16, y:140, width:48, height:60, rx:6, class:'comp'}, G);
    el('text', {x:40, y:166, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = nv(U, 1);
    el('text', {x:40, y:182, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'V';
    el('text', {x:40, y:216, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'zasilacz';
    meter(G, 120, 60, 'A', si(I, 'A'));
    resistor(G, 200, 160, true); el('text', {x:186, y:164, 'text-anchor':'end', class:'svgt'}, G).textContent = R + ' Ω';
    wire(G, [[200, 100], [238, 100], [238, 145]]); wire(G, [[238, 175], [238, 220], [200, 220]]);
    meter(G, 238, 160, 'V');
    el('text', {x:238, y:196, 'text-anchor':'middle', class:'svgt', style:'fill:var(--pri);font-weight:600'}, G).textContent = nv(U, 1) + ' V';
    if (I > 0) dots(G, poly, 20, ph);
    el('line', {x1:275, x2:430, y1:250, y2:250, class:'tick'}, G); el('line', {x1:275, x2:275, y1:40, y2:250, class:'tick'}, G);
    [0, 4, 8, 12].forEach(u => el('text', {x:X(u), y:266, 'text-anchor':'middle', class:'svgt'}, G).textContent = u);
    [0.4, 0.8, 1.2].forEach(i => { el('line', {x1:275, x2:425, y1:Y(i), y2:Y(i), class:'grid'}, G); el('text', {x:270, y:Y(i) + 4, 'text-anchor':'end', class:'svgt'}, G).textContent = nv(i, 1); });
    el('text', {x:430, y:284, 'text-anchor':'end', class:'svgt'}, G).textContent = 'U [V]';
    el('text', {x:280, y:34, class:'svgt'}, G).textContent = 'I [A]';
    [10, 20, 40].forEach(r => { const ue = Math.min(12, 1.2*r); el('line', {x1:X(0), y1:Y(0), x2:X(ue), y2:Y(ue/r), stroke:r === R ? 'var(--pri)' : 'var(--line)', 'stroke-width':r === R ? 3 : 1.5}, G); el('text', {x:X(ue) + 3, y:Y(ue/r) + (r === 10 ? 12 : -4), class:'svgt'}, G).textContent = r + ' Ω'; });
    el('circle', {cx:X(U), cy:Y(I), r:6, fill:'var(--acc)', stroke:'var(--surface)', 'stroke-width':2}, G);
    $('ohUo').textContent = nv(U, 1) + ' V';
    $('ohI').textContent = si(I, 'A'); $('ohV').textContent = nv(U, 1) + ' V';
    $('ohRr').textContent = I > 0 ? nv(U/I, 1) + ' Ω' : '—';
  };
})();

/* ================== Charakterystyka I(U) ================== */
(function(){
  const F = [u => u/20, u => u/40, u => u > 0 ? 0.12*Math.pow(u, 0.55) : 0], COL = ['--pri', '--alt', '--acc'], NAME = ['Opornik 20 Ω', 'Opornik 40 Ω', 'Żarówka'];
  const data = [[], [], []]; let e = 0; const G = $('chG'), sU = $('chU');
  const X = u => 50 + u*29, Y = i => 260 - i*320;
  chipGroup($('chEl'), b => { e = +b.dataset.e; draw(); });
  const save = () => { const U = +sU.value; if (!data[e].some(p => p[0] === U)) data[e].push([U, F[e](U)]); data[e].sort((a, b) => a[0] - b[0]); draw(); };
  $('chSave').onclick = e2 => { if (e2.isTrusted) S.chUser = true; save(); };
  $('chClear').onclick = () => { data[e] = []; draw(); };
  S.chSave = save; S.chClear = () => { data[0] = []; data[1] = []; data[2] = []; draw(); };
  S.chPick = i => { e = i; [...$('chEl').children].forEach((c, k) => c.setAttribute('aria-pressed', k === i ? 'true' : 'false')); draw(); };
  function draw(){
    const U = +sU.value;
    G.innerHTML = '';
    for (let u = 0; u <= 12; u += 2) { el('line', {x1:X(u), x2:X(u), y1:30, y2:260, class:'grid'}, G); el('text', {x:X(u), y:276, 'text-anchor':'middle', class:'svgt'}, G).textContent = u; }
    for (let i = 0.1; i <= 0.7001; i += 0.1) { el('line', {x1:50, x2:400, y1:Y(i), y2:Y(i), class:'grid'}, G); el('text', {x:44, y:Y(i) + 4, 'text-anchor':'end', class:'svgt'}, G).textContent = nv(i, 1); }
    el('line', {x1:50, x2:400, y1:260, y2:260, class:'tick'}, G); el('line', {x1:50, x2:50, y1:30, y2:260, class:'tick'}, G);
    el('text', {x:404, y:294, 'text-anchor':'end', class:'svgt'}, G).textContent = 'U [V]';
    el('text', {x:56, y:24, class:'svgt'}, G).textContent = 'I [A]';
    data.forEach((pts, k) => {
      if (pts.length >= 2) {
        if (k < 2) { const sl = pts.reduce((a, p) => a + p[0]*p[1], 0)/pts.reduce((a, p) => a + p[0]*p[0], 0); el('line', {x1:X(0), y1:Y(0), x2:X(12), y2:Y(12*sl), stroke:`var(${COL[k]})`, 'stroke-width':2, opacity:.7}, G); }
        else el('path', {d:'M' + [[0, 0], ...pts].map(p => X(p[0]) + ' ' + Y(p[1])).join(' L'), fill:'none', stroke:`var(${COL[k]})`, 'stroke-width':2, opacity:.7}, G);
      }
      pts.forEach(p => el('circle', {cx:X(p[0]), cy:Y(p[1]), r:5, fill:`var(${COL[k]})`}, G));
    });
    el('circle', {cx:X(U), cy:Y(F[e](U)), r:8, fill:'none', stroke:`var(${COL[e]})`, 'stroke-width':2, 'stroke-dasharray':'3 2'}, G);
    NAME.forEach((n, k) => { el('circle', {cx:70 + k*115, cy:44, r:5, fill:`var(${COL[k]})`}, G); el('text', {x:80 + k*115, y:48, class:'svgt'}, G).textContent = n; });
    $('chUo').textContent = nv(U, 1) + ' V';
    const pts = data[e];
    $('chTab').innerHTML = `<span class="lbl">Pomiary: ${NAME[e]}</span>` + (pts.length ? pts.slice(-6).map(p => `U = ${nv(p[0], 1)} V, I = ${nv(p[1], 3)} A, U/I = ${p[1] > 0 ? nv(p[0]/p[1], 1) + ' Ω' : '—'}`).join('<br>') : 'brak pomiarów: ustaw napięcie i kliknij „Zapisz pomiar”');
    S.ch = {bulb:data[2].length};
  }
  sU.oninput = draw; draw();
})();

/* ================== Opór przewodu ================== */
(function(){
  const M = [['Srebro', 0.016, '--glass'], ['Miedź', 0.017, '--cu'], ['Aluminium', 0.028, '--muted'], ['Żelazo', 0.1, '--ink'], ['Nikielina', 0.42, '--alt']];
  let m = M[1]; const G = $('opG'), sL = $('opL'), sS = $('opS'), box = $('opMat');
  mkChips(box, M.map(x => x[0] + ' · ' + nv(x[1], 3)), 1);
  chipGroup(box, b => { m = M[+b.dataset.i]; draw(); });
  S.opPick = i => { [...box.children].forEach((c, k) => c.setAttribute('aria-pressed', k === i ? 'true' : 'false')); m = M[i]; draw(); };
  function draw(){
    const l = +sL.value, Sx = +sS.value, R = m[1]*l/Sx, I = 4.5/(15 + R), b = Math.min(1, (I/0.3)**2);
    S.op = {R};
    G.innerHTML = '';
    const xe = 50 + 300*l/10, th = 3 + 16*Math.sqrt(Sx/2.5);
    el('rect', {x:50, y:80 - th/2, width:xe - 50, height:th, rx:th/2, fill:`var(${m[2]})`}, G);
    el('text', {x:(50 + xe)/2, y:80 - th/2 - 10, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'l = ' + nv(l, 1) + ' m';
    el('text', {x:50, y:80 + th/2 + 18, class:'svgt'}, G).textContent = 'S = ' + nv(Sx, 1) + ' mm², ' + m[0].toLowerCase();
    wire(G, [[50, 80], [30, 80], [30, 200], [134, 200]]); wire(G, [[156, 200], [284, 200]]); wire(G, [[316, 200], [390, 200], [390, 80], [xe, 80]]);
    cellH(G, 145, 200, '4,5 V');
    bulb(G, 300, 200, b);
    el('text', {x:300, y:236, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'żarówka 15 Ω';
    $('opLo').textContent = nv(l, 1) + ' m'; $('opSo').textContent = nv(Sx, 1) + ' mm²';
    $('opR').textContent = si(R, 'Ω'); $('opI').textContent = si(I, 'A');
  }
  sL.oninput = sS.oninput = draw; draw();
})();

/* ================== Połączenie szeregowe ================== */
(function(){
  const POS = {1:[[215, 60]], 2:[[160, 60], [280, 60]], 3:[[130, 60], [240, 60], [370, 160]], 4:[[130, 60], [250, 60], [370, 115], [370, 205]]};
  let n = 2, rem = [false, false, false, false], ph = 0; const G = $('szG');
  chipGroup($('szN'), b => { n = +b.dataset.n; rem = [false, false, false, false]; });
  S.szSet = (k, r) => { n = k; rem = r ? r.slice() : [false, false, false, false]; [...$('szN').children].forEach(c => c.setAttribute('aria-pressed', +c.dataset.n === n ? 'true' : 'false')); };
  const poly = Poly([[60, 160], [60, 60], [370, 60], [370, 260], [60, 260], [60, 160]]);
  sims.szeregowe = dt => {
    const ok = rem.slice(0, n).every(r => !r), I = ok ? 12/(12*n) : 0, b = I*I;
    if (ok) ph -= dt*I*0.25;
    S.sz = {n, anyRem:rem.slice(0, n).some(r => r)};
    G.innerHTML = '';
    wire(G, [[60, 149], [60, 60], [370, 60], [370, 260], [60, 260], [60, 171]]);
    cellV(G, 60, 160, '12 V');
    POS[n].forEach(([x, y], i) => {
      const g = el('g', {class:'clk'}, G);
      g.addEventListener('click', e => { if (e.isTrusted) S.szUser = true; rem[i] = !rem[i]; });
      el('rect', {x:x - 18, y:y - 18, width:36, height:36, fill:'var(--surface)'}, g);
      if (rem[i]) socket(g, x, y); else bulb(g, x, y, b);
      const ly = y === 60 ? y - 26 : y + 4, lx = y === 60 ? x : x - 24;
      el('text', {x:lx, y:ly, 'text-anchor':y === 60 ? 'middle' : 'end', class:'svgt'}, G).textContent = nv(I*12, 1) + ' V';
    });
    if (ok) dots(G, poly, 24, ph);
    $('szI').textContent = ok ? si(I, 'A') : '0 A (przerwa)';
    $('szU').textContent = nv(I*12, 1) + ' V';
    $('szR').textContent = nv(12*n, 0) + ' Ω';
  };
})();

/* ================== Połączenie równoległe ================== */
(function(){
  let n = 2, rem = [false, false, false, false], ph = 0; const G = $('rwG');
  chipGroup($('rwN'), b => { n = +b.dataset.n; rem = [false, false, false, false]; });
  S.rwSet = (k, r) => { n = k; rem = r ? r.slice() : [false, false, false, false]; [...$('rwN').children].forEach(c => c.setAttribute('aria-pressed', +c.dataset.n === n ? 'true' : 'false')); };
  sims.rownolegle = dt => {
    const xs = n === 1 ? [250] : Array.from({length:n}, (_, k) => 150 + k*200/(n - 1));
    const act = xs.map((x, i) => !rem[i]), a = act.filter(Boolean).length;
    ph -= dt*0.25;
    S.rw = {I:a};
    G.innerHTML = '';
    wire(G, [[60, 149], [60, 60], [xs[xs.length - 1], 60]]); wire(G, [[xs[xs.length - 1], 260], [60, 260], [60, 171]]);
    cellV(G, 60, 160, '12 V');
    xs.forEach((x, i) => {
      wire(G, [[x, 60], [x, 144]]); wire(G, [[x, 176], [x, 260]]);
      el('circle', {cx:x, cy:60, r:4, fill:'var(--ink)'}, G); el('circle', {cx:x, cy:260, r:4, fill:'var(--ink)'}, G);
      const g = el('g', {class:'clk'}, G);
      g.addEventListener('click', e => { if (e.isTrusted) S.rwUser = true; rem[i] = !rem[i]; });
      el('rect', {x:x - 18, y:142, width:36, height:36, fill:'var(--surface)'}, g);
      if (rem[i]) socket(g, x, 160); else bulb(g, x, 160, 1);
      el('text', {x:x + 20, y:200, class:'svgt'}, G).textContent = act[i] ? '1 A' : '0 A';
      if (act[i]) dots(G, Poly([[60, 160], [60, 60], [x, 60], [x, 260], [60, 260], [60, 160]]), 16, ph + i*0.13);
    });
    $('rwI').textContent = a + ' A';
    $('rwIk').textContent = a ? '1 A' : '0 A';
    $('rwR').textContent = a ? nv(12/a, 1) + ' Ω' : 'brak przepływu';
  };
})();

/* ================== Moc i energia ================== */
(function(){
  const D = [['Żarówka LED', 8], ['Laptop', 60], ['Telewizor', 100], ['Odkurzacz', 1500], ['Czajnik', 2000], ['Piekarnik', 3000]];
  let d = D[4], ang = 0, eLive = 0; const box = $('moDev'), sT = $('moT'), sD = $('moD'), G = $('moG');
  mkChips(box, D.map(x => x[0] + ' · ' + x[1] + ' W'), 4);
  chipGroup(box, b => { d = D[+b.dataset.i]; calc(); });
  S.moPick = i => { [...box.children].forEach((c, k) => c.setAttribute('aria-pressed', k === i ? 'true' : 'false')); d = D[i]; calc(); };
  function calc(){
    const P = d[1], t = +sT.value, days = +sD.value, E = P*t*days/1000;
    S.mo = {dev:d[0], t, days};
    $('moTo').textContent = nv(t, 1) + ' h'; $('moDo').textContent = days + ' dni';
    $('moI').textContent = si(P/230, 'A'); $('moE').textContent = nv(E, 2) + ' kWh'; $('moC').textContent = nf(E, 2) + ' zł';
    $('moCalc').innerHTML = `<span class="lbl">Obliczenie</span>I = P / U = ${P} W : 230 V = ${nv(P/230, 3)} A<br>W = P · t = ${nv(P/1000, 3)} kW · ${nv(t, 1)} h · ${days} = <b>${nv(E, 2)} kWh</b><br>Koszt: ${nv(E, 2)} kWh · 1 zł = <b>${nf(E, 2)} zł</b>`;
  }
  sT.oninput = sD.oninput = calc; calc();
  sims.moc = dt => {
    const P = d[1]; ang += P/2000*6*dt; eLive += P/1000*dt;
    G.innerHTML = '';
    el('rect', {x:20, y:12, width:380, height:126, rx:14, fill:'var(--bg)', stroke:'var(--glass)', 'stroke-width':2}, G);
    el('rect', {x:40, y:30, width:200, height:44, rx:6, fill:'var(--ink)'}, G);
    el('text', {x:228, y:61, 'text-anchor':'end', style:'fill:var(--glow);font:500 22px var(--f-mono)'}, G).textContent = nf(eLive, 3) + ' kWh';
    el('text', {x:40, y:96, class:'svgt'}, G).textContent = 'licznik energii';
    el('text', {x:40, y:114, class:'svgt'}, G).textContent = 'czas przyspieszony: 1 s = 1 h';
    el('ellipse', {cx:320, cy:92, rx:58, ry:11, fill:'var(--glass)', opacity:.5}, G);
    const mx = 320 + 58*Math.cos(ang), my = 92 + 11*Math.sin(ang);
    if (Math.sin(ang) > -0.2) el('rect', {x:mx - 3, y:my - 6, width:6, height:10, fill:'var(--bad)'}, G);
    el('text', {x:320, y:48, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = d[0] + ': ' + d[1] + ' W';
  };
})();

/* ================== Skutki przepływu prądu ================== */
(function(){
  const INFO = ['<b>Skutek cieplny.</b> Prąd nagrzewa przewodnik, szczególnie cienki drut o dużym oporze. Tak działają czajnik, żelazko, piekarnik i suszarka.', '<b>Skutek świetlny.</b> Rozgrzane włókno albo dioda LED świecą. Świecą też gazy, przez które płynie prąd, np. w świetlówce i w błyskawicy.', '<b>Skutek magnetyczny.</b> Wokół przewodu z prądem powstaje pole magnetyczne i igła kompasu się odchyla. Na tym działają elektromagnes, silnik i głośnik.', '<b>Skutek chemiczny.</b> Prąd płynący przez roztwór rozkłada go. W wodzie na elektrodach wydzielają się pęcherzyki gazów: wodoru i tlenu. Tak ładuje się akumulatory.'];
  let e = 0, on = false, temp = 20, glow = 0, needle = 0, bub = [], acc = 0; const G = $('skG'), btn = $('skOn');
  const upd = () => { btn.textContent = on ? 'Wyłącz prąd' : 'Włącz prąd'; $('skInfo').innerHTML = INFO[e]; };
  chipGroup($('skE'), b => { e = +b.dataset.e; bub = []; upd(); });
  btn.onclick = ev => { on = !on; upd(); };
  S.skSet = (k, o) => { e = k; on = o; bub = []; [...$('skE').children].forEach((c, i) => c.setAttribute('aria-pressed', i === k ? 'true' : 'false')); upd(); };
  S.skSeen = new Set();
  upd();
  sims.skutki = (dt, frozen) => {
    if (frozen) { temp = on ? 95 : 20; glow = on ? 1 : 0; needle = on ? 80 : 0; }
    else { temp = on ? Math.min(95, temp + 25*dt) : Math.max(20, temp - 12*dt); glow += ((on ? 1 : 0) - glow)*Math.min(1, dt*6); needle += ((on ? 80 : 0) - needle)*Math.min(1, dt*3); }
    if (on) S.skSeen.add(e);
    G.innerHTML = '';
    el('text', {x:16, y:24, class:'svgt-b', style:on ? 'fill:var(--good)' : 'fill:var(--muted)'}, G).textContent = on ? 'prąd płynie' : 'prąd wyłączony';
    if (e === 0) {
      wire(G, [[60, 130], [150, 130]]); wire(G, [[290, 130], [330, 130]]);
      let d = 'M150 130'; for (let k = 0; k < 8; k++) d += ` L${158 + k*17.5} ${k % 2 ? 150 : 110}`; d += ' L290 130';
      const hot = (temp - 20)/75;
      el('path', {d, fill:'none', stroke:'var(--glass)', 'stroke-width':4, 'stroke-linejoin':'round'}, G);
      el('path', {d, fill:'none', stroke:'var(--bad)', 'stroke-width':4, 'stroke-linejoin':'round', opacity:hot.toFixed(2)}, G);
      if (hot > 0.5) [180, 220, 260].forEach(x => el('path', {d:`M${x} 98 q-6 -12 0 -24 q6 -12 0 -24`, fill:'none', stroke:'var(--bad)', 'stroke-width':2, opacity:(hot - 0.5).toFixed(2)}, G));
      el('text', {x:220, y:180, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'grzałka z drutu oporowego';
      const ty = T => 230 - T*1.8;
      el('rect', {x:352, y:40, width:16, height:196, rx:8, fill:'var(--bg)', stroke:'var(--glass)', 'stroke-width':2}, G);
      el('rect', {x:356, y:ty(temp), width:8, height:232 - ty(temp), fill:'var(--bad)'}, G);
      el('text', {x:344, y:ty(temp) + 4, 'text-anchor':'end', class:'svgt-b'}, G).textContent = nf(temp, 0) + ' °C';
    } else if (e === 1) {
      wire(G, [[60, 230], [200, 230], [200, 160]]); wire(G, [[240, 160], [240, 230], [340, 230]]);
      bulb(G, 220, 120, glow, 34);
      el('text', {x:220, y:250, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'żarówka';
    } else if (e === 2) {
      el('line', {x1:140, y1:20, x2:140, y2:240, stroke:'var(--cu)', 'stroke-width':8, 'stroke-linecap':'round'}, G);
      if (on) arrow(G, 120, 200, 120, 80);
      el('text', {x:150, y:250, class:'svgt'}, G).textContent = 'przewód';
      el('circle', {cx:270, cy:130, r:62, class:'comp'}, G);
      el('text', {x:270, y:84, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = 'N';
      el('text', {x:270, y:186, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = 'S';
      const ng = el('g', {transform:`rotate(${needle} 270 130)`}, G);
      el('path', {d:'M270 82 L279 130 L261 130 Z', fill:'var(--bad)'}, ng);
      el('path', {d:'M270 178 L279 130 L261 130 Z', fill:'var(--glass)'}, ng);
      el('circle', {cx:270, cy:130, r:4, fill:'var(--ink)'}, G);
    } else {
      el('rect', {x:110, y:90, width:200, height:140, fill:'var(--pri)', opacity:.2}, G);
      el('path', {d:'M110 70 V230 H310 V70', class:'glass'}, G);
      [[170, '+', '--ion'], [250, '−', '--el']].forEach(([x, s, c]) => { el('rect', {x:x - 5, y:50, width:10, height:160, fill:`var(${c})`}, G); el('text', {x, y:40, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = s; });
      if (on && !frozen) { acc += dt; while (acc > 0.06) { acc -= 0.06; bub.push({x:250 + (Math.random() - .5)*16, y:205, r:2 + Math.random()*2}); if (Math.random() < 0.5) bub.push({x:170 + (Math.random() - .5)*16, y:205, r:2 + Math.random()*2}); } }
      bub = bub.filter(b => (b.y -= 60*dt) > 95);
      bub.forEach(b => el('circle', {cx:b.x, cy:b.y, r:b.r, fill:'none', stroke:'var(--ink)', 'stroke-width':1.2}, G));
      el('text', {x:210, y:250, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'tlen (+)          wodór (−)';
    }
  };
})();

/* ================== Bezpiecznik ================== */
(function(){
  const D = [['Czajnik', 2000], ['Suszarka', 1800], ['Żelazko', 2200], ['Odkurzacz', 1500], ['Telewizor', 100], ['Laptop', 60], ['Lampka LED', 8]];
  const on = new Set([4, 5]); let tripped = false, overT = 0, shortA = false, cause = ''; const box = $('bzDev'), G = $('bzG');
  D.forEach(([n, p], i) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = n + ' · ' + p + ' W'; b.dataset.i = i; b.setAttribute('aria-pressed', on.has(i) ? 'true' : 'false'); box.appendChild(b); });
  const sync = () => [...box.children].forEach((c, i) => c.setAttribute('aria-pressed', on.has(i) ? 'true' : 'false'));
  box.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i); sync(); });
  $('bzShort').onclick = () => { if (!tripped) shortA = true; };
  $('bzReset').onclick = () => { tripped = false; overT = 0; shortA = false; };
  S.bzSet = arr => { on.clear(); arr.forEach(i => on.add(i)); sync(); };
  S.bzShort = () => { if (!tripped) shortA = true; };
  S.bzReset = () => { tripped = false; overT = 0; shortA = false; };
  S.bzTrip = {};
  sims.bezpiecznik = dt => {
    const sumP = [...on].reduce((a, i) => a + D[i][1], 0);
    let I = tripped ? 0 : shortA ? 1500 : sumP/230;
    if (!tripped) {
      if (shortA) overT += dt*8; else if (I > 16) overT += dt; else overT = Math.max(0, overT - dt);
      if (overT > 1.6) { tripped = true; cause = shortA ? 'zwarcie' : 'przeciążenie'; S.bzTrip[cause] = true; shortA = false; I = 0; }
    }
    G.innerHTML = '';
    el('rect', {x:20, y:30, width:90, height:120, rx:8, class:'comp'}, G);
    el('text', {x:65, y:54, 'text-anchor':'middle', class:'svgt-b'}, G).textContent = '16 A';
    el('rect', {x:55, y:66, width:20, height:56, rx:4, fill:'var(--bg)', stroke:'var(--ink)'}, G);
    el('rect', {x:57, y:tripped ? 96 : 68, width:16, height:24, rx:3, fill:tripped ? 'var(--bad)' : 'var(--good)'}, G);
    el('text', {x:65, y:142, 'text-anchor':'middle', class:'svgt'}, G).textContent = tripped ? 'wyłączony' : 'włączony';
    const hot = Math.min(1, Math.max(0, (I - 10)/14));
    el('path', {d:'M110 90 H160 V200 H180', fill:'none', stroke:'var(--ink)', 'stroke-width':4}, G);
    el('path', {d:'M110 90 H160 V200 H180', fill:'none', stroke:'var(--bad)', 'stroke-width':4, opacity:hot.toFixed(2)}, G);
    el('rect', {x:180, y:186, width:220, height:28, rx:6, class:'comp'}, G);
    D.forEach((d, i) => { const x = 192 + i*30; el('circle', {cx:x + 6, cy:200, r:7, fill:on.has(i) ? (tripped ? 'var(--glass)' : 'var(--acc)') : 'var(--bg)', stroke:'var(--ink)'}, G); });
    el('text', {x:290, y:234, 'text-anchor':'middle', class:'svgt'}, G).textContent = 'listwa z urządzeniami';
    const BX = i => 180 + Math.min(i, 40)*5.5;
    el('rect', {x:180, y:40, width:220, height:22, rx:4, fill:'var(--bg)', stroke:'var(--line)'}, G);
    el('rect', {x:180, y:40, width:BX(I) - 180, height:22, rx:4, fill:I > 16 ? 'var(--bad)' : 'var(--pri)'}, G);
    el('line', {x1:BX(16), x2:BX(16), y1:32, y2:70, stroke:'var(--bad)', 'stroke-width':2, 'stroke-dasharray':'3 3'}, G);
    el('text', {x:BX(16), y:84, 'text-anchor':'middle', class:'svgt', style:'fill:var(--bad)'}, G).textContent = '16 A';
    el('text', {x:180, y:28, class:'svgt'}, G).textContent = 'natężenie (skala do 40 A)';
    if (shortA && !tripped) for (let k = 0; k < 6; k++) { const a = Math.random()*6.283; el('line', {x1:300, y1:200, x2:300 + Math.cos(a)*34, y2:200 + Math.sin(a)*34, stroke:'var(--acc)', 'stroke-width':2.5}, G); }
    $('bzI').textContent = I >= 1000 ? 'ponad 1000 A!' : nv(I, 1) + ' A';
    $('bzS').textContent = tripped ? 'bezpiecznik wyłączył prąd: ' + cause : shortA ? 'ZWARCIE!' : I > 16 ? 'przeciążenie! przewody się grzeją…' : I > 0 ? 'w normie' : 'nic nie jest włączone';
  };
})();

/* ================== Prąd a ciało ================== */
(function(){
  let U = 4.5, Rs = 100000; const G = $('bsG');
  chipGroup($('bsU'), b => { U = +b.dataset.u; draw(); });
  chipGroup($('bsSkin'), b => { Rs = +b.dataset.r; draw(); });
  S.bsSet = (u, r) => { U = u; Rs = r; [...$('bsU').children].forEach(c => c.setAttribute('aria-pressed', +c.dataset.u === u ? 'true' : 'false')); [...$('bsSkin').children].forEach(c => c.setAttribute('aria-pressed', +c.dataset.r === r ? 'true' : 'false')); draw(); };
  const Y = mA => 270 - (Math.log10(Math.max(0.1, Math.min(1000, mA))) + 1)*60;
  const Z = [[0.1, 1, 'prawie nieodczuwalny', '--good'], [1, 10, 'mrowienie, ból', '--acc'], [10, 30, 'skurcz mięśni: nie można puścić przewodu', '--acc'], [30, 75, 'zaburzenia oddychania', '--bad'], [75, 1000, 'migotanie komór serca: zagrożenie życia', '--bad']];
  function draw(){
    const R = U >= 100 ? 1000 : Rs, I = U/R, mA = I*1000;
    S.bs = {U, wet:Rs === 1000};
    G.innerHTML = '';
    Z.forEach(([a, b, t, c], k) => {
      el('rect', {x:120, y:Y(b), width:30, height:Y(a) - Y(b), fill:`var(${c})`, opacity:(0.3 + k*0.15).toFixed(2)}, G);
      el('text', {x:160, y:(Y(a) + Y(b))/2 + 4, class:'svgt', style:'fill:var(--ink)'}, G).textContent = t;
    });
    [0.1, 1, 10, 100, 1000].forEach(v => { el('line', {x1:112, x2:120, y1:Y(v), y2:Y(v), class:'tick'}, G); el('text', {x:108, y:Y(v) + 4, 'text-anchor':'end', class:'svgt'}, G).textContent = v >= 1000 ? '1 A' : nv(v, 1) + ' mA'; });
    el('line', {x1:116, x2:156, y1:Y(30), y2:Y(30), stroke:'var(--bad)', 'stroke-width':2}, G);
    const y = Y(mA);
    el('path', {d:`M20 ${y} L60 ${y} M50 ${y - 8} L62 ${y} L50 ${y + 8}`, fill:'none', stroke:'var(--ink)', 'stroke-width':3}, G);
    el('text', {x:16, y:y - 12, class:'svgt-b'}, G).textContent = mA < 0.1 ? '< 0,1 mA' : si(I, 'A');
    $('bsR').textContent = si(R, 'Ω') + (U >= 100 ? ' (przebicie skóry)' : '');
    $('bsI').textContent = si(I, 'A');
    $('bsE').textContent = mA < 1 ? 'prawie nieodczuwalny' : mA < 10 ? 'mrowienie, ból' : mA < 30 ? 'skurcz mięśni' : mA < 75 ? 'zaburzenia oddychania' : 'zagrożenie życia!';
  }
  draw();
})();

/* ================== Oś czasu ================== */
(function(){
  const E = [
    {y:'1752', n:'Benjamin Franklin', c:'USA', t:'Piorun to elektryczność', d:'Pokazał, że błyskawica to wyładowanie elektryczne, i wynalazł piorunochron. Jego doświadczenie z latawcem podczas burzy było śmiertelnie niebezpieczne: nigdy go nie powtarzaj!'},
    {y:'1800', n:'Alessandro Volta', c:'Włochy', t:'Pierwsza bateria', d:'Zbudował stos z krążków cynku i miedzi przełożonych tkaniną nasączoną słoną wodą. Było to pierwsze źródło stałego prądu. Od jego nazwiska pochodzi jednostka napięcia: wolt.'},
    {y:'1820', n:'Hans Christian Ørsted', c:'Dania', t:'Prąd i magnetyzm', d:'Zauważył, że igła kompasu odchyla się przy przewodzie z prądem. Odkrył magnetyczny skutek przepływu prądu. Zaraz potem André-Marie Ampère zbadał, jak oddziałują przewody z prądem.'},
    {y:'1827', n:'Georg Simon Ohm', c:'Niemcy', t:'Prawo Ohma', d:'Opisał, jak natężenie prądu zależy od napięcia i oporu przewodnika. Od jego nazwiska pochodzi jednostka oporu: om.'},
    {y:'1831', n:'Michael Faraday', c:'Anglia', t:'Prąd z magnesu', d:'Odkrył, że poruszający się magnes wytwarza prąd w przewodzie. To zjawisko indukcji elektromagnetycznej. Na tej zasadzie działają prądnice w elektrowniach.'},
    {y:'1879', n:'Thomas Edison', c:'USA', t:'Trwała żarówka', d:'Zbudował żarówkę z żarzącym się włóknem, która świeciła przez wiele godzin, a potem jedną z pierwszych elektrowni zasilających domy.'},
    {y:'1888', n:'Nikola Tesla', c:'USA', t:'Prąd przemienny', d:'Opatentował silnik prądu przemiennego. Dzięki prądowi przemiennemu energię elektryczną można przesyłać na duże odległości. Taki prąd płynie dziś w gniazdkach.'}];
  const bar = $('tlBar'), card = $('tlCard'), clicked = new Set();
  E.forEach((e, i) => { const b = document.createElement('button'); b.className = 'tl'; b.textContent = e.y; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', ev => { if (ev.isTrusted) { clicked.add(i); S.tlClicks = clicked.size; } sel(i); }); bar.appendChild(b); });
  function sel(i){
    [...bar.children].forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
    bar.children[i].classList.add('seen');
    const e = E[i];
    card.innerHTML = `<p class="eyebrow" style="margin:0 0 6px">${e.y}</p><h3>${e.t}</h3><p class="who">${e.n} · ${e.c}</p><p style="margin:0">${e.d}</p>`;
  }
  S.tlSel = sel; S.tlE = E; sel(0);
})();

/* ================== symbole: śledzenie odkryć ================== */
S.symUser = new Set();
document.querySelectorAll('#symGrid details').forEach((d, i) => d.querySelector('summary').addEventListener('click', e => { if (e.isTrusted) S.symUser.add(i); }));
