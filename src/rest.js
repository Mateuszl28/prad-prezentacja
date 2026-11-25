
/* ================== Quiz ================== */
(function(){
  const Q = [
    {q:'Prąd elektryczny to…', o:['uporządkowany ruch ładunków elektrycznych', 'ruch atomów w przewodzie', 'ciepło płynące przewodem'], a:0, e:'Prąd to uporządkowany ruch ładunków, w metalach elektronów swobodnych.'},
    {q:'Co płynie w metalowym przewodzie, gdy płynie prąd?', o:['protony', 'elektrony swobodne', 'jony dodatnie'], a:1, e:'W metalach poruszają się elektrony swobodne. Jony metalu stoją w miejscu.'},
    {q:'Jednostką natężenia prądu jest…', o:['wolt (V)', 'amper (A)', 'om (Ω)'], a:1, e:'Natężenie mierzymy w amperach. 1 A = 1 C / 1 s.'},
    {q:'Jednostką napięcia jest…', o:['wolt (V)', 'wat (W)', 'kulomb (C)'], a:0, e:'Napięcie mierzymy w woltach. 1 V = 1 J / 1 C.'},
    {q:'Jak włączamy amperomierz?', o:['równolegle do odbiornika', 'szeregowo z odbiornikiem', 'dowolnie'], a:1, e:'Przez amperomierz musi płynąć cały prąd, więc włączamy go szeregowo.'},
    {q:'Jak włączamy woltomierz?', o:['szeregowo', 'równolegle do odbiornika', 'zamiast odbiornika'], a:1, e:'Woltomierz mierzy napięcie między dwoma punktami, więc łączymy go równolegle.'},
    {q:'Przez przekrój przewodu w ciągu 4 s przepłynął ładunek 2 C. Jakie było natężenie?', o:['0,5 A', '2 A', '8 A'], a:0, e:'I = q / t = 2 C : 4 s = 0,5 A.'},
    {q:'250 mA to…', o:['25 A', '2,5 A', '0,25 A'], a:2, e:'Mili to tysięczna część: 250 : 1000 = 0,25 A.'},
    {q:'Żarówka o oporze 6 Ω jest podłączona do napięcia 12 V. Jakie płynie natężenie?', o:['2 A', '0,5 A', '72 A'], a:0, e:'I = U / R = 12 V : 6 Ω = 2 A.'},
    {q:'Napięcie na oporniku wzrosło 3 razy. Natężenie prądu…', o:['zmalało 3 razy', 'wzrosło 3 razy', 'nie zmieniło się'], a:1, e:'Prawo Ohma: natężenie jest wprost proporcjonalne do napięcia.'},
    {q:'Który materiał jest izolatorem?', o:['miedź', 'grafit', 'guma'], a:2, e:'Guma nie ma swobodnych ładunków i nie przewodzi prądu.'},
    {q:'W połączeniu szeregowym natężenie prądu…', o:['jest wszędzie takie samo', 'sumuje się', 'jest równe zeru'], a:0, e:'Prąd ma jedną drogę, więc w każdym miejscu jest takie samo.'},
    {q:'Jak połączone są urządzenia w mieszkaniu?', o:['szeregowo', 'równolegle', 'wcale nie są połączone'], a:1, e:'Każde urządzenie dostaje 230 V i działa niezależnie od pozostałych.'},
    {q:'Trzy ogniwa po 1,5 V połączone szeregowo dają napięcie…', o:['1,5 V', '3 V', '4,5 V'], a:2, e:'Napięcia ogniw połączonych szeregowo sumują się: 3 · 1,5 V = 4,5 V.'},
    {q:'Czajnik pracuje przy napięciu 230 V i pobiera prąd 10 A. Jaka jest jego moc?', o:['23 W', '2300 W', '240 W'], a:1, e:'P = U · I = 230 V · 10 A = 2300 W.'},
    {q:'Kilowatogodzina (kWh) to jednostka…', o:['energii', 'mocy', 'napięcia'], a:0, e:'1 kWh to energia zużyta przez urządzenie o mocy 1 kW w ciągu 1 h, czyli 3 600 000 J.'},
    {q:'Opór przewodu wzrośnie, gdy przewód będzie…', o:['dłuższy', 'grubszy', 'krótszy'], a:0, e:'Opór rośnie z długością przewodu i maleje, gdy przewód jest grubszy.'},
    {q:'Dlaczego ptak siedzący na linii wysokiego napięcia jest bezpieczny?', o:['bo między jego nogami nie ma napięcia', 'bo pióra przewodzą prąd', 'bo w liniach nie płynie prąd'], a:0, e:'Obie nogi są na tym samym przewodzie, więc napięcie między nimi jest równe zeru i prąd przez ptaka nie płynie.'}];
  const box = $('quiz'); let score = 0;
  function build(){
    box.innerHTML = ''; score = 0; $('qScore').textContent = 'Wynik: 0 / ' + Q.length;
    Q.forEach((it, i) => {
      const d = document.createElement('div'); d.className = 'q';
      d.innerHTML = `<p>${i + 1}. ${it.q}</p><div class="opts"></div><p class="expl" hidden></p>`;
      const opts = d.querySelector('.opts'), ex = d.querySelector('.expl');
      it.o.forEach((o, k) => {
        const b = document.createElement('button'); b.className = 'opt'; b.textContent = o;
        b.onclick = () => {
          opts.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; if (j === it.a) x.classList.add('ok'); });
          if (k === it.a) score++; else b.classList.add('no');
          ex.textContent = (k === it.a ? 'Dobrze. ' : 'Niestety nie. ') + it.e; ex.hidden = false;
          $('qScore').textContent = 'Wynik: ' + score + ' / ' + Q.length;
        };
        opts.appendChild(b);
      });
      box.appendChild(d);
    });
  }
  build();
  const reset = document.createElement('button'); reset.className = 'navbtn'; reset.textContent = 'Zacznij quiz od nowa'; reset.style.marginTop = '18px'; reset.onclick = build;
  box.after(reset);
})();

