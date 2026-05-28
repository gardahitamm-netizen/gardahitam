// ================================================================
//  GARDA HITAM — PATCH v2
//  Tambahkan SEBELUM </body> di HTML utama
//  
//  FIX 1: Space kosong di halaman Mixing & Detail (root cause fix)
//  FIX 2: WS Boveri card di plant list  
//  FIX 3: Summary breakdown tipe drive & unit type
// ================================================================

(function applyGardaHitamPatches() {
  'use strict';

  // ════════════════════════════════════════════════════════════
  //  FIX 1: ROOT CAUSE — Page switching layout bug
  //  Problem: #pages-wrapper adalah flex-column, saat page switch
  //  ada ghost space dari elemen page yang sebelumnya active.
  //  Fix: gunakan position:absolute untuk setiap page agar
  //  tidak ada ruang yang "bocor" antar page.
  // ════════════════════════════════════════════════════════════
  const layoutFixCSS = `
    /* ── FIX 1: Page layout — hapus ghost space ── */
    #pages-wrapper {
      position: relative !important;
      flex: 1 !important;
      overflow: hidden !important;
      min-height: 0 !important;
    }

    .page {
      display: none !important;
      position: absolute !important;
      inset: 0 !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .page.active {
      display: flex !important;
      position: absolute !important;
      inset: 0 !important;
      flex-direction: column !important;
      overflow: hidden !important;
      animation: fadeUp .2s ease !important;
    }

    /* Plant page inner scroll */
    .plant-wrap {
      flex: 1 !important;
      overflow-y: auto !important;
      height: 100% !important;
      -webkit-overflow-scrolling: touch !important;
    }

    /* Mixing page inner scroll */
    .mixing-page-wrap {
      flex: 1 !important;
      overflow-y: auto !important;
      height: 100% !important;
      -webkit-overflow-scrolling: touch !important;
    }

    /* Detail page content area */
    .content-area {
      flex: 1 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
    }

    /* Kurangi padding hero yang berlebihan */
    .plant-hero {
      padding: 20px 28px 16px !important;
      flex-shrink: 0 !important;
    }

    .mixing-hero {
      padding: 16px 28px 14px !important;
      flex-shrink: 0 !important;
    }

    /* Pastikan mixing section bisa scroll */
    .mixing-section {
      flex-shrink: 0 !important;
    }

    /* Global search wrap tidak boleh flex-shrink */
    .global-search-wrap {
      flex-shrink: 0 !important;
    }

    /* Fix tab-content scroll area */
    .tab-content {
      min-height: 0 !important;
    }

    .tab-content.active {
      min-height: 0 !important;
      flex: 1 !important;
    }

    /* Fix pool-scroll-area, histori-scroll-area dll */
    .pool-scroll-area,
    .histori-scroll-area,
    .manual-scroll-area {
      flex: 1 !important;
      overflow-y: auto !important;
      min-height: 0 !important;
    }

    /* Mobile fix tambahan */
    @media (max-width: 768px) {
      .plant-wrap,
      .mixing-page-wrap {
        height: 100% !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
    }
  `;

  const style = document.createElement('style');
  style.id = 'gh-layout-fix';
  style.textContent = layoutFixCSS;
  document.head.appendChild(style);


  // ════════════════════════════════════════════════════════════
  //  FIX 2: WS BOVERI CARD
  //  Tambah card khusus ws_boveri di plant list page
  // ════════════════════════════════════════════════════════════
  const _origRenderPlantPage = window.renderPlantPage;

  window.renderPlantPage = async function () {
    const el = document.getElementById('plant-content');
    el.innerHTML = '<div class="state-box"><div class="sp"></div><p>Memuat plant...</p></div>';
    try {
      const data = await window.apiGet({ action: 'getPlants' });
      document.getElementById('stat-total').textContent = data.plants.length;
      document.getElementById('stat-sync').textContent = new Date().toTimeString().slice(0, 5);

      const canAll = typeof window.canAccessAllPlants === 'function' ? window.canAccessAllPlants() : true;
      const plants = canAll
        ? data.plants
        : data.plants.filter(p => p.plant === S.loggedInPlant);

      // ABW cards (logika asli)
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

      // WS Boveri card baru
      const totalIdx = plants.length + Object.keys(abwMap).length;
      const wsBovCard = buildWsBoveriCard(totalIdx);

      el.innerHTML = `<div class="plant-grid">
        ${plants.map((p, i) => window.plantCard(p, i)).join('')}
        ${abwCards}
        ${wsBovCard}
      </div>`;

      // Load mixing counts
      await Promise.all(plants.map(async p => {
        try {
          if (!S.cache[p.plant + '_groupList']) {
            const res = await window.apiGet({ action: 'getDrives', plant: p.plant });
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
        } catch (e) {}
      }));

      loadWsBoveriCount();

    } catch (err) {
      el.innerHTML = '<div class="state-box"><div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3><p>' + err.message + '</p><button class="btn-retry" onclick="renderPlantPage()">Coba Lagi</button></div>';
    }
  };

  function buildWsBoveriCard(idx) {
    return `
      <div class="plant-card" id="ws-boveri-card"
           onclick="navToPool('MCG','ws_boveri')"
           style="animation-delay:${idx * 0.06}s;
                  border-color:rgba(255,184,32,.45);
                  background:linear-gradient(135deg,rgba(255,184,32,.07),rgba(255,184,32,.02))">
        <div class="plant-card-top"
             style="background:linear-gradient(135deg,rgba(255,184,32,.12),rgba(255,184,32,.04))">
          <div class="plant-card-corner"
               style="background:#ffb820;box-shadow:0 0 10px rgba(255,184,32,.7)"></div>
          <div class="plant-card-id">POOL · SHARED GLOBAL</div>
          <div class="plant-card-name"
               style="color:#ffb820;font-family:'JetBrains Mono',monospace;font-size:16px">
            🟡 WS Boveri
          </div>
          <div class="plant-card-desc">Spare Workshop Boveri — Shared semua plant</div>
          <div style="margin-top:8px">
            <span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
                         padding:3px 9px;border-radius:10px;
                         background:rgba(255,184,32,.15);color:#ffb820;
                         border:1px solid rgba(255,184,32,.4)">
              MCA · MCC · MCD · MCG · MCH · MCI · PLANT E
            </span>
          </div>
        </div>
        <div class="plant-card-bottom" style="background:rgba(255,184,32,.05)">
          <span class="plant-card-tag"
                style="background:rgba(255,184,32,.15);border-color:rgba(255,184,32,.4);color:#ffb820"
                id="ws-boveri-count-badge">⟳ Memuat...</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:9px;
                       background:rgba(0,224,248,.1);color:#00e0f8;
                       border:1px solid rgba(0,224,248,.25);padding:2px 7px;border-radius:4px">
            MASTER: MCG
          </span>
          <span class="plant-card-arr" style="color:#ffb820">→</span>
        </div>
      </div>`;
  }

  async function loadWsBoveriCount() {
    try {
      const data = await window.apiGet({ action: 'getPool', plant: 'MCG', pool: 'ws_boveri' });
      const items = data.items || [];
      const badge = document.getElementById('ws-boveri-count-badge');
      if (badge) badge.textContent = '🟡 ' + items.length + ' Drive Spare';
      S.cache['MCG_pool_ws_boveri'] = items;
    } catch (e) {
      const badge = document.getElementById('ws-boveri-count-badge');
      if (badge) badge.textContent = '🟡 WS Boveri';
    }
  }


  // ════════════════════════════════════════════════════════════
  //  FIX 3: SUMMARY DETAIL BREAKDOWN
  //  Tampilkan breakdown tipe drive (ACS880/800) & unit (INU/DSU)
  //  untuk drive yang kosong
  // ════════════════════════════════════════════════════════════
  window.renderSummaryTab = async function () {
    // Render switcher bar jika ada
    if (typeof window.renderSwitcherBar === 'function') {
      window.renderSwitcherBar('summary', S.plant);
    }

    const el = document.getElementById('summary-content');
    el.innerHTML = '<div class="state-box"><div class="sp"></div><p>Memuat summary...</p></div>';

    try {
      const data = await window.apiGet({ action: 'getSummaryKosong', plant: S.plant });
      const rows = data.summary || [];
      const totalKosong = data.totalKosong || 0;
      const totalDrive = data.totalDrive || 0;
      const adaKosong = rows.filter(r => r.kosong > 0);
      const bersih = rows.filter(r => r.kosong === 0).length;

      // Ambil drive data untuk breakdown
      let allDrives = S.cache[S.plant + '_drives'] || [];
      if (!allDrives.length) {
        try {
          const dData = await window.apiGet({ action: 'getDrives', plant: S.plant });
          allDrives = Array.isArray(dData.drives) ? dData.drives : [];
          S.cache[S.plant + '_drives'] = allDrives;
          const seen = [], groups = [];
          allDrives.forEach(d => {
            const g = String(d.group || '').trim();
            if (g && !seen.includes(g)) { seen.push(g); groups.push(g); }
          });
          S.cache[S.plant + '_groupList'] = groups;
        } catch (e) {}
      }

      let html = `
        <div class="summary-stats">
          <div class="sum-stat">
            <div class="sum-stat-label">Drive Kosong</div>
            <div class="sum-stat-val kosong">${totalKosong}</div>
          </div>
          <div class="sum-stat">
            <div class="sum-stat-label">Terdampak</div>
            <div class="sum-stat-val" style="color:var(--maint)">${adaKosong.length}</div>
          </div>
          <div class="sum-stat">
            <div class="sum-stat-label">Bersih</div>
            <div class="sum-stat-val ok">${bersih}</div>
          </div>
          <div class="sum-stat">
            <div class="sum-stat-label">Total Drive</div>
            <div class="sum-stat-val accent">${totalDrive}</div>
          </div>
        </div>`;

      if (!adaKosong.length) {
        html += '<div class="state-box"><div style="font-size:36px">✅</div><h3>Semua Drive Terisi</h3><p>Tidak ada drive kosong di ' + _esc(S.plant) + '</p></div>';
      } else {
        // Panel breakdown
        html += _buildBreakdownPanel(adaKosong, allDrives);

        // Tabel mixing dengan drive kosong
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
                    <th>Tipe Kosong</th>
                    <th>Total</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  ${adaKosong.map(r => {
                    const pct = Math.round(r.kosong / r.total * 100);
                    const gDrives = allDrives.filter(d => String(d.group || '').trim() === r.group);
                    const kDrives = gDrives.filter(d => !d.status || d.status === 'kosong');
                    const inuK = kDrives.filter(d => _isINU(d.drive_id)).length;
                    const dsuK = kDrives.filter(d => _isDSU(d.drive_id)).length;
                    return `<tr>
                      <td><div class="sum-group-name">${_esc(r.group)}</div></td>
                      <td><span class="sum-kosong-badge">⬜ ${r.kosong}</span></td>
                      <td>${inuK > 0
                        ? '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent-bd);padding:2px 8px;border-radius:4px">INU ' + inuK + '</span>'
                        : '<span style="color:var(--muted);font-family:\'JetBrains Mono\',monospace;font-size:10px">—</span>'}</td>
                      <td>${dsuK > 0
                        ? '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;color:#c084fc;background:rgba(192,132,252,.12);border:1px solid rgba(192,132,252,.35);padding:2px 8px;border-radius:4px">DSU ' + dsuK + '</span>'
                        : '<span style="color:var(--muted);font-family:\'JetBrains Mono\',monospace;font-size:10px">—</span>'}</td>
                      <td style="white-space:nowrap">${_tipeBadges(kDrives)}</td>
                      <td><span class="sum-zero">${r.total}</span></td>
                      <td>
                        <div class="sum-pct-bar">
                          <div class="sum-bar-track">
                            <div class="sum-bar-fill" style="width:${pct}%"></div>
                          </div>
                          <span class="sum-pct-txt">${pct}%</span>
                        </div>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`;

        // Tabel semua mixing
        html += `
          <div class="summary-panel">
            <div class="summary-panel-head">
              <div class="summary-panel-title">📋 Semua Mixing</div>
              <div class="summary-panel-count">${rows.length} mixing</div>
            </div>
            <div style="overflow-x:auto">
              <table class="sum-table">
                <thead>
                  <tr><th>Mixing</th><th>OK</th><th>Kosong</th><th>Fault</th><th>Maint</th><th>Total</th></tr>
                </thead>
                <tbody>
                  ${rows.map(r => `<tr>
                    <td><div class="sum-group-name">${_esc(r.group)}</div></td>
                    <td style="color:${r.ok > 0 ? 'var(--ok)' : 'var(--muted)'};font-family:'JetBrains Mono',monospace;font-size:11px">${r.ok}</td>
                    <td>${r.kosong > 0 ? '<span class="sum-kosong-badge">⬜ ' + r.kosong + '</span>' : '<span class="sum-zero">0</span>'}</td>
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
      el.innerHTML = '<div class="state-box"><div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3><p>' + err.message + '</p><button class="btn-retry" onclick="renderSummaryTab()">Coba Lagi</button></div>';
    }
  };

  // ── Helpers untuk summary ──────────────────────────────
  function _isINU(id) {
    const s = String(id || '').toUpperCase();
    return s.includes('.INU.') || s.includes('-INU') || s.includes('_INU') || s.endsWith('INU');
  }

  function _isDSU(id) {
    const s = String(id || '').toUpperCase();
    return s.includes('.DSU.') || s.includes('-DSU') || s.includes('_DSU') || s.endsWith('DSU');
  }

  function _driveTipe(d) {
    const sp = String((d.spesifikasi || '') + ' ' + (d.merk || '')).toUpperCase();
    for (const t of ['ACS880','ACS800','ACS580','ACS550','ACS355','ACS150','DCS880','DCS800']) {
      if (sp.includes(t)) return t;
    }
    if (d.merk) return String(d.merk).toUpperCase().trim().slice(0, 10);
    return 'LAINNYA';
  }

  const _TIPE_C = {
    ACS880:  { c:'#00f0a0', bg:'rgba(0,240,160,.12)',   bd:'rgba(0,240,160,.35)'   },
    ACS800:  { c:'#4d9fff', bg:'rgba(77,159,255,.12)',  bd:'rgba(77,159,255,.35)'  },
    ACS580:  { c:'#ffb820', bg:'rgba(255,184,32,.12)',  bd:'rgba(255,184,32,.35)'  },
    ACS550:  { c:'#c084fc', bg:'rgba(192,132,252,.12)', bd:'rgba(192,132,252,.35)' },
    ACS355:  { c:'#f472b6', bg:'rgba(244,114,182,.12)', bd:'rgba(244,114,182,.35)' },
    ACS150:  { c:'#fb923c', bg:'rgba(251,146,60,.12)',  bd:'rgba(251,146,60,.35)'  },
    DCS880:  { c:'#00e0f8', bg:'rgba(0,224,248,.10)',   bd:'rgba(0,224,248,.30)'   },
    DCS800:  { c:'#38bdf8', bg:'rgba(56,189,248,.10)',  bd:'rgba(56,189,248,.30)'  },
    LAINNYA: { c:'#9fc3e8', bg:'rgba(159,195,232,.08)', bd:'rgba(159,195,232,.25)' },
  };

  function _tipeBadges(drives) {
    if (!drives.length) return '—';
    const cnt = {};
    drives.forEach(d => { const t = _driveTipe(d); cnt[t] = (cnt[t] || 0) + 1; });
    return Object.entries(cnt).map(([t, n]) => {
      const c = _TIPE_C[t] || _TIPE_C.LAINNYA;
      return `<span style="display:inline-block;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin:1px;background:${c.bg};color:${c.c};border:1px solid ${c.bd}">${t}×${n}</span>`;
    }).join('');
  }

  function _buildBreakdownPanel(adaKosong, allDrives) {
    const allK = [];
    adaKosong.forEach(r => {
      const gD = allDrives.filter(d => String(d.group || '').trim() === r.group);
      gD.filter(d => !d.status || d.status === 'kosong').forEach(d => allK.push(d));
    });
    if (!allK.length) return '';

    const inuN = allK.filter(d => _isINU(d.drive_id)).length;
    const dsuN = allK.filter(d => _isDSU(d.drive_id)).length;
    const othN = allK.length - inuN - dsuN;
    const tot  = allK.length;

    const tipeCnt = {};
    allK.forEach(d => { const t = _driveTipe(d); tipeCnt[t] = (tipeCnt[t] || 0) + 1; });
    const tipeRows = Object.entries(tipeCnt)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => {
        const c = _TIPE_C[t] || _TIPE_C.LAINNYA;
        const p = Math.round(n / tot * 100);
        return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(31,48,80,.4)">
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;min-width:72px;padding:3px 8px;border-radius:5px;text-align:center;background:${c.bg};color:${c.c};border:1px solid ${c.bd}">${t}</span>
          <div style="flex:1;background:var(--surf3);border-radius:3px;height:5px;overflow:hidden">
            <div style="width:${p}%;height:5px;border-radius:3px;background:${c.c}"></div>
          </div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:800;color:${c.c};min-width:24px;text-align:right">${n}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);min-width:32px">${p}%</span>
        </div>`;
      }).join('');

    const unitBar = (label, n, color, bg, bd) => n > 0 ? `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;background:${bg};color:${color};border:1px solid ${bd};padding:3px 10px;border-radius:5px;min-width:52px;text-align:center">${label}</span>
        <div style="flex:1;background:var(--surf3);border-radius:3px;height:5px;overflow:hidden">
          <div style="width:${Math.round(n/tot*100)}%;height:5px;border-radius:3px;background:${color}"></div>
        </div>
        <span style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:${color}">${n}</span>
      </div>` : '';

    return `
      <div style="background:var(--surf);border:1px solid rgba(126,184,232,.3);border-radius:14px;overflow:hidden;margin-bottom:20px;border-top:3px solid var(--kosong)">
        <div style="display:flex;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid var(--border);background:rgba(126,184,232,.06)">
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--kosong)">🔍 BREAKDOWN DRIVE KOSONG</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);background:var(--surf2);border:1px solid var(--border);padding:3px 10px;border-radius:10px;margin-left:auto">Total ${tot} slot kosong</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
          <div style="padding:14px 18px;border-right:1px solid var(--border)">
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">⚡ Jenis Unit</div>
            ${unitBar('INU',  inuN, 'var(--accent)', 'var(--accent-bg)', 'var(--accent-bd)')}
            ${unitBar('DSU',  dsuN, '#c084fc', 'rgba(192,132,252,.12)', 'rgba(192,132,252,.35)')}
            ${unitBar('LAIN', othN, 'var(--muted)', 'var(--surf2)', 'var(--border)')}
          </div>
          <div style="padding:14px 18px">
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">🔌 Tipe Drive</div>
            ${tipeRows}
          </div>
        </div>
      </div>`;
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  console.log('[GH-PATCH v2] Applied: layout fix + ws_boveri card + summary breakdown');

})();
