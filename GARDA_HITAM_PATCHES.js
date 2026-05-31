// ================================================================
//  GARDA HITAM — PATCH v10
//  Fix: plant-hero terlalu tinggi → hero compact, stat row inline
//  Fix: blank space hitam mixing/detail page
//  Fix: mobile scroll & layout terpotong
// ================================================================
(function () {
  'use strict';

  // Hapus semua patch lama
  ['gh-v6-fix','gh-v7-fix','gh-v8-fix','gh-v9-fix','gh-v10-fix'].forEach(function(pid) {
    var el = document.getElementById(pid);
    if (el) el.remove();
  });

  // ── CSS FIX ────────────────────────────────────────────────────
  document.head.insertAdjacentHTML('beforeend', `<style id="gh-v10-fix">

  /* ── WRAPPER UTAMA ── */
  html, body {
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* ── PAGES WRAPPER ── */
  #pages-wrapper {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* ── SEMUA PAGE ── */
  .page {
    display: none !important;
    flex: none !important;
    overflow: hidden !important;
  }
  .page.active {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow: hidden !important;
    animation: fadeUp .2s ease !important;
  }

  /* ── PLANT PAGE ── */
  #page-plant.active { overflow: hidden !important; }
  #page-plant .global-search-wrap { flex: 0 0 auto !important; }
  .plant-wrap {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }

  /* HERO COMPACT — kurangi padding & ukuran */
  .plant-hero {
    padding: 14px 24px 12px !important;
    flex-shrink: 0 !important;
    display: block !important;
  }
  .plant-hero-badge {
    font-size: 8px !important;
    padding: 3px 10px !important;
    margin-bottom: 6px !important;
  }
  .plant-hero-title {
    font-size: 20px !important;
    margin-bottom: 2px !important;
  }
  .plant-hero-sub {
    font-size: 11px !important;
    margin-bottom: 10px !important;
  }
  /* Stat row — inline horizontal, tidak wrap */
  .plant-stats-row {
    display: flex !important;
    gap: 8px !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
    padding-bottom: 2px !important;
  }
  .plant-stats-row::-webkit-scrollbar { display: none !important; }
  .plant-stat-box {
    padding: 6px 12px !important;
    min-width: 80px !important;
    flex-shrink: 0 !important;
  }
  .plant-stat-label {
    font-size: 8px !important;
    margin-bottom: 2px !important;
  }
  .plant-stat-val {
    font-size: 14px !important;
  }
  .plant-stat-cta { font-size: 8px !important; margin-top: 1px !important; }

  /* Plant section */
  .plant-section {
    padding: 14px 24px !important;
    flex-shrink: 0 !important;
    display: block !important;
  }
  .plant-section-head { margin-bottom: 10px !important; }

  /* ── MIXING PAGE ── */
  #page-mixing.active { overflow: hidden !important; }
  .mixing-page-wrap {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    display: block !important;
    width: 100% !important;
  }
  .mixing-hero {
    padding: 14px 24px 12px !important;
    flex-shrink: 0 !important;
    display: block !important;
  }
  .mixing-hero-title { font-size: 18px !important; }
  .mixing-section {
    padding: 14px 24px !important;
    flex-shrink: 0 !important;
    display: block !important;
  }

  /* ── DETAIL PAGE ── */
  #page-detail.active { overflow: hidden !important; }
  .detail-back-row { flex: 0 0 auto !important; }
  .content-area {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }
  .content-tabs {
    flex: 0 0 auto !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
  }
  .content-tabs::-webkit-scrollbar { display: none !important; }
  .search-wrap { flex: 0 0 auto !important; }

  /* ── TAB CONTENT ── */
  .tab-content { display: none !important; flex: none !important; }
  .tab-content.active {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    animation: fadeUp .2s ease !important;
  }
  #tab-histori.active,
  #tab-manual.active,
  #tab-pool.active {
    overflow-y: hidden !important;
    padding: 0 !important;
  }
  .histori-scroll-area,
  .manual-scroll-area,
  .pool-scroll-area {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .hist-filter-bar,
  .mb-filter-bar,
  .pool-selector-row,
  .pool-hero,
  .plant-switcher-bar { flex: 0 0 auto !important; }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    html, body {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100% !important; height: 100% !important;
    }
    .topbar { height: 44px !important; padding: 0 10px !important; gap: 6px !important; }
    .topbar-title { font-size: 11px !important; }
    .topbar-sub, .topbar-divider { display: none !important; }
    .btn-back, .btn-theme, .btn-sm, .btn-logout { font-size: 10px !important; padding: 4px 8px !important; }
    .topbar-clock { display: none !important; }
    .role-badge { font-size: 9px !important; padding: 2px 7px !important; }
    .running-bar { height: 22px !important; }
    .running-inner { font-size: 9px !important; }
    .breadcrumb {
      padding: 0 10px !important; font-size: 10px !important; height: 26px !important;
      overflow-x: auto !important; scrollbar-width: none !important;
      flex-wrap: nowrap !important; white-space: nowrap !important;
    }
    .global-search-wrap { padding: 6px 10px !important; }
    /* Hero mobile lebih kecil lagi */
    .plant-hero { padding: 10px 12px 8px !important; }
    .plant-hero-title { font-size: 16px !important; }
    .plant-hero-sub { font-size: 10px !important; margin-bottom: 8px !important; }
    .plant-hero-badge { display: none !important; }
    .plant-stat-box { padding: 5px 8px !important; min-width: 70px !important; }
    .plant-stat-val { font-size: 13px !important; }
    .plant-section { padding: 10px !important; }
    .plant-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 8px !important; }
    .mixing-hero { padding: 10px 12px 8px !important; }
    .mixing-hero-title { font-size: 15px !important; }
    .mixing-section { padding: 10px !important; }
    .mixing-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important; gap: 6px !important; }
    .cards-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
    .pool-grid  { grid-template-columns: 1fr !important; gap: 8px !important; }
    .inu-card   { padding: 13px 14px !important; }
    .search-wrap { padding: 7px 10px !important; gap: 6px !important; }
    .search-bar  { font-size: 11px !important; padding: 6px 10px !important; }
    .modal-overlay  { align-items: flex-end !important; padding: 0 !important; }
    .modal {
      border-radius: 18px 18px 0 0 !important; max-width: 100% !important; margin: 0 !important;
      padding: 20px 16px 32px !important; max-height: 92vh !important;
      overflow-y: auto !important; width: 100% !important;
    }
    .ts-modal-overlay { align-items: flex-end !important; padding: 0 !important; }
    .ts-modal { border-radius: 18px 18px 0 0 !important; max-width: 100% !important; margin: 0 !important; padding: 20px 16px 32px !important; }
    .login-gate-overlay { align-items: flex-end !important; }
    .login-gate-box {
      border-radius: 18px 18px 0 0 !important; max-width: 100% !important; margin: 0 !important;
      padding: 24px 16px 36px !important; max-height: 92vh !important; overflow-y: auto !important;
    }
    .global-results-panel { padding: 12px !important; }
    .global-result-grid   { grid-template-columns: 1fr !important; }
    .pool-selector-row { gap: 6px !important; padding: 8px 10px !important; }
  }

  </style>`);

  // ── PATCH renderMixingPage ──────────────────────────────────────
  var _origRMP = window.renderMixingPage;
  if (typeof _origRMP === 'function') {
    window.renderMixingPage = async function () {
      var wrap = document.querySelector('.mixing-page-wrap');
      if (wrap) wrap.removeAttribute('style');
      return _origRMP.apply(this, arguments);
    };
  }

  // ── PATCH showPage ──────────────────────────────────────────────
  var _origSP = window.showPage;
  if (typeof _origSP === 'function') {
    window.showPage = function (name) {
      _origSP.apply(this, arguments);
      var mw = document.querySelector('.mixing-page-wrap');
      if (mw) mw.scrollTop = 0;
    };
  }

  // ── PATCH renderPlantPage ───────────────────────────────────────
  window.renderPlantPage = async function () {
    var el = document.getElementById('plant-content');
    if (!el) return;
    el.innerHTML = '<div class="state-box"><div class="sp"></div><p>Memuat plant...</p></div>';
    try {
      var data = await apiGet({ action: 'getPlants' });
      document.getElementById('stat-total').textContent = data.plants.length;
      document.getElementById('stat-sync').textContent = new Date().toTimeString().slice(0, 5);
      var canAll = typeof canAccessAllPlants === 'function' ? canAccessAllPlants() : true;
      var plants = canAll ? data.plants : data.plants.filter(function (p) { return p.plant === S.loggedInPlant; });

      var abwMap = {};
      plants.forEach(function (p) {
        var pools = typeof getPoolSheets === 'function' ? getPoolSheets(p.plant) : [];
        var abw = pools.find(function (x) { return x.startsWith('abw'); });
        if (abw) { if (!abwMap[abw]) abwMap[abw] = []; abwMap[abw].push(p.plant); }
      });
      var abwCards = Object.keys(abwMap).map(function (a, i) {
        return typeof abwCard === 'function' ? abwCard(a, abwMap[a], plants.length + i) : '';
      }).join('');

      var wbIdx = plants.length + Object.keys(abwMap).length;
      var wbCard = '<div class="plant-card" onclick="navToPool(\'MCG\',\'ws_boveri\')" style="animation-delay:' + (wbIdx * 0.06) + 's;border-color:rgba(255,184,32,.45);">'
        + '<div class="plant-card-top" style="background:linear-gradient(135deg,rgba(255,184,32,.12),rgba(255,184,32,.04))">'
        + '<div class="plant-card-corner" style="background:#ffb820;box-shadow:0 0 10px rgba(255,184,32,.7)"></div>'
        + '<div class="plant-card-id">POOL · SHARED GLOBAL</div>'
        + '<div class="plant-card-name" style="color:#ffb820;font-family:\'JetBrains Mono\',monospace;font-size:16px">🟡 WS Boveri</div>'
        + '<div class="plant-card-desc">Spare Workshop Boveri — Shared semua plant</div>'
        + '<div style="margin-top:8px"><span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;font-weight:700;padding:3px 9px;border-radius:10px;background:rgba(255,184,32,.15);color:#ffb820;border:1px solid rgba(255,184,32,.4)">MCA · MCC · MCD · MCG · MCH · MCI · PLANT E</span></div>'
        + '</div>'
        + '<div class="plant-card-bottom" style="background:rgba(255,184,32,.05)">'
        + '<span id="wb-count" class="plant-card-tag" style="background:rgba(255,184,32,.15);border-color:rgba(255,184,32,.4);color:#ffb820">⟳ Memuat...</span>'
        + '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;background:rgba(0,224,248,.1);color:#00e0f8;border:1px solid rgba(0,224,248,.25);padding:2px 7px;border-radius:4px">MASTER: MCG</span>'
        + '<span class="plant-card-arr" style="color:#ffb820">→</span>'
        + '</div></div>';

      el.innerHTML = '<div class="plant-grid">'
        + plants.map(function (p, i) { return typeof plantCard === 'function' ? plantCard(p, i) : ''; }).join('')
        + abwCards + wbCard + '</div>';

      await Promise.all(plants.map(async function (p) {
        try {
          if (!S.cache[p.plant + '_groupList']) {
            var res = await apiGet({ action: 'getDrives', plant: p.plant });
            var drives = Array.isArray(res.drives) ? res.drives : [];
            S.cache[p.plant + '_drives'] = drives;
            var seen = [], groups = [];
            drives.forEach(function (d) {
              var g = String(d.group || '').trim();
              if (g && !seen.includes(g)) { seen.push(g); groups.push(g); }
            });
            S.cache[p.plant + '_groupList'] = groups;
          }
          var gl = S.cache[p.plant + '_groupList'] || [];
          var tagEl = document.getElementById('mix-tag-' + p.plant);
          if (tagEl && gl.length) tagEl.textContent = gl.length + ' Mixing';
        } catch (e) {}
      }));

      try {
        var wd = await apiGet({ action: 'getPool', plant: 'MCG', pool: 'ws_boveri' });
        var wb = document.getElementById('wb-count');
        if (wb) wb.textContent = '🟡 ' + (wd.items || []).length + ' Drive Spare';
        S.cache['MCG_pool_ws_boveri'] = wd.items || [];
      } catch (e) {
        var wb2 = document.getElementById('wb-count');
        if (wb2) wb2.textContent = '🟡 WS Boveri';
      }
    } catch (err) {
      el.innerHTML = '<div class="state-box"><div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3><p>' + (err.message || '') + '</p><button class="btn-retry" onclick="renderPlantPage()">Coba Lagi</button></div>';
    }
  };

  // ── PATCH renderSummaryTab ──────────────────────────────────────
  window.renderSummaryTab = async function () {
    if (typeof renderSwitcherBar === 'function') renderSwitcherBar('summary', S.plant);
    var el = document.getElementById('summary-content');
    if (!el) return;
    el.innerHTML = '<div class="state-box"><div class="sp"></div><p>Memuat summary...</p></div>';
    try {
      var data = await apiGet({ action: 'getSummaryKosong', plant: S.plant });
      var rows = data.summary || [], totalKosong = data.totalKosong || 0, totalDrive = data.totalDrive || 0;
      var adaKosong = rows.filter(function (r) { return r.kosong > 0; });
      var bersih = rows.filter(function (r) { return r.kosong === 0; }).length;

      var allDrives = S.cache[S.plant + '_drives'] || [];
      if (!allDrives.length) {
        try {
          var dd = await apiGet({ action: 'getDrives', plant: S.plant });
          allDrives = Array.isArray(dd.drives) ? dd.drives : [];
          S.cache[S.plant + '_drives'] = allDrives;
        } catch (e) {}
      }

      var isINU = function (id) { return /[._-]INU([._-]|$)/i.test(String(id)); };
      var isDSU = function (id) { return /[._-]DSU([._-]|$)/i.test(String(id)); };
      var TIPES = ['ACS880','ACS800','ACS580','ACS550','ACS355','ACS150','DCS880','DCS800'];
      var getTipe = function (d) {
        var sp = String((d.spesifikasi || '') + ' ' + (d.merk || '')).toUpperCase();
        return TIPES.find(function (t) { return sp.includes(t); }) || 'LAINNYA';
      };
      var COLORS = {
        ACS880:{c:'#00f0a0',bg:'rgba(0,240,160,.12)',bd:'rgba(0,240,160,.35)'},
        ACS800:{c:'#4d9fff',bg:'rgba(77,159,255,.12)',bd:'rgba(77,159,255,.35)'},
        ACS580:{c:'#ffb820',bg:'rgba(255,184,32,.12)',bd:'rgba(255,184,32,.35)'},
        ACS550:{c:'#c084fc',bg:'rgba(192,132,252,.12)',bd:'rgba(192,132,252,.35)'},
        ACS355:{c:'#f472b6',bg:'rgba(244,114,182,.12)',bd:'rgba(244,114,182,.35)'},
        ACS150:{c:'#fb923c',bg:'rgba(251,146,60,.12)',bd:'rgba(251,146,60,.35)'},
        DCS880:{c:'#00e0f8',bg:'rgba(0,224,248,.10)',bd:'rgba(0,224,248,.30)'},
        DCS800:{c:'#38bdf8',bg:'rgba(56,189,248,.10)',bd:'rgba(56,189,248,.30)'},
        LAINNYA:{c:'#9fc3e8',bg:'rgba(159,195,232,.08)',bd:'rgba(159,195,232,.25)'}
      };
      var getC = function (t) { return COLORS[t] || COLORS.LAINNYA; };
      var tipeBadges = function (drives) {
        if (!drives.length) return '<span style="color:var(--muted)">—</span>';
        var cnt = {};
        drives.forEach(function (d) { var t = getTipe(d); cnt[t] = (cnt[t] || 0) + 1; });
        return Object.entries(cnt).map(function (e) {
          var c = getC(e[0]);
          return '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin:1px;display:inline-block;background:' + c.bg + ';color:' + c.c + ';border:1px solid ' + c.bd + '">' + e[0] + '×' + e[1] + '</span>';
        }).join('');
      };

      var html = '<div class="summary-stats">'
        + '<div class="sum-stat"><div class="sum-stat-label">Drive Kosong</div><div class="sum-stat-val kosong">' + totalKosong + '</div></div>'
        + '<div class="sum-stat"><div class="sum-stat-label">Terdampak</div><div class="sum-stat-val" style="color:var(--maint)">' + adaKosong.length + '</div></div>'
        + '<div class="sum-stat"><div class="sum-stat-label">Bersih</div><div class="sum-stat-val ok">' + bersih + '</div></div>'
        + '<div class="sum-stat"><div class="sum-stat-label">Total Drive</div><div class="sum-stat-val accent">' + totalDrive + '</div></div>'
        + '</div>';

      if (!adaKosong.length) {
        html += '<div class="state-box"><div style="font-size:36px">✅</div><h3>Semua Drive Terisi</h3><p>Tidak ada drive kosong di ' + S.plant + '</p></div>';
      } else {
        html += '<div class="summary-panel"><div class="summary-panel-head"><div class="summary-panel-title">⬜ Mixing dengan Drive Kosong</div><div class="summary-panel-count">' + adaKosong.length + ' dari ' + rows.length + ' mixing</div></div>'
          + '<div style="overflow-x:auto"><table class="sum-table"><thead><tr><th>Mixing</th><th>Kosong</th><th>INU ⬜</th><th>DSU ⬜</th><th>Tipe</th><th>Total</th><th>%</th></tr></thead><tbody>';
        adaKosong.forEach(function (r) {
          var pct = Math.round(r.kosong / r.total * 100);
          var gk = allDrives.filter(function (d) {
            return String(d.group || '').trim() === r.group && (!d.status || d.status === 'kosong');
          });
          var inuK = gk.filter(function (d) { return isINU(d.drive_id); }).length;
          var dsuK = gk.filter(function (d) { return isDSU(d.drive_id); }).length;
          html += '<tr><td><div class="sum-group-name">' + r.group + '</div></td>'
            + '<td><span class="sum-kosong-badge">⬜ ' + r.kosong + '</span></td>'
            + '<td>' + (inuK > 0 ? '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent-bd);padding:2px 8px;border-radius:4px">INU ' + inuK + '</span>' : '<span style="color:var(--muted)">—</span>') + '</td>'
            + '<td>' + (dsuK > 0 ? '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;color:#c084fc;background:rgba(192,132,252,.12);border:1px solid rgba(192,132,252,.35);padding:2px 8px;border-radius:4px">DSU ' + dsuK + '</span>' : '<span style="color:var(--muted)">—</span>') + '</td>'
            + '<td>' + tipeBadges(gk) + '</td>'
            + '<td><span class="sum-zero">' + r.total + '</span></td>'
            + '<td><div class="sum-pct-bar"><div class="sum-bar-track"><div class="sum-bar-fill" style="width:' + pct + '%"></div></div><span class="sum-pct-txt">' + pct + '%</span></div></td></tr>';
        });
        html += '</tbody></table></div></div>';
        html += '<div class="summary-panel"><div class="summary-panel-head"><div class="summary-panel-title">📋 Semua Mixing</div><div class="summary-panel-count">' + rows.length + ' mixing</div></div>'
          + '<div style="overflow-x:auto"><table class="sum-table"><thead><tr><th>Mixing</th><th>OK</th><th>Kosong</th><th>Fault</th><th>Maint</th><th>Total</th></tr></thead><tbody>';
        rows.forEach(function (r) {
          html += '<tr><td><div class="sum-group-name">' + r.group + '</div></td>'
            + '<td style="color:' + (r.ok > 0 ? 'var(--ok)' : 'var(--muted)') + ';font-family:\'JetBrains Mono\',monospace;font-size:11px">' + r.ok + '</td>'
            + '<td>' + (r.kosong > 0 ? '<span class="sum-kosong-badge">⬜ ' + r.kosong + '</span>' : '<span class="sum-zero">0</span>') + '</td>'
            + '<td style="color:' + (r.fault > 0 ? 'var(--fault)' : 'var(--muted)') + ';font-family:\'JetBrains Mono\',monospace;font-size:11px">' + r.fault + '</td>'
            + '<td style="color:' + (r.maint > 0 ? 'var(--maint)' : 'var(--muted)') + ';font-family:\'JetBrains Mono\',monospace;font-size:11px">' + r.maint + '</td>'
            + '<td class="sum-zero">' + r.total + '</td></tr>';
        });
        html += '</tbody></table></div></div>';
      }
      el.innerHTML = html;
    } catch (err) {
      el.innerHTML = '<div class="state-box"><div style="font-size:28px">⚠️</div><h3>Gagal memuat</h3><p>' + (err.message || '') + '</p><button class="btn-retry" onclick="renderSummaryTab()">Coba Lagi</button></div>';
    }
  };

  console.log('[GH-PATCH v10] loaded — hero compact, blank space fixed');
})();