/* ================== Trening ================== */
(function(){
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const gens = [
    () => { const I = pick([0.2, 0.5, 1, 2, 3, 4]), t = pick([2, 5, 10, 20, 30]), q = I*t;
      return {q:`Przez przekrój przewodu w ciągu ${t} s przepłynął ładunek ${nv(q, 1)} C. Oblicz natężenie prądu.`, a:I, u:'A', hint:'I = q / t', sol:`I = ${nv(q, 1)} C : ${t} s = ${nv(I, 2)} A`}; },
    () => { const I = pick([0.2, 0.5, 1.5, 2]), m = pick([1, 2, 5, 10]), q = I*m*60;
      return {q:`Przez żarówkę płynie prąd ${nv(I, 1)} A. Jaki ładunek przepłynie w ciągu ${m} min?`, a:q, u:'C', hint:'q = I · t. Zamień minuty na sekundy!', sol:`q = ${nv(I, 1)} A · ${m*60} s = ${nv(q, 0)} C`}; },
    () => { const U = pick([1.5, 3, 4.5, 6, 9, 12, 230]), R = pick([3, 5, 10, 15, 20, 30, 46]), I = U/R;
      return {q:`Odbiornik o oporze ${R} Ω podłączono do napięcia ${nv(U, 1)} V. Oblicz natężenie prądu.`, a:I, u:'A', hint:'I = U / R', sol:`I = ${nv(U, 1)} V : ${R} Ω = ${nv(I, 3)} A`}; },
    () => { const R = pick([4, 5, 8, 10, 20, 50]), I = pick([0.1, 0.2, 0.5, 1, 2]), U = R*I;
      return {q:`Przy napięciu ${nv(U, 1)} V przez opornik płynie prąd ${nv(I, 1)} A. Oblicz opór opornika.`, a:R, u:'Ω', hint:'R = U / I', sol:`R = ${nv(U, 1)} V : ${nv(I, 1)} A = ${R} Ω`}; },
    () => { const R = pick([5, 10, 20, 30, 100]), I = pick([0.1, 0.2, 0.3, 0.5]), U = R*I;
      return {q:`Przez opornik ${R} Ω płynie prąd ${nv(I, 1)} A. Jakie jest napięcie na oporniku?`, a:U, u:'V', hint:'U = R · I', sol:`U = ${R} Ω · ${nv(I, 1)} A = ${nv(U, 1)} V`}; },
    () => { const I = pick([0.5, 2, 5, 8, 10]), P = 230*I;
      return {q:`Urządzenie zasilane napięciem 230 V pobiera prąd ${nv(I, 1)} A. Oblicz jego moc.`, a:P, u:'W', hint:'P = U · I', sol:`P = 230 V · ${nv(I, 1)} A = ${nv(P, 0)} W`}; },
    () => { const P = pick([100, 500, 1000, 2000]), t = pick([0.5, 1, 2, 3, 5]), E = P*t/1000;
      return {q:`Urządzenie o mocy ${P} W pracowało przez ${nv(t, 1)} h. Ile energii zużyło (w kWh)?`, a:E, u:'kWh', hint:'W = P · t. Zamień waty na kilowaty: 1000 W = 1 kW.', sol:`W = ${nv(P/1000, 1)} kW · ${nv(t, 1)} h = ${nv(E, 2)} kWh`}; },
    () => { const m = pick([20, 50, 150, 250, 400, 750]);
      return {q:`Zamień ${m} mA na ampery.`, a:m/1000, u:'A', hint:'1 mA = 0,001 A, więc dzielimy przez 1000.', sol:`${m} mA = ${m} : 1000 = ${nv(m/1000, 3)} A`}; },
    () => { const R1 = pick([5, 10, 15, 20]), R2 = pick([10, 20, 30, 40]);
      return {q:`Oporniki ${R1} Ω i ${R2} Ω połączono szeregowo. Oblicz opór zastępczy.`, a:R1 + R2, u:'Ω', hint:'W połączeniu szeregowym opory się sumują.', sol:`R = ${R1} Ω + ${R2} Ω = ${R1 + R2} Ω`}; },
    () => { const I1 = pick([0.2, 0.5, 1, 1.5]), I2 = pick([0.3, 0.5, 1, 2]);
      return {q:`Dwie żarówki połączono równolegle. Przez pierwszą płynie ${nv(I1, 1)} A, a przez drugą ${nv(I2, 1)} A. Jakie natężenie płynie ze źródła?`, a:I1 + I2, u:'A', hint:'W połączeniu równoległym natężenia gałęzi się sumują.', sol:`I = ${nv(I1, 1)} A + ${nv(I2, 1)} A = ${nv(I1 + I2, 1)} A`}; }];
  let cur = null, tries = 0, streak = 0, best = 0, good = 0;
  const inp = $('trIn'), msgEl = $('trMsg');
  const stats = () => { $('trStreak').textContent = `Poprawne: ${good} · seria: ${streak} · najlepsza seria: ${best}`; S.trStreak = best; };
  function next(){ cur = pick(gens)(); tries = 0; $('trQ').textContent = cur.q; $('trU').textContent = cur.u; inp.value = ''; msgEl.textContent = ''; msgEl.className = 'expl'; }
  function check(){
    const v = parseFloat(inp.value.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(v)) { msgEl.textContent = 'Wpisz liczbę, np. 0,5 albo 230.'; msgEl.className = 'expl no'; return; }
    if (Math.abs(v - cur.a) <= Math.max(0.01*Math.abs(cur.a), 0.001)) {
      good++; streak++; best = Math.max(best, streak);
      msgEl.textContent = 'Dobrze! ' + cur.sol; msgEl.className = 'expl ok'; stats(); setTimeout(next, 2200);
    } else {
      tries++; streak = 0; stats();
      msgEl.textContent = tries >= 2 ? 'Jeszcze nie. Rozwiązanie: ' + cur.sol + '. Kliknij „Nowe zadanie”.' : 'Jeszcze nie. Sprawdź jednostki i spróbuj ponownie albo kliknij „Podpowiedź”.';
      msgEl.className = 'expl no';
    }
  }
  $('trCheck').onclick = check;
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  $('trHint').onclick = () => { msgEl.textContent = 'Podpowiedź: ' + cur.hint; msgEl.className = 'expl'; };
  $('trNew').onclick = next;
  S.trCur = () => cur;
  next(); stats();
})();

/* ================== Zadania krok po kroku ================== */
(function(){
  const T = [
    {t:'W ciągu 10 s przez przekrój przewodu przepłynął ładunek 5 C. Oblicz natężenie prądu.', s:['<span class="given">Dane: q = 5 C, t = 10 s. Szukane: I</span>', 'Wzór: I = q / t', 'Podstawiamy: I = 5 C : 10 s', '<span class="ans">Odpowiedź: I = 0,5 A</span>']},
    {t:'Żarówka o oporze 15 Ω jest podłączona do baterii 4,5 V. Jakie natężenie prądu przez nią płynie?', s:['<span class="given">Dane: R = 15 Ω, U = 4,5 V. Szukane: I</span>', 'Z prawa Ohma: I = U / R', 'Podstawiamy: I = 4,5 V : 15 Ω', '<span class="ans">Odpowiedź: I = 0,3 A = 300 mA</span>']},
    {t:'Przy napięciu 12 V przez opornik płynie prąd 0,4 A. Oblicz opór opornika.', s:['<span class="given">Dane: U = 12 V, I = 0,4 A. Szukane: R</span>', 'Wzór: R = U / I', 'Podstawiamy: R = 12 V : 0,4 A', '<span class="ans">Odpowiedź: R = 30 Ω</span>']},
    {t:'Dwa oporniki, 10 Ω i 20 Ω, połączono szeregowo i podłączono do napięcia 6 V. Oblicz natężenie prądu i napięcie na każdym oporniku.', s:['<span class="given">Dane: R₁ = 10 Ω, R₂ = 20 Ω, U = 6 V. Szukane: I, U₁, U₂</span>', 'Opór zastępczy: R = R₁ + R₂ = 30 Ω', 'Natężenie: I = U / R = 6 V : 30 Ω = 0,2 A', 'Napięcia: U₁ = R₁ · I = 10 Ω · 0,2 A = 2 V, U₂ = 20 Ω · 0,2 A = 4 V', '<span class="ans">Odpowiedź: I = 0,2 A, U₁ = 2 V, U₂ = 4 V. Sprawdzenie: 2 V + 4 V = 6 V</span>']},
    {t:'Telewizor o mocy 100 W działa 5 godzin dziennie przez 30 dni. Ile energii zużyje i ile to będzie kosztować przy cenie 1 zł za 1 kWh?', s:['<span class="given">Dane: P = 100 W = 0,1 kW, t = 5 h · 30 = 150 h. Szukane: W, koszt</span>', 'Wzór: W = P · t', 'Podstawiamy: W = 0,1 kW · 150 h = 15 kWh', '<span class="ans">Odpowiedź: 15 kWh, czyli ok. 15 zł</span>']},
    {t:'Czajnik zasilany napięciem 230 V ma moc 2000 W. Jakie natężenie prądu pobiera? Czy można go włączyć razem z suszarką 1800 W, jeśli bezpiecznik ma 16 A?', s:['<span class="given">Dane: U = 230 V, P = 2000 W. Szukane: I</span>', 'Z wzoru P = U · I wynika I = P / U', 'Czajnik: I = 2000 W : 230 V ≈ 8,7 A. Suszarka: 1800 W : 230 V ≈ 7,8 A', 'Razem: 8,7 A + 7,8 A ≈ 16,5 A, czyli więcej niż 16 A', '<span class="ans">Odpowiedź: czajnik pobiera ok. 8,7 A. Razem z suszarką przekroczą 16 A i bezpiecznik może się wyłączyć.</span>']}];
  const box = $('tasks');
  T.forEach((it, i) => {
    const d = document.createElement('div'); d.className = 'q task';
    d.innerHTML = `<p>Zadanie ${i + 1}. ${it.t}</p><ol>${it.s.map(s => `<li hidden>${s}</li>`).join('')}</ol><div class="row"><button class="opt nx">Pokaż następny krok</button><button class="opt all">Pokaż całe rozwiązanie</button></div>`;
    const lis = [...d.querySelectorAll('li')], nx = d.querySelector('.nx'), al = d.querySelector('.all');
    const upd = () => { const shown = lis.filter(l => !l.hidden).length; nx.disabled = shown === lis.length; al.textContent = shown === lis.length ? 'Ukryj rozwiązanie' : 'Pokaż całe rozwiązanie'; };
    nx.onclick = () => { const l = lis.find(l => l.hidden); if (l) l.hidden = false; upd(); };
    al.onclick = () => { const full = lis.every(l => !l.hidden); lis.forEach(l => l.hidden = full); upd(); };
    box.appendChild(d);
  });
})();

