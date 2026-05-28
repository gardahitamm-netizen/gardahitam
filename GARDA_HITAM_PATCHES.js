// ================================================================
//  GARDA HITAM — PATCH v6
//  Fix: blank space hitam, hero stats terpotong, card overflow
//  Taruh SEBELUM </body> — HAPUS patch versi sebelumnya
// ================================================================
(function () {
  'use strict';

  // ── CSS FIX v6 ─────────────────────────────────────────────
  document.head.insertAdjacentHTML('beforeend', `<style id="gh-v6-fix">

  /* ── 1. LOCK VIEWPORT ── */
  html {
    height: 100% !important;
    overflow: hidden !important;
  }
  body {
    height: 100% !important;
    max-height: 100% !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* ── 2. TOPBAR STACK ── */
  .topbar      { flex-shrink: 0 !important; overflow: hidden !important; }
  .running-bar { flex-shrink: 0 !important; overflow: hidden !important; }
  .breadcrumb  { flex-shrink: 0 !important; overflow: hidden !important; }

  /* ── 3. PAGES WRAPPER ── */
  #pages-wrapper {
    flex: 1 1 0% !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* ── 4. PAGE BASE ── */
  .page {
    display: none !important;
    flex: none !important;
  }
  .page.active {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 0% !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    position: relative !important;
  }

  /* ── 5. PLANT PAGE ── */
  #page-plant.active {
    overflow: hidden !important;
  }
  #page-plant .global-search-wrap {
    flex-shrink: 0 !important;
  }
  .plant-wrap {
    flex: 1 1 0% !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }

  /* FIX: Plant hero stats — jangan overflow/terpotong */
  .plant-hero {
    flex-shrink: 0 !important;
    overflow: visible !important;
    padding-bottom: 24px !important;
  }
  .plant-stats-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
    overflow: visible !important;
  }
  .plant-stat-box {
    min-width: 100px !important;
    flex-shrink: 0 !important;
  }

  /* FIX: Plant grid cards — ukuran lebih compact */
 .plant-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
  gap: 12px !important;
  align-items: start !important;
}
  .plant-card {
    min-height: 0 !important;
  }
  .plant-card-name {
    font-size: 18px !important;
  }

  /* ── 6. MIXING PAGE ── */
  #page-mixing.active {
    overflow: hidden !important;
  }
  /* FIX: Mixing page — hero tidak boleh mengambil banyak space */
 .mixing-page-wrap {
  display: block !important;
  height: 100% !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  flex: none !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    display: block !important;        /* <-- FIX blank space: ubah dari flex ke block */
  }
  .mixing-hero {
    /* Pastikan hero tidak collapse atau hilang */
    display: block !important;
    flex-shrink: 0 !important;
    padding: 20px 24px 16px !important;
  }
  .mixing-section {
    display: block !important;
    padding: 16px 24px !important;
  }
  .mixing-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 8px !important;
  }

  /* ── 7. DETAIL PAGE ── */
  #page-detail.active {
    overflow: hidden !important;
  }
  .detail-back-row { flex-shrink: 0 !important; }
  .content-area {
    flex: 1 1 0% !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }
  .content-tabs { flex-shrink: 0 !important; overflow-x: auto !important; }
  .search-wrap  { flex-shrink: 0 !important; }

  /* ── 8. TAB CONTENTS ── */
  .tab-content {
    display: none !important;
    flex: none !important;
  }
  .tab-content.active {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 0% !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  /* Tab dengan inner scroll area */
  #tab-histori.active,
  #tab-manual.active,
  #tab-pool.active {
    overflow-y: hidden !important;
    padding: 0 !important;
  }
  .histori-scroll-area,
  .manual-scroll-area,
  .pool-scroll-area {
    flex: 1 1 0% !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }
  .pool-selector-row { flex-shrink: 0 !important; }
  .pool-hero         { flex-shrink: 0 !important; }
  .plant-switcher-bar { flex-shrink: 0 !important; }

  /* ── 9. MOBILE ── */
  @media (max-width: 768px) {
    html, body {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    .plant-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
      gap: 8px !important;
    }
    .mixing-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
    }
    .plant-stat-box {
      min-width: 80px !important;
      padding: 8px 10px !important;
    }
    .plant-stat-val {
      font-size: 14px !important;
    }
  }
  </style>`);


  // ================================================================
  //  FIX renderMixingPage — root cause blank space
  //  Masalah: mixing-page-wrap pakai display:flex tapi child
  //  (hero + section) tidak punya flex properties yang benar,
  //  sehingga ada gap kosong besar.
  //  Solusi: override renderMixingPage agar tidak bergantung flex
  // ================================================================
  const _origRenderMixingPage = window.renderMixingPage;
  window.renderMixingPage = async function () {
    // Pastikan wrap pakai display:block (bukan flex)
    const wrap = document.querySelector('.mixing-page-wrap');
    if (wrap) {
      wrap.style.display = 'block';
      wrap.style.overflowY = 'auto';
    }
    if (typeof _origRenderMixingPage === 'function') {
      return _origRenderMixingPage.apply(this, arguments);
    }
  };


  // ================================================================
  //  FIX renderDetailPage — root cause blank space di detail
  //  Masalah: content-area kadang tidak resize setelah tab switch
  // ================================================================


  // ================================================================
  //  renderPlantPage: WS Boveri card + stat clickable
  // ================================================================
  window.renderPlantPage = async function () {
    const el = document.getElementById('plant-content');
    el.innerHTML = '<div class="state-box"><div class="sp"></div><p>Memuat plant...</p></div>';
    try {
      const data = await apiGet({ action: 'getPlants' });
      document.getElementById('stat-total').textContent = data.plants.length;
      document.getElementById('stat-sync').textContent = new Date().toTimeString().slice(0, 5);

      const canAll = typeof canAccessAllPlants === 'function' ? canAccessAllPlants() : true;
      const plants = canAll
        ? data.plants
        : data.plants.filter(p => p.plant === S.loggedInPlant);

      // ABW cards
      const abwMap = {};
      plants.forEach(p => {
        const pools = (typeof getPoolSheets === 'function') ? getPoolSheets(p.plant) : [];
        const abw = pools.find(x => x.startsWith('abw'));
        if (abw) { if (!abwMap[abw]) abwMap[abw] = []; abwMap[abw].push(p.plant); }
      });
      const abwCards = Object.keys(abwMap)
        .map((a, i) => (typeof abwCard === 'function') ? abwCard(a, abwMap[a], plants.length + i) : '')
        .join('');

      // WS Boveri card
      const wbIdx = plants.length + Object.keys(abwMap).length;
      const wbCard = `<div class="plant-card" onclick="navToPool('MCG','ws_boveri')"
        style="animation-delay:${wbIdx * 0.06}s;border-color:rgba(255,184,32,.45);">
        <div class="plant-card-top" style="background:linear-gradient(135deg,rgba(255,184,32,.12),rgba(255,184,32,.04))">
          <div class="plant-card-corner" style="background:#ffb820;box-shadow:0 0 10px rgba(255,184,32,.7)"></div>
          <div class="plant-card-id">POOL · SHARED GLOBAL</div>
          <div class="plant-card-name" style="color:#ffb820;font-family:'JetBrains Mono',monospace;font-size:16px">🟡 WS Boveri</div>
          <div class="plant-card-desc">Spare Workshop Boveri — Shared semua plant</div>
          <div style="margin-top:8px">
            <span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;padding:3px 9px;border-radius:10px;background:rgba(255,184,32,.15);color:#ffb820;border:1px solid rgba(255,184,32,.4)">
              MCA · MCC · MCD · MCG · MCH · MCI · PLANT E
            </span>
          </div>
        </div>
        <div class="plant-card-bottom" style="background:rgba(255,184,32,.05)">
          <span id="wb-count" class="plant-card-tag" style="background:rgba(255,184,32,.15);border-color:rgba(255,184,32,.4);color:#ffb820">⟳ Memuat...</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:9px;background:rgba(0,224,248,.1);color:#00e0f8;border:1px solid rgba(0,224,248,.25);padding:2px 7px;border-radius:4px">MASTER: MCG</span>
          <span class="plant-card-arr" style="color:#ffb820">→</span>
        </div>
      </div>`;

      el.innerHTML = `<div class="plant-grid">
        ${plants.map((p, i) => (typeof plantCard === 'function') ? plantCard(p, i) : '').join('')}
        ${abwCards}
        ${wbCard}
      </div>`;

      // Load mixing counts
      await Promise.all(plants.map(async p => {
        try {
          if (!S.cache[p.plant + '_groupList']) {
            const res = await apiGet({ action: 'getDrives', plant: p.plant });
            const drives = Array.isArray(res.drives) ? res.drives : [];
            S.cache[p.plant + '_drives'] = drives;
            const seen = [], groups = [];
            drives.forEach(d => {
              const g = String(d.group || '').trim();
              if (g && !seen.includes(g)) { seen.push(g); groups.push(g); }
            });
            S.cache[p.plant + '_groupList'] = groups;
          }
          const gl = S.cache[p.plant + '_groupList'] || [];
          const tagEl = document.getElementById('mix-tag-' + p.plant);
          if (tagEl && gl.length) tagEl.textContent = gl.length + ' Mixing';
        } catch (e) { }
      }));

      // WS Boveri count
      try {
        const wd = await apiGet({ action: 'getPool', plant: 'MCG', pool: 'ws_boveri' });
        const wb = document.getElementById('wb-count');
        if (wb) wb.textContent = '🟡 ' + (wd.items || []).length + ' Drive Spare';
        S.cache['MCG_pool_ws_boveri'] = wd.items || [];
      } catch (e) {
        const wb = document.getElementById('wb-count');
        if (wb) wb.textContent = '🟡 WS Boveri';
      }

    } catch (err) {
      el.innerHTML = `<div class="state-box">
        <div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3>
        <p>${err.message}</p>
        <button class="btn-retry" onclick="renderPlantPage()">Coba Lagi</button>
      </div>`;
    }
  };


  // ================================================================
  //  renderSummaryTab: dengan breakdown INU/DSU/tipe
  // ================================================================
  window.renderSummaryTab = async function () {
    if (typeof renderSwitcherBar === 'function') renderSwitcherBar('summary', S.plant);

    const el = document.getElementById('summary-content');
    if (!el) return;
    el.innerHTML = '<div class="state-box"><div class="sp"></div><p>Memuat summary...</p></div>';

    try {
      const data = await apiGet({ action: 'getSummaryKosong', plant: S.plant });
      const rows        = data.summary   || [];
      const totalKosong = data.totalKosong || 0;
      const totalDrive  = data.totalDrive  || 0;
      const adaKosong   = rows.filter(r => r.kosong > 0);
      const bersih      = rows.filter(r => r.kosong === 0).length;

      let allDrives = S.cache[S.plant + '_drives'] || [];
      if (!allDrives.length) {
        try {
          const dd = await apiGet({ action: 'getDrives', plant: S.plant });
          allDrives = Array.isArray(dd.drives) ? dd.drives : [];
          S.cache[S.plant + '_drives'] = allDrives;
        } catch (e) { }
      }

      const isINU = id => /[._-]INU([._-]|$)/i.test(String(id));
      const isDSU = id => /[._-]DSU([._-]|$)/i.test(String(id));
      const TIPES = ['ACS880','ACS800','ACS580','ACS550','ACS355','ACS150','DCS880','DCS800'];
      const getTipe = d => {
        const sp = String((d.spesifikasi||'') + ' ' + (d.merk||'')).toUpperCase();
        return TIPES.find(t => sp.includes(t)) || 'LAINNYA';
      };
      const COLORS = {
        ACS880: { c:'#00f0a0', bg:'rgba(0,240,160,.12)',  bd:'rgba(0,240,160,.35)'  },
        ACS800: { c:'#4d9fff', bg:'rgba(77,159,255,.12)', bd:'rgba(77,159,255,.35)' },
        ACS580: { c:'#ffb820', bg:'rgba(255,184,32,.12)', bd:'rgba(255,184,32,.35)' },
        ACS550: { c:'#c084fc', bg:'rgba(192,132,252,.12)',bd:'rgba(192,132,252,.35)'},
        ACS355: { c:'#f472b6', bg:'rgba(244,114,182,.12)',bd:'rgba(244,114,182,.35)'},
        ACS150: { c:'#fb923c', bg:'rgba(251,146,60,.12)', bd:'rgba(251,146,60,.35)' },
        DCS880: { c:'#00e0f8', bg:'rgba(0,224,248,.10)', bd:'rgba(0,224,248,.30)'  },
        DCS800: { c:'#38bdf8', bg:'rgba(56,189,248,.10)',bd:'rgba(56,189,248,.30)' },
        LAINNYA:{ c:'#9fc3e8', bg:'rgba(159,195,232,.08)',bd:'rgba(159,195,232,.25)'},
      };
      const getC = t => COLORS[t] || COLORS.LAINNYA;

      const tipeBadges = drives => {
        if (!drives.length) return '<span style="color:var(--muted)">—</span>';
        const cnt = {};
        drives.forEach(d => { const t = getTipe(d); cnt[t] = (cnt[t]||0) + 1; });
        return Object.entries(cnt).map(([t,n]) => {
          const c = getC(t);
          return `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin:1px;display:inline-block;background:${c.bg};color:${c.c};border:1px solid ${c.bd}">${t}×${n}</span>`;
        }).join('');
      };

      const allK = [];
      adaKosong.forEach(r => {
        allDrives
          .filter(d => String(d.group||'').trim() === r.group && (!d.status || d.status === 'kosong'))
          .forEach(d => allK.push(d));
      });

      let breakdownHTML = '';
      if (allK.length) {
        const tot  = allK.length;
        const inuN = allK.filter(d => isINU(d.drive_id)).length;
        const dsuN = allK.filter(d => isDSU(d.drive_id)).length;
        const othN = tot - inuN - dsuN;
        const cnt  = {};
        allK.forEach(d => { const t = getTipe(d); cnt[t] = (cnt[t]||0) + 1; });

        const bar = (pct, clr) =>
          `<div style="flex:1;background:var(--surf3);border-radius:3px;height:5px;overflow:hidden">
             <div style="width:${pct}%;height:5px;background:${clr}"></div>
           </div>`;

        const unitRow = (lbl, n, clr, bg, bd) => n > 0 ? `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;background:${bg};color:${clr};border:1px solid ${bd};padding:3px 10px;border-radius:5px;min-width:52px;text-align:center">${lbl}</span>
            ${bar(Math.round(n/tot*100), clr)}
            <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:${clr}">${n}</span>
          </div>` : '';

        const tipeRowsHTML = Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([t,n]) => {
          const c = getC(t), p = Math.round(n/tot*100);
          return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(31,48,80,.4)">
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;min-width:72px;padding:3px 8px;border-radius:5px;text-align:center;background:${c.bg};color:${c.c};border:1px solid ${c.bd}">${t}</span>
            ${bar(p, c.c)}
            <span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:800;color:${c.c};min-width:24px;text-align:right">${n}</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);min-width:30px">${p}%</span>
          </div>`;
        }).join('');

        breakdownHTML = `
          <div style="background:var(--surf);border:1px solid rgba(126,184,232,.3);border-radius:14px;overflow:hidden;margin-bottom:20px;border-top:3px solid var(--kosong)">
            <div style="display:flex;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid var(--border);background:rgba(126,184,232,.06)">
              <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--kosong)">🔍 BREAKDOWN DRIVE KOSONG</span>
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);background:var(--surf2);border:1px solid var(--border);padding:3px 10px;border-radius:10px;margin-left:auto">Total ${tot} slot kosong</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
              <div style="padding:14px 18px;border-right:1px solid var(--border)">
                <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">⚡ Jenis Unit</div>
                ${unitRow('INU', inuN, 'var(--accent)','var(--accent-bg)','var(--accent-bd)')}
                ${unitRow('DSU', dsuN, '#c084fc','rgba(192,132,252,.12)','rgba(192,132,252,.35)')}
                ${unitRow('LAIN', othN, 'var(--muted)','var(--surf2)','var(--border)')}
              </div>
              <div style="padding:14px 18px">
                <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">🔌 Tipe Drive</div>
                ${tipeRowsHTML}
              </div>
            </div>
          </div>`;
      }

      let html = `<div class="summary-stats">
        <div class="sum-stat"><div class="sum-stat-label">Drive Kosong</div><div class="sum-stat-val kosong">${totalKosong}</div></div>
        <div class="sum-stat"><div class="sum-stat-label">Terdampak</div><div class="sum-stat-val" style="color:var(--maint)">${adaKosong.length}</div></div>
        <div class="sum-stat"><div class="sum-stat-label">Bersih</div><div class="sum-stat-val ok">${bersih}</div></div>
        <div class="sum-stat"><div class="sum-stat-label">Total Drive</div><div class="sum-stat-val accent">${totalDrive}</div></div>
      </div>`;

      if (!adaKosong.length) {
        html += `<div class="state-box"><div style="font-size:36px">✅</div><h3>Semua Drive Terisi</h3><p>Tidak ada drive kosong di ${S.plant}</p></div>`;
      } else {
        html += breakdownHTML;
        html += `<div class="summary-panel">
          <div class="summary-panel-head">
            <div class="summary-panel-title">⬜ Mixing dengan Drive Kosong</div>
            <div class="summary-panel-count">${adaKosong.length} dari ${rows.length} mixing</div>
          </div>
          <div style="overflow-x:auto"><table class="sum-table">
            <thead><tr><th>Mixing</th><th>Kosong</th><th>INU ⬜</th><th>DSU ⬜</th><th>Tipe Kosong</th><th>Total</th><th>%</th></tr></thead>
            <tbody>${adaKosong.map(r => {
              const pct  = Math.round(r.kosong / r.total * 100);
              const gk   = allDrives.filter(d => String(d.group||'').trim() === r.group && (!d.status || d.status === 'kosong'));
              const inuK = gk.filter(d => isINU(d.drive_id)).length;
              const dsuK = gk.filter(d => isDSU(d.drive_id)).length;
              return `<tr>
                <td><div class="sum-group-name">${r.group}</div></td>
                <td><span class="sum-kosong-badge">⬜ ${r.kosong}</span></td>
                <td>${inuK > 0 ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent-bd);padding:2px 8px;border-radius:4px">INU ${inuK}</span>` : '<span style="color:var(--muted)">—</span>'}</td>
                <td>${dsuK > 0 ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#c084fc;background:rgba(192,132,252,.12);border:1px solid rgba(192,132,252,.35);padding:2px 8px;border-radius:4px">DSU ${dsuK}</span>` : '<span style="color:var(--muted)">—</span>'}</td>
                <td>${tipeBadges(gk)}</td>
                <td><span class="sum-zero">${r.total}</span></td>
                <td><div class="sum-pct-bar"><div class="sum-bar-track"><div class="sum-bar-fill" style="width:${pct}%"></div></div><span class="sum-pct-txt">${pct}%</span></div></td>
              </tr>`;
            }).join('')}</tbody>
          </table></div>
        </div>`;

        html += `<div class="summary-panel">
          <div class="summary-panel-head">
            <div class="summary-panel-title">📋 Semua Mixing</div>
            <div class="summary-panel-count">${rows.length} mixing</div>
          </div>
          <div style="overflow-x:auto"><table class="sum-table">
            <thead><tr><th>Mixing</th><th>OK</th><th>Kosong</th><th>Fault</th><th>Maint</th><th>Total</th></tr></thead>
            <tbody>${rows.map(r => `<tr>
              <td><div class="sum-group-name">${r.group}</div></td>
              <td style="color:${r.ok>0?'var(--ok)':'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.ok}</td>
              <td>${r.kosong>0?`<span class="sum-kosong-badge">⬜ ${r.kosong}</span>`:'<span class="sum-zero">0</span>'}</td>
              <td style="color:${r.fault>0?'var(--fault)':'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.fault}</td>
              <td style="color:${r.maint>0?'var(--maint)':'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.maint}</td>
              <td class="sum-zero">${r.total}</td>
            </tr>`).join('')}</tbody>
          </table></div>
        </div>`;
      }

      el.innerHTML = html;

    } catch (err) {
      el.innerHTML = `<div class="state-box">
        <div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3>
        <p>${err.message}</p>
        <button class="btn-retry" onclick="renderSummaryTab()">Coba Lagi</button>
      </div>`;
    }
  };

  console.log('[GH-PATCH v6] loaded OK');
})();
