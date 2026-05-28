// ================================================================
//  GARDA HITAM — PATCH FILE
//  Apply sebelum closing </body> tag di index HTML utama
//  
//  FIX 1: Bug potongan kosong di hero sections
//  FIX 2: WS Boveri card di plant list
//  FIX 3: Summary detail — tipe drive & unit type breakdown
// ================================================================

(function applyPatches() {
  'use strict';

  // ════════════════════════════════════════════════════════════
  //  FIX 1: HERO SECTIONS — Hapus ruang kosong
  //  Problem: .plant-hero, .mixing-hero, .detail-back-row punya 
  //  area kosong besar karena overflow hidden + padding berlebih
  // ════════════════════════════════════════════════════════════
  const heroFixCSS = `
    /* FIX 1: Hero sections — kurangi empty space */
    .plant-hero {
      padding: 20px 28px 18px !important;
    }
    .mixing-hero {
      padding: 16px 28px 14px !important;
    }
    /* Hilangkan min-height implicit dari pseudo-elements */
    .plant-hero::before,
    .mixing-hero::before {
      pointer-events: none;
    }
    /* Fix: pastikan page wrapper tidak overflow */
    #page-plant,
    #page-mixing,
    #page-detail {
      overflow: hidden !important;
    }
    /* Fix: plant-wrap & mixing-page-wrap scroll dengan benar */
    .plant-wrap,
    .mixing-page-wrap {
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    /* Fix: hero sections tidak boleh ada blank space dari grid overlay */
    .plant-hero-grid,
    .mixing-hero-grid {
      pointer-events: none;
      z-index: 0;
    }
    .plant-hero-badge,
    .plant-hero-title,
    .plant-hero-sub,
    .plant-stats-row,
    .mixing-hero-plant,
    .mixing-hero-title,
    .mixing-hero-sub {
      position: relative;
      z-index: 1;
    }
    /* Fix running bar agar tidak double-space */
    .running-bar {
      overflow: hidden !important;
    }
    /* Fix: hapus height berlebih di detail header area */
    .detail-back-row {
      padding: 8px 16px !important;
      min-height: unset !important;
    }
  `;

  const fixStyle = document.createElement('style');
  fixStyle.id = 'gh-patch-fix1';
  fixStyle.textContent = heroFixCSS;
  document.head.appendChild(fixStyle);


  // ════════════════════════════════════════════════════════════
  //  FIX 2: WS BOVERI CARD DI PLANT LIST
  //  Tambah card dedicated untuk ws_boveri (shared pool)
  //  yang bisa diklik langsung ke pool ws_boveri dari MCG
  // ════════════════════════════════════════════════════════════

  // Override fungsi renderPlantPage untuk inject ws_boveri card
  const _origRenderPlantPage = window.renderPlantPage;

  window.renderPlantPage = async function () {
    const el = document.getElementById('plant-content');
    el.innerHTML = `<div class="state-box"><div class="sp"></div><p>Memuat plant...</p></div>`;
    try {
      const data = await window.apiGet({ action: 'getPlants' });
      document.getElementById('stat-total').textContent = data.plants.length;
      document.getElementById('stat-sync').textContent = new Date().toTimeString().slice(0, 5);

      const canAll = window.canAccessAllPlants ? window.canAccessAllPlants() : true;
      const plants = canAll
        ? data.plants
        : data.plants.filter(p => p.plant === window.S.loggedInPlant);

      // ABW cards (existing logic)
      const abwMap = {};
      plants.forEach(p => {
        const pools = window.getPoolSheets(p.plant);
        const abw = pools.find(x => x.startsWith('abw'));
        if (abw) {
          if (!abwMap[abw]) abwMap[abw] = [];
          abwMap[abw].push(p.plant);
        }
      });

      const abwCards = Object.keys(abwMap)
        .map((abw, i) => window.abwCard(abw, abwMap[abw], plants.length + i))
        .join('');

      // WS Boveri card — NEW
      const wsBoveriCard = buildWsBoveriCard(plants.length + Object.keys(abwMap).length);

      el.innerHTML = `<div class="plant-grid">
        ${plants.map((p, i) => window.plantCard(p, i)).join('')}
        ${abwCards}
        ${wsBoveriCard}
      </div>`;

      // Load group counts
      await Promise.all(plants.map(async p => {
        try {
          if (!window.S.cache[p.plant + '_groupList']) {
            const res = await window.apiGet({ action: 'getDrives', plant: p.plant });
            const drives = Array.isArray(res.drives) ? res.drives : (Array.isArray(res) ? res : []);
            window.S.cache[p.plant + '_drives'] = drives;
            const seen = [], groups = [];
            drives.forEach(d => {
              const g = String(d.group || '').trim();
              if (g && !seen.includes(g)) { seen.push(g); groups.push(g); }
            });
            window.S.cache[p.plant + '_groupList'] = groups;
          }
          const gl = window.S.cache[p.plant + '_groupList'] || [];
          const tagEl = document.getElementById('mix-tag-' + p.plant);
          if (tagEl && gl.length) tagEl.textContent = gl.length + ' Mixing';
        } catch (e) {}
      }));

      // Load WS Boveri count
      loadWsBoveriCount();

    } catch (err) {
      el.innerHTML = `<div class="state-box"><div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3><p>${err.message}</p><button class="btn-retry" onclick="renderPlantPage()">Coba Lagi</button></div>`;
    }
  };

  function buildWsBoveriCard(idx) {
    return `
      <div class="plant-card" id="ws-boveri-card" onclick="navToPool('MCG','ws_boveri')" 
           style="animation-delay:${idx * 0.06}s;border-color:rgba(255,184,32,.4);background:linear-gradient(135deg,rgba(255,184,32,.06),rgba(255,184,32,.02))">
        <div class="plant-card-top" style="background:linear-gradient(135deg,rgba(255,184,32,.10),rgba(255,184,32,.04))">
          <div class="plant-card-corner" style="background:#ffb820;box-shadow:0 0 10px #ffb820aa"></div>
          <div class="plant-card-id">POOL · SHARED GLOBAL</div>
          <div class="plant-card-name" style="color:#ffb820;font-family:'JetBrains Mono',monospace;font-size:17px">🟡 WS Boveri</div>
          <div class="plant-card-desc">Spare Workshop Boveri — Shared semua plant</div>
          <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
                         padding:3px 9px;border-radius:10px;background:rgba(255,184,32,.15);
                         color:#ffb820;border:1px solid rgba(255,184,32,.4)">
              MCA · MCC · MCD · MCG · MCH · MCI · PLANT E
            </span>
          </div>
        </div>
        <div class="plant-card-bottom" style="background:rgba(255,184,32,.05)">
          <span class="plant-card-tag" style="background:rgba(255,184,32,.15);border-color:rgba(255,184,32,.4);color:#ffb820" 
                id="ws-boveri-count-badge">⟳ Memuat...</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:9px;
                       background:rgba(0,224,248,.1);color:#00e0f8;border:1px solid rgba(0,224,248,.25);
                       padding:2px 7px;border-radius:4px">MASTER: MCG</span>
          <span class="plant-card-arr" style="color:#ffb820">→</span>
        </div>
      </div>`;
  }

  async function loadWsBoveriCount() {
    try {
      const data = await window.apiGet({ action: 'getPool', plant: 'MCG', pool: 'ws_boveri' });
      const items = data.items || [];
      const badge = document.getElementById('ws-boveri-count-badge');
      if (badge) {
        badge.textContent = `🟡 ${items.length} Drive Spare`;
      }
      // Cache for later use
      window.S.cache['MCG_pool_ws_boveri'] = items;
    } catch (e) {
      const badge = document.getElementById('ws-boveri-count-badge');
      if (badge) badge.textContent = '🟡 WS Boveri';
    }
  }


  // ════════════════════════════════════════════════════════════
  //  FIX 3: SUMMARY DETAIL — Tipe Drive & Unit Type Breakdown
  //  Ketika ada drive kosong, tampilkan breakdown:
  //  - Tipe: ACS880, ACS800, dll
  //  - Unit: INU, DSU
  // ════════════════════════════════════════════════════════════

  // Override renderSummaryTab
  const _origRenderSummaryTab = window.renderSummaryTab;

  window.renderSummaryTab = async function () {
    // Render switcher bar
    if (window.renderSwitcherBar) window.renderSwitcherBar('summary', window.S.plant);

    const el = document.getElementById('summary-content');
    el.innerHTML = `<div class="state-box"><div class="sp"></div><p>Memuat summary...</p></div>`;

    try {
      const data = await window.apiGet({ action: 'getSummaryKosong', plant: window.S.plant });
      const rows = data.summary || [];
      const totalKosong = data.totalKosong || 0;
      const totalDrive = data.totalDrive || 0;
      const adaKosong = rows.filter(r => r.kosong > 0);
      const bersih = rows.filter(r => r.kosong === 0).length;

      // Get drive data for breakdown analysis
      let allDrives = window.S.cache[window.S.plant + '_drives'] || [];
      if (!allDrives.length) {
        try {
          const dData = await window.apiGet({ action: 'getDrives', plant: window.S.plant });
          allDrives = Array.isArray(dData.drives) ? dData.drives : [];
          window.S.cache[window.S.plant + '_drives'] = allDrives;
        } catch (e) {}
      }

      let html = `
        <div class="summary-stats">
          <div class="sum-stat"><div class="sum-stat-label">Drive Kosong</div><div class="sum-stat-val kosong">${totalKosong}</div></div>
          <div class="sum-stat"><div class="sum-stat-label">Terdampak</div><div class="sum-stat-val" style="color:var(--maint)">${adaKosong.length}</div></div>
          <div class="sum-stat"><div class="sum-stat-label">Bersih</div><div class="sum-stat-val ok">${bersih}</div></div>
          <div class="sum-stat"><div class="sum-stat-label">Total Drive</div><div class="sum-stat-val accent">${totalDrive}</div></div>
        </div>`;

      if (!adaKosong.length) {
        html += `<div class="state-box"><div style="font-size:36px">✅</div><h3>Semua Drive Terisi</h3><p>Tidak ada drive kosong di ${esc(window.S.plant)}</p></div>`;
      } else {
        // Build breakdown panel for kosong drives
        html += buildKosongBreakdownPanel(adaKosong, allDrives);

        // Existing table untuk mixing dengan drive kosong
        html += `
          <div class="summary-panel">
            <div class="summary-panel-head">
              <div class="summary-panel-title">⬜ Mixing dengan Drive Kosong</div>
              <div class="summary-panel-count">${adaKosong.length} dari ${rows.length} mixing</div>
            </div>
            <div style="overflow-x:auto">
              <table class="sum-table">
                <thead>
                  <tr>
                    <th>Mixing</th>
                    <th>Kosong</th>
                    <th>INU ⬜</th>
                    <th>DSU ⬜</th>
                    <th>Total</th>
                    <th>%</th>
                    <th>Tipe Drive Kosong</th>
                  </tr>
                </thead>
                <tbody>
                  ${adaKosong.map(r => {
                    const pct = Math.round(r.kosong / r.total * 100);
                    const groupDrives = allDrives.filter(d => String(d.group || '').trim() === r.group);
                    const kosongDrives = groupDrives.filter(d => !d.status || d.status === 'kosong');
                    const inuKosong = kosongDrives.filter(d => isINU(d.drive_id)).length;
                    const dsuKosong = kosongDrives.filter(d => isDSU(d.drive_id)).length;
                    const tipeBadges = buildTipeBadges(kosongDrives);
                    return `
                      <tr>
                        <td><div class="sum-group-name">${esc(r.group)}</div></td>
                        <td><span class="sum-kosong-badge">⬜ ${r.kosong}</span></td>
                        <td>
                          ${inuKosong > 0 
                            ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent-bd);padding:2px 8px;border-radius:4px">INU ${inuKosong}</span>` 
                            : `<span style="color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:10px">—</span>`}
                        </td>
                        <td>
                          ${dsuKosong > 0 
                            ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#c084fc;background:rgba(192,132,252,.12);border:1px solid rgba(192,132,252,.35);padding:2px 8px;border-radius:4px">DSU ${dsuKosong}</span>` 
                            : `<span style="color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:10px">—</span>`}
                        </td>
                        <td><span class="sum-zero">${r.total}</span></td>
                        <td>
                          <div class="sum-pct-bar">
                            <div class="sum-bar-track"><div class="sum-bar-fill" style="width:${pct}%"></div></div>
                            <span class="sum-pct-txt">${pct}%</span>
                          </div>
                        </td>
                        <td>${tipeBadges || '<span style="color:var(--muted);font-size:10px">—</span>'}</td>
                      </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`;

        // Full table semua mixing
        html += `
          <div class="summary-panel">
            <div class="summary-panel-head">
              <div class="summary-panel-title">📋 Semua Mixing</div>
              <div class="summary-panel-count">${rows.length} mixing</div>
            </div>
            <div style="overflow-x:auto">
              <table class="sum-table">
                <thead><tr><th>Mixing</th><th>OK</th><th>Kosong</th><th>Fault</th><th>Maint</th><th>Total</th></tr></thead>
                <tbody>
                  ${rows.map(r => `
                    <tr>
                      <td><div class="sum-group-name">${esc(r.group)}</div></td>
                      <td style="color:${r.ok > 0 ? 'var(--ok)' : 'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.ok}</td>
                      <td>${r.kosong > 0 ? `<span class="sum-kosong-badge">⬜ ${r.kosong}</span>` : `<span class="sum-zero">0</span>`}</td>
                      <td style="color:${r.fault > 0 ? 'var(--fault)' : 'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.fault}</td>
                      <td style="color:${r.maint > 0 ? 'var(--maint)' : 'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.maint}</td>
                      <td class="sum-zero">${r.total}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
      }

      el.innerHTML = html;

    } catch (err) {
      el.innerHTML = `<div class="state-box">
        <div style="font-size:28px">⚠️</div>
        <h3>Gagal memuat</h3>
        <p>${err.message}</p>
        <button class="btn-retry" onclick="renderSummaryTab()">Coba Lagi</button>
      </div>`;
    }
  };

  // Helper: deteksi unit type dari drive_id
  function isINU(driveId) {
    const s = String(driveId || '').toUpperCase();
    return s.includes('.INU.') || s.includes('-INU') || s.includes('_INU') || s.endsWith('INU');
  }

  function isDSU(driveId) {
    const s = String(driveId || '').toUpperCase();
    return s.includes('.DSU.') || s.includes('-DSU') || s.includes('_DSU') || s.endsWith('DSU');
  }

  // Helper: deteksi tipe drive dari spesifikasi/merk
  function detectDriveTipe(drive) {
    const sp = String((drive.spesifikasi || '') + ' ' + (drive.merk || '')).toUpperCase();
    const types = ['ACS880', 'ACS800', 'ACS580', 'ACS550', 'ACS355', 'ACS150', 'DCS880', 'DCS800'];
    for (const t of types) {
      if (sp.includes(t)) return t;
    }
    return drive.merk ? String(drive.merk).toUpperCase().trim().substring(0, 10) : 'LAINNYA';
  }

  // Helper: build tipe badges untuk kosong drives dalam satu mixing
  function buildTipeBadges(kosongDrives) {
    if (!kosongDrives.length) return '';
    
    const tipeCount = {};
    kosongDrives.forEach(d => {
      const t = detectDriveTipe(d);
      tipeCount[t] = (tipeCount[t] || 0) + 1;
    });

    const tipeColors = {
      'ACS880': { color: '#00f0a0', bg: 'rgba(0,240,160,.12)', bd: 'rgba(0,240,160,.35)' },
      'ACS800': { color: '#4d9fff', bg: 'rgba(77,159,255,.12)', bd: 'rgba(77,159,255,.35)' },
      'ACS580': { color: '#ffb820', bg: 'rgba(255,184,32,.12)', bd: 'rgba(255,184,32,.35)' },
      'ACS550': { color: '#c084fc', bg: 'rgba(192,132,252,.12)', bd: 'rgba(192,132,252,.35)' },
      'ACS355': { color: '#f472b6', bg: 'rgba(244,114,182,.12)', bd: 'rgba(244,114,182,.35)' },
      'ACS150': { color: '#fb923c', bg: 'rgba(251,146,60,.12)', bd: 'rgba(251,146,60,.35)' },
      'DCS880': { color: '#00e0f8', bg: 'rgba(0,224,248,.10)', bd: 'rgba(0,224,248,.30)' },
      'DCS800': { color: '#38bdf8', bg: 'rgba(56,189,248,.10)', bd: 'rgba(56,189,248,.30)' },
      'LAINNYA': { color: '#9fc3e8', bg: 'rgba(159,195,232,.08)', bd: 'rgba(159,195,232,.25)' },
    };

    return Object.entries(tipeCount).map(([tipe, cnt]) => {
      const c = tipeColors[tipe] || tipeColors['LAINNYA'];
      return `<span style="display:inline-block;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
                           padding:2px 7px;border-radius:4px;margin:1px;
                           background:${c.bg};color:${c.color};border:1px solid ${c.bd}">
                ${tipe} ×${cnt}
              </span>`;
    }).join('');
  }

  // Build breakdown panel — summary kosong per tipe dan unit
  function buildKosongBreakdownPanel(adaKosong, allDrives) {
    // Collect all kosong drives
    const allKosongDrives = [];
    adaKosong.forEach(r => {
      const groupDrives = allDrives.filter(d => String(d.group || '').trim() === r.group);
      const kosong = groupDrives.filter(d => !d.status || d.status === 'kosong');
      kosong.forEach(d => allKosongDrives.push({ ...d, _mixing: r.group }));
    });

    if (!allKosongDrives.length) return '';

    // Count by tipe
    const tipeCount = {};
    allKosongDrives.forEach(d => {
      const t = detectDriveTipe(d);
      tipeCount[t] = (tipeCount[t] || 0) + 1;
    });

    // Count by unit type
    const inuTotal = allKosongDrives.filter(d => isINU(d.drive_id)).length;
    const dsuTotal = allKosongDrives.filter(d => isDSU(d.drive_id)).length;
    const otherTotal = allKosongDrives.length - inuTotal - dsuTotal;

    const tipeColors = {
      'ACS880': { color: '#00f0a0', bg: 'rgba(0,240,160,.12)', bd: 'rgba(0,240,160,.35)' },
      'ACS800': { color: '#4d9fff', bg: 'rgba(77,159,255,.12)', bd: 'rgba(77,159,255,.35)' },
      'ACS580': { color: '#ffb820', bg: 'rgba(255,184,32,.12)', bd: 'rgba(255,184,32,.35)' },
      'ACS550': { color: '#c084fc', bg: 'rgba(192,132,252,.12)', bd: 'rgba(192,132,252,.35)' },
      'ACS355': { color: '#f472b6', bg: 'rgba(244,114,182,.12)', bd: 'rgba(244,114,182,.35)' },
      'ACS150': { color: '#fb923c', bg: 'rgba(251,146,60,.12)', bd: 'rgba(251,146,60,.35)' },
      'DCS880': { color: '#00e0f8', bg: 'rgba(0,224,248,.10)', bd: 'rgba(0,224,248,.30)' },
      'DCS800': { color: '#38bdf8', bg: 'rgba(56,189,248,.10)', bd: 'rgba(56,189,248,.30)' },
      'LAINNYA': { color: '#9fc3e8', bg: 'rgba(159,195,232,.08)', bd: 'rgba(159,195,232,.25)' },
    };

    const tipeRows = Object.entries(tipeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tipe, cnt]) => {
        const c = tipeColors[tipe] || tipeColors['LAINNYA'];
        const pct = Math.round(cnt / allKosongDrives.length * 100);
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(31,48,80,.4)">
            <span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:800;
                         min-width:80px;padding:3px 10px;border-radius:6px;text-align:center;
                         background:${c.bg};color:${c.color};border:1px solid ${c.bd}">${tipe}</span>
            <div style="flex:1;background:var(--surf3);border-radius:3px;height:6px;overflow:hidden">
              <div style="width:${pct}%;height:6px;border-radius:3px;background:${c.color};transition:width .4s ease"></div>
            </div>
            <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:${c.color};min-width:30px;text-align:right">${cnt}</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);min-width:35px">${pct}%</span>
          </div>`;
      }).join('');

    return `
      <div style="background:var(--surf);border:1px solid rgba(126,184,232,.3);border-radius:14px;
                  overflow:hidden;margin-bottom:20px;border-top:3px solid var(--kosong)">
        <div style="display:flex;align-items:center;gap:10px;padding:14px 18px;
                    border-bottom:1px solid var(--border);
                    background:rgba(126,184,232,.06)">
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;
                       letter-spacing:2px;text-transform:uppercase;color:var(--kosong)">
            🔍 BREAKDOWN DRIVE KOSONG
          </span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);
                       background:var(--surf2);border:1px solid var(--border);
                       padding:3px 10px;border-radius:10px;margin-left:auto">
            Total ${allKosongDrives.length} slot kosong
          </span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;
                    border-bottom:1px solid var(--border)">
          <!-- Unit Type Breakdown -->
          <div style="padding:16px 18px;border-right:1px solid var(--border)">
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
                        letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">
              ⚡ Jenis Unit
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${inuTotal > 0 ? `
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
                               background:var(--accent-bg);color:var(--accent);border:1px solid var(--accent-bd);
                               padding:3px 12px;border-radius:6px;min-width:60px;text-align:center">INU</span>
                  <div style="flex:1;background:var(--surf3);border-radius:3px;height:6px;overflow:hidden">
                    <div style="width:${Math.round(inuTotal/allKosongDrives.length*100)}%;height:6px;border-radius:3px;background:var(--accent)"></div>
                  </div>
                  <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:var(--accent)">${inuTotal}</span>
                </div>` : ''}
              ${dsuTotal > 0 ? `
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
                               background:rgba(192,132,252,.12);color:#c084fc;border:1px solid rgba(192,132,252,.35);
                               padding:3px 12px;border-radius:6px;min-width:60px;text-align:center">DSU</span>
                  <div style="flex:1;background:var(--surf3);border-radius:3px;height:6px;overflow:hidden">
                    <div style="width:${Math.round(dsuTotal/allKosongDrives.length*100)}%;height:6px;border-radius:3px;background:#c084fc"></div>
                  </div>
                  <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:#c084fc">${dsuTotal}</span>
                </div>` : ''}
              ${otherTotal > 0 ? `
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
                               background:var(--surf2);color:var(--muted);border:1px solid var(--border);
                               padding:3px 12px;border-radius:6px;min-width:60px;text-align:center">LAIN</span>
                  <div style="flex:1;background:var(--surf3);border-radius:3px;height:6px;overflow:hidden">
                    <div style="width:${Math.round(otherTotal/allKosongDrives.length*100)}%;height:6px;border-radius:3px;background:var(--muted)"></div>
                  </div>
                  <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:var(--muted)">${otherTotal}</span>
                </div>` : ''}
            </div>
          </div>
          <!-- Drive Type Breakdown -->
          <div style="padding:16px 18px">
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
                        letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">
              🔌 Tipe Drive
            </div>
            <div>${tipeRows}</div>
          </div>
        </div>
      </div>`;
  }

  // Helper esc (fallback jika belum ada di scope)
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  console.log('[PATCH] Garda Hitam patches applied: Fix1 (hero), Fix2 (ws_boveri), Fix3 (summary detail)');

})();