/* ================== Krzyżówka ================== */
(function(){
  const KW = [
    ['BATERIA', 1, 'Kilka ogniw połączonych szeregowo.'],
    ['AMPEROMIERZ', 1, 'Przyrząd do pomiaru natężenia prądu.'],
    ['OPÓR', 1, 'Wielkość mierzona w omach. Mówi, jak bardzo przewodnik utrudnia przepływ prądu.'],
    ['ELEKTRON', 0, 'Cząstka o ładunku ujemnym, która płynie w metalach.'],
    ['PRZEWODNIK', 1, 'Materiał, który dobrze przewodzi prąd, np. miedź.']];
  const C = 1, grid = $('kwGrid'), clues = $('kwClues'), msg = $('kwMsg');
  const rows = KW.map(([w, key, clue], r) => {
    const row = document.createElement('div'); row.className = 'kwrow';
    row.innerHTML = `<span class="kwnum">${r + 1}.</span>` + '<span class="kwsp"></span>'.repeat(C - key);
    const cells = [...w].map((ch, i) => { const inp = document.createElement('input'); inp.className = 'kwcell' + (i === key ? ' key' : ''); inp.maxLength = 2; inp.autocomplete = 'off'; inp.setAttribute('aria-label', `Hasło ${r + 1}, litera ${i + 1}`); row.appendChild(inp); return inp; });
    grid.appendChild(row);
    const li = document.createElement('li'); li.textContent = clue + ` (${w.length} liter)`; clues.appendChild(li);
    return {w, cells};
  });
  const all = rows.flatMap(r => r.cells);
  function win(){ msg.textContent = 'Brawo! Hasło to AMPER, jednostka natężenia prądu.'; msg.style.color = 'var(--good)'; S.kwDone = true; all.forEach(c => c.classList.add('ok')); }
  all.forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      const v = inp.value.slice(-1).toLocaleUpperCase('pl'); inp.value = v; inp.classList.remove('ok', 'no');
      if (v && all[idx + 1]) all[idx + 1].focus();
      if (rows.every(r => r.cells.every((c, i) => c.value === r.w[i]))) win();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && all[idx - 1]) { all[idx - 1].focus(); e.preventDefault(); } });
  });
  $('kwCheck').onclick = () => {
    let bad = 0, empty = 0;
    rows.forEach(r => r.cells.forEach((c, i) => { c.classList.remove('ok', 'no'); if (!c.value) empty++; else if (c.value === r.w[i]) c.classList.add('ok'); else { c.classList.add('no'); bad++; } }));
    if (!bad && !empty) win(); else { msg.textContent = `Błędnych liter: ${bad}, pustych pól: ${empty}.`; msg.style.color = bad ? 'var(--bad)' : ''; }
  };
  $('kwShow').onclick = () => { rows.forEach(r => r.cells.forEach((c, i) => { c.value = r.w[i]; c.classList.remove('no'); c.classList.add('ok'); })); msg.textContent = 'Hasło: AMPER.'; msg.style.color = ''; };
  $('kwClear').onclick = () => { all.forEach(c => { c.value = ''; c.classList.remove('ok', 'no'); }); msg.textContent = ''; };
  S.kwType = (r, p) => { const R = rows[r]; R.cells.forEach((c, i) => { c.value = i < Math.ceil(p*R.w.length) ? R.w[i] : ''; }); };
  S.kwClear = () => $('kwClear').click();
})();

/* ================== Słowniczek ================== */
(function(){
  const T = [
    ['Prąd elektryczny', 'Uporządkowany ruch ładunków elektrycznych.'],
    ['Ładunek elektryczny', 'Właściwość cząstek, np. elektronów i protonów. Mierzymy go w kulombach (C).'],
    ['Elektron swobodny', 'Elektron w metalu, który nie jest związany z żadnym atomem i może się przemieszczać.'],
    ['Kierunek umowny prądu', 'Od bieguna dodatniego do ujemnego w obwodzie zewnętrznym. Elektrony płyną odwrotnie.'],
    ['Natężenie prądu', 'Ładunek przepływający przez przekrój przewodu w ciągu 1 s: I = q / t.'],
    ['Amper (A)', 'Jednostka natężenia prądu. 1 A = 1 C / 1 s.'],
    ['Napięcie elektryczne', 'Praca źródła przy przenoszeniu ładunku 1 C: U = W / q.'],
    ['Wolt (V)', 'Jednostka napięcia. 1 V = 1 J / 1 C.'],
    ['Opór elektryczny', 'Wielkość opisująca, jak przewodnik utrudnia przepływ prądu: R = U / I.'],
    ['Om (Ω)', 'Jednostka oporu. 1 Ω = 1 V / 1 A.'],
    ['Prawo Ohma', 'Natężenie prądu jest wprost proporcjonalne do napięcia (w stałej temperaturze).'],
    ['Opór właściwy', 'Wielkość zależna od materiału. Mówi, jak dobrze materiał przewodzi prąd.'],
    ['Przewodnik', 'Materiał, który dobrze przewodzi prąd, np. metale, grafit, roztwory soli.'],
    ['Izolator', 'Materiał, który nie przewodzi prądu, np. plastik, guma, szkło.'],
    ['Obwód elektryczny', 'Zamknięta droga dla prądu: źródło, przewody, odbiorniki i wyłącznik.'],
    ['Schemat', 'Rysunek obwodu wykonany za pomocą umownych symboli.'],
    ['Amperomierz', 'Przyrząd do pomiaru natężenia. Włączamy go szeregowo.'],
    ['Woltomierz', 'Przyrząd do pomiaru napięcia. Włączamy go równolegle.'],
    ['Ogniwo', 'Najprostsze źródło napięcia, np. bateria AA o napięciu 1,5 V.'],
    ['Akumulator', 'Źródło napięcia, które można wielokrotnie ładować.'],
    ['Połączenie szeregowe', 'Odbiorniki jeden za drugim. Natężenie wszędzie takie samo, napięcia się sumują.'],
    ['Połączenie równoległe', 'Każdy odbiornik ma własną gałąź. Napięcie wszędzie takie samo, natężenia się sumują.'],
    ['Moc', 'Praca wykonana w ciągu 1 s. Dla prądu: P = U · I. Jednostka: wat (W).'],
    ['Kilowatogodzina (kWh)', 'Jednostka energii. 1 kWh = 3 600 000 J.'],
    ['Bezpiecznik', 'Element, który przerywa obwód, gdy natężenie jest za duże.'],
    ['Zwarcie', 'Połączenie przewodów z pominięciem odbiornika. Natężenie gwałtownie rośnie.'],
    ['Wyłącznik różnicowoprądowy', 'Odcina prąd, gdy wykryje jego „ucieczkę”, np. przez ciało człowieka.'],
    ['Elektroliza', 'Rozkład substancji w roztworze pod wpływem prądu.']];
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
  const dl = $('gloss');
  const items = T.map(([t, d]) => { const w = document.createElement('div'); w.innerHTML = `<dt>${t}</dt><dd>${d}</dd>`; w.dataset.k = norm(t + ' ' + d); dl.appendChild(w); return w; });
  $('glQ').addEventListener('input', e => {
    const q = norm(e.target.value.trim()); let n = 0;
    items.forEach(w => { const ok = !q || w.dataset.k.includes(q); w.hidden = !ok; if (ok) n++; });
    $('glNone').hidden = n > 0;
  });
})();

/* ================== Gra: segregowanie ================== */
(function(){
  const items = [
    ['Mierzy je woltomierz', 'u', 'woltomierz mierzy napięcie.'], ['Jednostka: wolt', 'u', 'napięcie mierzymy w woltach.'], ['Gniazdko w domu: 230 …', 'u', 'w gniazdku jest napięcie 230 V.'], ['Bateria AA: 1,5 …', 'u', 'ogniwo AA ma napięcie 1,5 V.'],
    ['W połączeniu równoległym jest takie samo na każdym odbiorniku', 'u', 'w połączeniu równoległym napięcie jest wszędzie jednakowe.'], ['Praca źródła przy przenoszeniu ładunku 1 C', 'u', 'to definicja napięcia: U = W / q.'], ['W połączeniu szeregowym sumuje się na odbiornikach', 'u', 'U = U₁ + U₂.'],
    ['Mierzy je amperomierz', 'i', 'amperomierz mierzy natężenie.'], ['Jednostka: amper', 'i', 'natężenie mierzymy w amperach.'], ['Bezpiecznik 16 …', 'i', 'bezpiecznik wyłącza się przy natężeniu powyżej 16 A.'], ['Dioda LED: 20 m…', 'i', 'dioda pobiera prąd ok. 20 mA.'],
    ['W połączeniu szeregowym jest wszędzie takie samo', 'i', 'w obwodzie szeregowym natężenie jest jednakowe.'], ['Ładunek przepływający w ciągu 1 s', 'i', 'to definicja natężenia: I = q / t.'], ['Już ok. 30 m… przez ciało jest groźne', 'i', 'groźne jest natężenie ok. 30 mA.']];
  const pool = $('sgPool'), bins = [...document.querySelectorAll('.bin')], msg = $('sgMsg');
  let sel = null, mistakes = 0, done = 0, justDragged = false;
  const score = () => { $('sgScore').textContent = done === items.length ? `Gotowe! Liczba błędów: ${mistakes}` : `Ułożone: ${done} / ${items.length} · błędy: ${mistakes}`; S.sortDone = done === items.length; };
  const hit = (b, e) => { const r = b.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
  function place(card, bin){
    card.style.transform = ''; card.classList.remove('drag', 'sel'); sel = null;
    if (card.dataset.k === bin.dataset.bin) { bin.querySelector('.binbody').appendChild(card); card.classList.add('ok'); card.disabled = true; done++; msg.textContent = 'Dobrze: ' + card.dataset.w; msg.style.color = 'var(--good)'; }
    else { mistakes++; card.classList.remove('bad'); void card.offsetWidth; card.classList.add('bad'); msg.textContent = 'Nie tutaj. Zastanów się: czy chodzi o „siłę” źródła (napięcie), czy o ilość płynącego ładunku (natężenie)?'; msg.style.color = 'var(--bad)'; }
    score();
  }
  function attach(c){
    let sx = 0, sy = 0, moved = false, down = false;
    c.addEventListener('pointerdown', e => { if (c.disabled) return; down = true; moved = false; sx = e.clientX; sy = e.clientY; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (!moved && Math.hypot(dx, dy) > 6) { moved = true; c.classList.add('drag'); } if (moved) { c.style.transform = `translate(${dx}px,${dy}px)`; bins.forEach(b => b.classList.toggle('over', hit(b, e))); } });
    c.addEventListener('pointerup', e => { if (!down) return; down = false; bins.forEach(b => b.classList.remove('over')); if (moved) { justDragged = true; setTimeout(() => justDragged = false, 50); const b = bins.find(b => hit(b, e)); if (b) place(c, b); else { c.style.transform = ''; c.classList.remove('drag'); } } });
    c.addEventListener('pointercancel', () => { down = false; c.style.transform = ''; c.classList.remove('drag'); });
    c.addEventListener('click', e => { e.stopPropagation(); if (justDragged || c.disabled) return; if (sel === c) { c.classList.remove('sel'); sel = null; return; } if (sel) sel.classList.remove('sel'); sel = c; c.classList.add('sel'); msg.textContent = 'Wybrano: „' + c.textContent + '”. Teraz kliknij pojemnik.'; msg.style.color = ''; });
  }
  function build(){
    pool.innerHTML = ''; bins.forEach(b => b.querySelector('.binbody').innerHTML = ''); sel = null; mistakes = 0; done = 0; msg.textContent = '';
    items.slice().sort(() => Math.random() - .5).forEach(([t, k, w]) => { const c = document.createElement('button'); c.className = 'card-s'; c.textContent = t; c.dataset.k = k; c.dataset.w = w; pool.appendChild(c); attach(c); });
    score();
  }
  bins.forEach(b => { const go2 = () => { if (sel) place(sel, b); }; b.addEventListener('click', go2); b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go2(); } }); });
  S.sgBuild = build;
  $('sgReset').onclick = build; build();
})();

/* ================== Wyzwania ================== */
const pressed = (sel, key, val) => { const b = document.querySelector(sel + ' [aria-pressed="true"]'); return !!b && b.dataset[key] === val; };
const num = id => +$(id).value;
const CH = {
  'start': [['Ustaw napięcie 12 V i obserwuj dryf elektronów.', () => S.hero && S.hero.U === 12]],
  'prad-co': [['Sprawdź, co płynie w roztworze soli.', () => S.pcMode === 'sol'], ['Pokaż kierunek umowny prądu.', () => !!S.pcDir]],
  'przewodniki': [['Zbadaj wszystkie trzy rodzaje wody.', () => ['Woda z solą', 'Woda z kranu', 'Woda destylowana'].every(n => S.tsUser.has(n))]],
  'obwod': [['Zaświeć żarówkę.', () => S.ob && S.ob.on], ['Przetnij przewód, gdy wyłącznik jest włączony.', () => S.ob && S.ob.cut && S.ob.closed]],
  'symbole': [['Odkryj wszystkie 12 symboli.', () => S.symUser.size >= 12]],
  'natezenie': [['Ustaw natężenie 2 A i licz ładunek przez co najmniej 5 s.', () => S.ni && S.ni.I === 2 && S.ni.t > 5]],
  'amperomierz': [['Podłącz amperomierz źle i zobacz, co się stanie.', () => S.am && S.am.blown]],
  'natezenia': [['Kliknij błyskawicę na wykresie.', () => S.niPickUser === 'Błyskawica']],
  'jednostki': [['Wpisz własną wartość albo zmień jednostkę.', () => !!S.jnTyped]],
  'napiecie': [['Uzyskaj natężenie większe niż 4 A.', () => S.na && S.na.I > 4]],
  'zrodla': [['Zbuduj baterię 9 V.', () => S.zr && S.zr.U === 9], ['Ułóż ogniwa tak, żeby napięcia się zniosły.', () => S.zr && S.zr.U === 0 && S.zr.n > 1]],
  'woltomierz': [['Zmierz napięcie baterii.', () => S.vmUser && S.vm && Math.abs(S.vm.V) === 9], ['Zmierz 0 V między dwoma różnymi punktami.', () => S.vmUser && S.vm && S.vm.same]],
  'napiecia': [['Znajdź na wykresie napięcie w gniazdku.', () => S.nnPickUser === 'Gniazdko']],
  'ohm': [['Uzyskaj natężenie dokładnie 0,3 A.', () => S.oh && Math.abs(S.oh.I - 0.3) < 1e-9]],
  'charakterystyka': [['Zapisz co najmniej 5 pomiarów dla żarówki.', () => S.chUser && S.ch && S.ch.bulb >= 5]],
  'opor': [['Uzyskaj opór przewodu większy niż 20 Ω.', () => S.op && S.op.R > 20]],
  'szeregowe': [['Połącz 4 żarówki i wykręć jedną.', () => S.szUser && S.sz && S.sz.n === 4 && S.sz.anyRem]],
  'rownolegle': [['Spraw, żeby ze źródła płynęły 4 A.', () => S.rw && S.rw.I === 4]],
  'moc': [['Policz koszt pracy czajnika przez 1 h dziennie przez 30 dni.', () => S.mo && S.mo.dev === 'Czajnik' && Math.abs(S.mo.t - 1) < 0.05 && S.mo.days === 30]],
  'skutki': [['Zobacz wszystkie 4 skutki przy włączonym prądzie.', () => S.skSeen.size >= 4]],
  'bezpiecznik': [['Przeciąż instalację, aż wyłączy się bezpiecznik.', () => !!S.bzTrip['przeciążenie']], ['Wywołaj zwarcie.', () => !!S.bzTrip['zwarcie']]],
  'bezpieczenstwo': [['Sprawdź, co grozi przy gniazdku i mokrych rękach.', () => S.bs && S.bs.U === 230 && S.bs.wet]],
  'historia': [['Poznaj wszystkich odkrywców na osi czasu.', () => (S.tlClicks || 0) >= 7]],
  'segreguj': [['Ułóż wszystkie karty.', () => !!S.sortDone]],
  'zadania': [['Rozwiąż 3 losowe zadania z rzędu bez błędu.', () => (S.trStreak || 0) >= 3]],
  'krzyzowka': [['Rozwiąż całą krzyżówkę.', () => !!S.kwDone]]
};
let chDone = 0, chTotal = 0;
Object.entries(CH).forEach(([id, list]) => {
  const host = document.querySelector(`.slide[data-id="${id}"] .lab`) || document.querySelector(`.slide[data-id="${id}"] .text`);
  if (!host) return;
  const box = document.createElement('div'); box.className = 'challenges'; box.innerHTML = '<h4>Wyzwania</h4>';
  if (!host.classList.contains('lab')) box.style.marginTop = '18px';
  const ul = document.createElement('ul');
  list.forEach(c => { const li = document.createElement('li'); li.innerHTML = `<span class="mk" aria-hidden="true"></span><span class="ct">${c[0]}</span>`; c.li = li; c.done = false; ul.appendChild(li); chTotal++; });
  box.appendChild(ul); host.appendChild(box);
});
const updCh = () => { $('chCount').textContent = `★ ${chDone}/${chTotal}`; };
function checkCh(id){
  const list = CH[id]; if (!list) return;
  list.forEach(c => { if (c.done) return; let ok = false; try { ok = c[1](); } catch(e) {} if (ok) { c.done = true; c.li.classList.add('done'); chDone++; updCh(); } });
}
updCh();

/* ================== Pokaz automatyczny ================== */
const setVal = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new Event('input', {bubbles:true})); };
const chip = (sel, i) => () => { const b = document.querySelectorAll(sel + ' .chip')[i]; if (b) b.click(); };
const openWhy = (sid, i) => document.querySelectorAll(`.slide[data-id="${sid}"] details.why`).forEach((d, k) => d.open = k === i);
const rowOn = (sel, i) => document.querySelectorAll(sel).forEach((r, k) => r.classList.toggle('on', k === i));
const setCheck = (id, v) => { const c = $(id); c.checked = v; c.dispatchEvent(new Event('change')); };
const releaseHolds = () => {};
const ease = p => p < .5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2)/2;
const all = (...f) => () => f.forEach(x => x());
const whySteps = (sid, d) => [...document.querySelectorAll(`.slide[data-id="${sid}"] details.why`)].map((x, i) => ({d, run:() => openWhy(sid, i), cap:(x.classList.contains('sym') ? '' : x.querySelector('summary').textContent + '. ') + [...x.querySelectorAll('p')].map(p => p.textContent).join(' ')}));
const typeQ = (w, p) => { const q = $('glQ'); q.value = w.slice(0, Math.ceil(p*w.length)); q.dispatchEvent(new Event('input')); };
const infoCap = id => { const e = $(id); return [...e.childNodes].map(n => n.textContent.trim()).filter(Boolean).join('. '); };
const liSteps = (sel, d) => [...document.querySelectorAll(sel)].map((li, i) => ({d, run:() => rowOn(sel, i), cap:li.textContent}));

const DEMOS = {
  'start': {steps:[
    {d:4, run:() => setVal('hU', 0), cap:'Bez napięcia elektrony swobodne poruszają się chaotycznie. Tyle samo leci w lewo, co w prawo, więc prąd nie płynie.'},
    {d:3, tween:['hU', 0, 8], cap:'Podłączamy napięcie…'},
    {d:6, cap:'Elektrony zaczynają dryfować w stronę bieguna dodatniego. To jest prąd elektryczny!'},
    {d:3, tween:['hU', 8, 12], cap:'Większe napięcie: szybszy dryf i większy prąd.'},
    {d:3},
    {d:3, tween:['hU', 12, 0], cap:'Wyłączamy napięcie: znów tylko chaotyczny ruch.'}]},
  'prad-co': {steps:[
    {d:5, run:() => { chip('#pcMode', 0)(); setCheck('pcDir', false); }, cap:'W metalu płyną elektrony swobodne. Jony metalu stoją w miejscu.'},
    {d:5, run:() => setCheck('pcDir', true), cap:'Kierunek umowny prądu jest odwrotny: od + do −. Elektrony płyną od − do +.'},
    {d:6, run:chip('#pcMode', 1), cap:'W roztworze soli płyną jony: dodatnie do bieguna ujemnego, ujemne do dodatniego.'},
    {d:2, run:() => setCheck('pcDir', false)}]},
  'przewodniki': {steps:['Miedź: świetny przewodnik. Dlatego przewody robi się z miedzi.', 'Aluminium też dobrze przewodzi. Z aluminium robi się linie wysokiego napięcia.', 'Grafit z ołówka przewodzi, choć słabiej niż metale.', 'Woda z solą przewodzi, bo są w niej jony.', 'Woda z kranu przewodzi słabo. To jednak wystarczy, żeby była groźna przy 230 V!', 'Woda destylowana prawie nie przewodzi, bo nie ma w niej jonów.', 'Plastik to izolator. Dlatego przewody mają plastikową osłonę.', 'Guma to izolator.', 'Szkło to izolator.', 'Suche drewno to izolator. Mokre już przewodzi!'].map((c, i) => ({d:3.2, run:() => S.tsPick(i), cap:c}))},
  'obwod': {steps:[
    {d:3, run:() => { S.obSet(false, false, true); setCheck('obDir', false); }, cap:'Obwód otwarty: wyłącznik jest wyłączony, prąd nie płynie.'},
    {d:5, run:() => S.obSet(true, false, true), cap:'Zamykamy wyłącznik: obwód jest zamknięty, elektrony płyną i żarówka świeci.'},
    {d:4, run:() => setCheck('obDir', true), cap:'Strzałki pokazują kierunek umowny prądu: od + do −. Elektrony płyną odwrotnie.'},
    {d:4, run:() => S.obSet(true, true, true), cap:'Przecinamy przewód: obwód jest otwarty i prąd przestaje płynąć wszędzie naraz.'},
    {d:4, run:() => S.obSet(true, false, false), cap:'Bez żarówki obwód też jest przerwany.'},
    {d:2, run:() => { S.obSet(false, false, true); setCheck('obDir', false); }}]},
  'symbole': {steps:whySteps('symbole', 3.5)},
  'natezenie': {steps:[
    {d:6, run:() => setVal('niI', 1), cap:'Liczymy paczki ładunku przechodzące przez przekrój przewodu. Każda kropka to 0,5 C.'},
    {d:5, cap:'Co sekundę przechodzą 2 paczki, czyli 1 C. Natężenie: I = q / t = 1 A.'},
    {d:6, run:() => setVal('niI', 2), cap:'Dwa razy większe natężenie: w tym samym czasie przepływa dwa razy więcej ładunku.'},
    {d:5, run:() => setVal('niI', 0.5), cap:'Natężenie 0,5 A: przez przekrój przepływa pół kulomba na sekundę.'},
    {d:1, run:() => setVal('niI', 1)}]},
  'amperomierz': {steps:[
    {d:3, run:() => { S.amFix(); S.amSet('s', false); }, cap:'Amperomierz włączony szeregowo. Obwód jest jeszcze otwarty.'},
    {d:5, run:() => S.amSet('s', true), cap:'Zamykamy obwód: cały prąd płynie przez amperomierz, który pokazuje 0,3 A.'},
    {d:2, run:() => S.amSet('r', false), cap:'Teraz błąd: amperomierz równolegle do żarówki.'},
    {d:5, run:() => S.amSet('r', true), cap:'Zwarcie! Prąd omija żarówkę i płynie przez amperomierz, który ma bardzo mały opór. Przepala się bezpiecznik w mierniku.'},
    {d:3, run:() => { S.amFix(); S.amSet('s', false); }, cap:'Zapamiętaj: amperomierz zawsze szeregowo!'}]},
  'natezenia': {steps:[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({d:4, run:() => S.niSel(i), cap:() => infoCap('niInfo')}))},
  'jednostki': {steps:[...liSteps('#jnList li', 3.5),
    ...['Dioda LED: 20 mA to 0,02 A.', 'Zegarek: 2 µA to zaledwie 0,000 002 A.', 'Linia przesyłowa: 400 kV to 400 000 V.', 'Opornik: 4,7 kΩ to 4700 Ω.', 'Czajnik: 2 kW to 2000 W.'].map((c, i) => ({d:3.5, run:() => { rowOn('#jnList li', -1); chip('#jnPre', i)(); }, cap:c}))]},
  'napiecie': {steps:[
    {d:4, run:() => { setVal('naU', 6); setVal('naR', 6); }, cap:'Pompa podnosi wodę, a bateria „podnosi” ładunki. Napięcie jest jak różnica wysokości.'},
    {d:5, tween:['naU', 6, 12], cap:'Większe napięcie, czyli wyżej podniesiona woda: płynie więcej i natężenie rośnie.'},
    {d:4, tween:['naU', 12, 3], cap:'Małe napięcie: mały przepływ.'},
    {d:2, run:() => setVal('naU', 6)},
    {d:5, tween:['naR', 6, 18], cap:'Większy opór, czyli węższa rura: przy tym samym napięciu płynie mniej.'},
    {d:3, tween:['naR', 18, 6]},
    {d:3, tween:['naU', 6, 0], cap:'Bez napięcia nic nie płynie.'},
    {d:2, tween:['naU', 0, 6]}]},
  'zrodla': {steps:[
    {d:4, run:() => S.zrSet([1]), cap:'Jedno ogniwo: 1,5 V. Żarówka 4,5 V ledwo świeci.'},
    {d:3, run:() => S.zrSet([1, 1]), cap:'Dwa ogniwa szeregowo: 3 V.'},
    {d:4, run:() => S.zrSet([1, 1, 1]), cap:'Trzy ogniwa: 4,5 V. Żarówka świeci normalnie. Tak zbudowana jest płaska bateria.'},
    {d:4, run:() => S.zrSet([1, 1, -1]), cap:'Jedno ogniwo odwrócone: napięcia się odejmują i zostaje tylko 1,5 V.'},
    {d:4, run:() => S.zrSet([1, 1, 1, 1, 1, 1]), cap:'Sześć ogniw to 9 V. Za dużo dla żarówki 4,5 V: przepala się!'},
    {d:2, run:() => S.zrSet([1, 1, 1])}]},
  'woltomierz': {steps:[['A', 'E', 'Między A i E: napięcie całej baterii, 9 V.'], ['A', 'B', 'Na oporniku R₁ (1 kΩ) są 3 V.'], ['B', 'D', 'Na oporniku R₂ (2 kΩ) jest 6 V. Większy opór, większe napięcie. Razem 3 V + 6 V = 9 V.'], ['B', 'C', 'Punkty B i C łączy sam przewód: 0 V. Jak ptak na jednym przewodzie.'], ['D', 'E', 'Punkty D i E też: 0 V.']].map(([r, b, c]) => ({d:5, run:() => S.vmSet(r, b), cap:c}))},
  'napiecia': {steps:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({d:3.6, run:() => S.nnSel(i), cap:() => infoCap('nnInfo')}))},
  'ohm': {steps:[
    {d:3, run:() => { chip('#ohR', 1)(); setVal('ohU', 0); }, cap:'Opornik 20 Ω. Zwiększamy napięcie zasilacza…'},
    {d:6, tween:['ohU', 0, 12], cap:'Natężenie rośnie proporcjonalnie do napięcia. Punkt wędruje po prostej.'},
    {d:3, cap:'Przy 12 V płynie 0,6 A. U / I = 20 Ω, czyli tyle, ile wynosi opór opornika.'},
    {d:4, run:chip('#ohR', 0), cap:'Mniejszy opór, 10 Ω: przy tym samym napięciu płynie dwa razy większy prąd.'},
    {d:4, run:chip('#ohR', 2), cap:'Opór 40 Ω: prąd jest dwa razy mniejszy niż przy 20 Ω.'},
    {d:2, run:() => { chip('#ohR', 1)(); setVal('ohU', 6); }}]},
  'charakterystyka': {steps:[
    {d:2, run:() => { S.chClear(); S.chPick(0); setVal('chU', 0); }, cap:'Mierzymy natężenie przy różnych napięciach dla opornika 20 Ω.'},
    ...[2, 4, 6, 8, 10, 12].map(u => ({d:1.1, run:() => { setVal('chU', u); S.chSave(); }, cap:'Pomiar przy ' + u + ' V'})),
    {d:3.5, cap:'Punkty układają się na prostej przechodzącej przez zero: to prawo Ohma.'},
    {d:1, run:() => { S.chPick(2); setVal('chU', 0); }, cap:'Teraz żarówka.'},
    ...[2, 4, 6, 8, 10, 12].map(u => ({d:1.1, run:() => { setVal('chU', u); S.chSave(); }, cap:'Pomiar żarówki przy ' + u + ' V'})),
    {d:4, cap:'Wykres żarówki się wygina: rozgrzane włókno ma coraz większy opór.'}]},
  'opor': {steps:[
    {d:3, run:() => { S.opPick(1); setVal('opL', 1); setVal('opS', 1); }, cap:'Krótki, gruby przewód miedziany ma bardzo mały opór. Żarówka świeci jasno.'},
    {d:5, tween:['opL', 1, 10], cap:'Wydłużamy przewód: opór rośnie, ale w miedzi wciąż jest mały.'},
    {d:3, run:() => S.opPick(4), cap:'Zmieniamy materiał na nikielinę: opór rośnie ponad 20 razy i żarówka przygasa.'},
    {d:4, tween:['opS', 1, 0.1], cap:'Cieńszy przewód: opór rośnie jeszcze bardziej. Tak robi się grzałki i oporniki.'},
    {d:4, tween:['opS', 0.1, 2.5], cap:'Grubszy przewód: opór maleje.'},
    {d:2, run:() => { S.opPick(1); setVal('opL', 2); setVal('opS', 1); }}]},
  'szeregowe': {steps:[
    {d:3, run:() => S.szSet(1), cap:'Jedna żarówka: całe napięcie 12 V, płynie 1 A, świeci jasno.'},
    {d:4, run:() => S.szSet(2), cap:'Dwie żarówki szeregowo: napięcie dzieli się po 6 V, natężenie spada do 0,5 A. Obie świecą słabiej.'},
    {d:4, run:() => S.szSet(4), cap:'Cztery żarówki: po 3 V na każdej, płynie tylko 0,25 A.'},
    {d:4, run:() => S.szSet(4, [false, true, false, false]), cap:'Wykręcamy jedną żarówkę: obwód jest przerwany i gasną wszystkie!'},
    {d:2, run:() => S.szSet(2)}]},
  'rownolegle': {steps:[
    {d:3, run:() => S.rwSet(1), cap:'Jedna żarówka: 12 V, płynie 1 A.'},
    {d:4, run:() => S.rwSet(2), cap:'Dwie równolegle: każda ma pełne 12 V i świeci tak samo jasno. Ze źródła płyną 2 A.'},
    {d:4, run:() => S.rwSet(4), cap:'Cztery żarówki: każda dalej świeci jasno, a ze źródła płyną 4 A.'},
    {d:4, run:() => S.rwSet(4, [false, true, false, false]), cap:'Wykręcamy jedną: pozostałe świecą dalej, a natężenie spada do 3 A.'},
    {d:2, run:() => S.rwSet(2)}]},
  'polaczenia': {steps:[...document.querySelectorAll('.slide[data-id="polaczenia"] tbody tr')].map((r, i) => ({d:4.5, run:() => rowOn('.slide[data-id="polaczenia"] tbody tr', i), cap:r.cells[0].textContent + ': szeregowo ' + r.cells[1].textContent + '; równolegle ' + r.cells[2].textContent + '.'}))},
  'moc': {steps:[
    {d:4, run:() => { S.moPick(4); setVal('moT', 1); setVal('moD', 30); }, cap:'Czajnik 2000 W używany godzinę dziennie przez miesiąc zużywa 60 kWh, czyli ok. 60 zł.'},
    {d:4, run:() => S.moPick(0), cap:'Żarówka LED 8 W przez godzinę dziennie: tylko 0,24 kWh w miesiącu.'},
    {d:5, tween:['moT', 1, 8], cap:'Nawet 8 godzin dziennie to niecałe 2 kWh miesięcznie. Żarówki LED są bardzo oszczędne.'},
    {d:4, run:() => { S.moPick(5); setVal('moT', 1); }, cap:'Piekarnik 3000 W: duża moc, duże natężenie (ok. 13 A) i duże zużycie energii.'},
    {d:2, run:() => S.moPick(4)}]},
  'skutki': {steps:[0, 1, 2, 3].flatMap(k => [{d:1, run:() => S.skSet(k, false), cap:'Wyłączamy prąd i przygotowujemy kolejne doświadczenie.'}, {d:5, run:() => S.skSet(k, true), cap:['Skutek cieplny: grzałka się nagrzewa i rośnie temperatura.', 'Skutek świetlny: żarówka świeci.', 'Skutek magnetyczny: igła kompasu odchyla się, gdy płynie prąd. To doświadczenie Ørsteda.', 'Skutek chemiczny: na elektrodach wydzielają się pęcherzyki gazów.'][k]}])},
  'bezpiecznik': {steps:[
    {d:3, run:() => { S.bzReset(); S.bzSet([4, 5]); }, cap:'Telewizor i laptop: razem niecały 1 A. Wszystko w normie.'},
    {d:3, run:() => S.bzSet([4, 5, 0]), cap:'Włączamy czajnik: ok. 9,6 A.'},
    {d:3, run:() => S.bzSet([4, 5, 0, 1]), cap:'I suszarkę: już ponad 17 A. Przewody zaczynają się grzać…'},
    {d:4, run:() => S.bzSet([4, 5, 0, 1, 2]), cap:'Do tego żelazko: ponad 27 A! Bezpiecznik wyłącza prąd, żeby nie doszło do pożaru.'},
    {d:3, run:() => { S.bzReset(); S.bzSet([4, 5]); }, cap:'Wyłączamy część urządzeń i włączamy bezpiecznik ponownie.'},
    {d:4, run:() => S.bzShort(), cap:'Zwarcie: opór prawie zerowy, natężenie ogromne. Bezpiecznik wyłącza się prawie natychmiast.'},
    {d:2, run:() => S.bzReset()}]},
  'bezpieczenstwo': {steps:[
    {d:4, run:() => { rowOn('#bsList li', -1); S.bsSet(4.5, 100000); }, cap:'Bateria 4,5 V i sucha skóra: przez ciało płynie tylko ok. 0,05 mA. Nic nie czujemy.'},
    {d:4, run:() => S.bsSet(4.5, 1000), cap:'Mokra skóra ma znacznie mniejszy opór: 4,5 mA, czuć mrowienie.'},
    {d:4, run:() => S.bsSet(12, 1000), cap:'Akumulator 12 V i mokre ręce: 12 mA, skurcz mięśni.'},
    {d:5, run:() => S.bsSet(230, 1000), cap:'Gniazdko 230 V: ok. 230 mA. To śmiertelnie niebezpieczne!'},
    {d:5, run:() => S.bsSet(230, 100000), cap:'Nawet przy suchej skórze wysokie napięcie przebija skórę. Gniazdko zawsze jest groźne.'},
    ...liSteps('#bsList li', 3.5),
    {d:1, run:() => { rowOn('#bsList li', -1); S.bsSet(4.5, 100000); }}]},
  'historia': {steps:S.tlE.map((e, i) => ({d:7, run:() => S.tlSel(i), cap:e.y + ': ' + e.t + '. ' + e.n + '.'}))},
  'przyroda': {steps:whySteps('przyroda', 6)},
  'porownanie': {steps:[...document.querySelectorAll('.slide[data-id="porownanie"] tbody tr')].map((r, i) => ({d:4, run:() => rowOn('.slide[data-id="porownanie"] tbody tr', i), cap:r.cells[0].textContent + ': ' + [...r.cells].slice(1).map(c => c.textContent).join(' | ')}))},
  'segreguj': {loop:false, end:'Teraz Twoja kolej! Przeciągnij karty do pojemników.', steps:[
    {d:4, run:() => S.sgBuild(), cap:'Gra: każdą kartę trzeba wrzucić do pojemnika „napięcie” albo „natężenie”.'},
    {d:3, run:() => { const c = [...document.querySelectorAll('#sgPool .card-s')].find(c => c.dataset.k === 'i'); if (c) c.click(); }, cap:'Na przykład klikamy kartę…'},
    {d:3, run:() => document.querySelector('.bin[data-bin="i"]').click(), cap:'…i właściwy pojemnik. Zielona karta oznacza dobrą odpowiedź.'},
    {d:1, run:() => S.sgBuild()}]},
  'domowe': {steps:whySteps('domowe', 8)},
  'bledy': {steps:whySteps('bledy', 6)},
  'zadania': {loop:false, end:'Teraz Ty: wpisz wynik w treningu albo odsłaniaj kroki zadań.', steps:[
    {d:3, run:() => $('trNew').click(), cap:'Trening: komputer losuje zadanie.'},
    {d:3, anim:p => { const s = nv(S.trCur().a, 3); $('trIn').value = s.slice(0, Math.ceil(p*s.length)); }, cap:'Liczymy i wpisujemy wynik…'},
    {d:3, run:() => $('trCheck').click(), cap:'…i klikamy „Sprawdź”.'},
    ...[0, 1, 2, 3].map(k => ({d:2.5, run:() => { const b = document.querySelector('#tasks .task .nx'); if (b && !b.disabled) b.click(); }, cap:['Zadania z rozwiązaniem: najpierw zapisujemy dane.', 'Potem wzór.', 'Podstawiamy liczby.', 'I mamy odpowiedź.'][k]})),
    {d:1, run:() => { const b = document.querySelector('#tasks .task .all'); if (b && b.textContent.startsWith('Ukryj')) b.click(); }}]},
  'krzyzowka': {loop:false, end:'Teraz Ty: wpisz odpowiedzi w kratki. Litery w niebieskiej kolumnie utworzą hasło.', steps:[
    {d:3, run:() => S.kwClear(), cap:'Krzyżówka: każda odpowiedź to pojęcie z prezentacji.'},
    {d:3, anim:p => S.kwType(0, p), cap:'Na przykład hasło 1: kilka ogniw połączonych szeregowo to BATERIA.'},
    {d:3, cap:'Litera w niebieskiej kolumnie, A, to pierwsza litera hasła.'},
    {d:1, run:() => S.kwClear()}]},
  'podsumowanie': {steps:[...document.querySelectorAll('.slide[data-id="podsumowanie"] .card')].map((c, i) => ({d:4, run:() => rowOn('.slide[data-id="podsumowanie"] .card', i), cap:c.querySelector('h3').textContent + ': ' + c.querySelector('.formula').textContent + '. ' + c.querySelector('p').textContent}))},
  'slowniczek': {steps:[
    {d:3, cap:'Słowniczek zawiera wszystkie pojęcia z prezentacji.'},
    {d:2.5, anim:p => typeQ('amper', p), cap:'Wpisz szukane słowo, np. „amper”…'},
    {d:3, cap:'…a słowniczek pokaże pasujące pojęcia.'},
    {d:2.5, anim:p => typeQ('opór', p), cap:'Teraz szukamy słowa „opór”.'},
    {d:3},
    {d:1, run:() => typeQ('', 1)}]}
};

let demoOn = true, demo = null;
const demoBoxes = {};
Object.keys(DEMOS).forEach(id => {
  const sl = document.querySelector(`.slide[data-id="${id}"]`); if (!sl) return;
  const box = document.createElement('div'); box.className = 'demo'; box.setAttribute('aria-live', 'polite');
  box.innerHTML = '<span class="demo-dot" aria-hidden="true"></span><span class="demo-cap"></span><button class="chip demo-btn"></button>';
  const lab = sl.querySelector('.lab');
  if (lab) lab.prepend(box); else sl.querySelector('h2').after(box);
  box.querySelector('.demo-btn').onclick = () => { if (demo && demo.active && demo.id === id) demoStop(); else demoStart(id, true); };
  demoBoxes[id] = box;
});
function setCap(id, text, active){
  const b = demoBoxes[id]; if (!b) return;
  if (text != null) b.querySelector('.demo-cap').textContent = text;
  b.classList.toggle('on', !!active);
  b.querySelector('.demo-btn').textContent = active ? 'Zatrzymaj pokaz' : 'Powtórz pokaz';
}
const clearHL = () => { ['.slide[data-id="polaczenia"] tbody tr', '.slide[data-id="porownanie"] tbody tr', '.slide[data-id="podsumowanie"] .card', '#jnList li', '#bsList li'].forEach(s => rowOn(s, -1)); };
function demoStart(id, force){
  if (!DEMOS[id] || (!demoOn && !force)) { demo = null; setCap(id, 'Kliknij „Powtórz pokaz”, aby zobaczyć automatyczny pokaz.', false); return; }
  demo = {id, D:DEMOS[id], i:0, t:0, started:false, active:true};
  setCap(id, '', true);
}
function demoStop(msg){
  if (!demo) return;
  demo.active = false; clearHL();
  setCap(demo.id, msg || 'Pokaz zatrzymany. Teraz Ty! Kliknij „Powtórz pokaz”, aby obejrzeć go jeszcze raz.', false);
}
function demoTick(dt){
  if (!demo || !demo.active) return;
  const st = demo.D.steps[demo.i];
  if (!demo.started) {
    demo.started = true; demo.t = 0;
    try { st.run && st.run(); } catch(e) { console.error(e); }
    const c = typeof st.cap === 'function' ? st.cap() : st.cap;
    if (c) setCap(demo.id, c, true);
  }
  demo.t += dt;
  const p = Math.min(1, demo.t/st.d);
  try { if (st.tween) { const [id, a, b] = st.tween; setVal(id, a + (b - a)*ease(p)); } if (st.anim) st.anim(ease(p)); } catch(e) { console.error(e); }
  if (p >= 1) {
    demo.i++; demo.started = false;
    if (demo.i >= demo.D.steps.length) {
      if (demo.D.loop === false) { demo.active = false; setCap(demo.id, demo.D.end || 'Teraz Twoja kolej!', false); }
      else demo.i = 0;
    }
  }
}
let userTouched = false;
['pointerdown', 'keydown', 'input'].forEach(t => document.addEventListener(t, e => {
  if (!e.isTrusted) return;
  if (slides[cur].contains(e.target) && !e.target.closest('.demo')) userTouched = true;
  if (t === 'input' || !demo || !demo.active) return;
  if (t === 'keydown' && ['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key) && e.target.tagName !== 'INPUT') return;
  if (slides[cur].contains(e.target) && !e.target.closest('.demo')) demoStop();
}, true));
const demoBtn = $('demoBtn');
demoBtn.onclick = () => {
  demoOn = !demoOn;
  demoBtn.textContent = 'Pokaz automatyczny: ' + (demoOn ? 'wł.' : 'wył.'); demoBtn.setAttribute('aria-pressed', demoOn);
  if (demoOn) demoStart(ids[cur]); else demoStop('Pokaz automatyczny wyłączony. Kliknij „Powtórz pokaz”, aby go obejrzeć.');
};
onSlideChange = i => { userTouched = false; if (demo && demo.active) demoStop(); releaseHolds(); demoStart(ids[i]); };
onSlideChange(cur);

/* ================== Pętla animacji ================== */
const playBtn = $('playBtn');
const setPlay = v => { playing = v; playBtn.textContent = v ? 'Zatrzymaj symulacje' : 'Wznów symulacje'; playBtn.setAttribute('aria-pressed', v ? 'false' : 'true'); };
playBtn.onclick = () => setPlay(!playing);
setPlay(playing);
let last = performance.now(), colT = 0;
function loop(now){
  const dt = Math.min(0.033, (now - last)/1000); last = now;
  colT += dt; if (colT > 0.5) { colT = 0; refreshColors(); }
  if (playing) demoTick(dt);
  const f = sims[ids[cur]];
  if (f) { try { f(playing ? dt : 0, !playing); } catch(e) { console.error(e); } }
  if (userTouched && !(demo && demo.active)) checkCh(ids[cur]);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
