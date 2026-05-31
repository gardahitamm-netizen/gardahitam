// ================================================================
// GARDA HITAM --- FIX LAYOUT TERPOTONG (FINAL)
// ================================================================
(function() {
  'use strict';
  
  // Hapus patch lama jika ada
  ['gh-v6-fix','gh-v7-fix','gh-v8-fix','gh-v9-fix','gh-v10-fix','gh-v11-fix'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });
  
  var style = document.createElement('style');
  style.id = 'gh-v11-fix';
  style.textContent = `
    /* OVERRIDE UTAMA */
    html, body {
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      position: relative !important;
    }
    
    #pages-wrapper {
      display: flex !important;
      flex-direction: column !important;
      height: 100% !important;
      width: 100% !important;
      overflow: hidden !important;
      min-height: 0 !important;
    }
    
    .page {
      flex: 1 1 100% !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    
    .page.active {
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Scrollable areas */
    .plant-wrap,
    .mixing-page-wrap,
    .content-area,
    .tab-content.active,
    .histori-scroll-area,
    .manual-scroll-area,
    .pool-scroll-area {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
    }
    
    .tab-content.active {
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Khusus detail page */
    .content-area {
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
    }
    
    /* Mobile - hapus position fixed yang merusak */
    @media (max-width: 768px) {
      html, body {
        position: relative !important;
        height: 100% !important;
      }
      .topbar, .running-bar, .breadcrumb, .detail-back-row, .search-wrap {
        flex-shrink: 0 !important;
      }
      .plant-wrap, .mixing-page-wrap {
        overflow-y: auto !important;
      }
      .modal-overlay.open {
        align-items: flex-end !important;
      }
      .modal {
        max-height: 85vh !important;
        overflow-y: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Memastikan scroll area tetap bekerja setelah navigasi
  var originalShowPage = window.showPage;
  if (typeof originalShowPage === 'function') {
    window.showPage = function(name) {
      originalShowPage.apply(this, arguments);
      // Reset scroll posisi agar tidak macet
      setTimeout(function() {
        var activePage = document.querySelector('.page.active');
        if (activePage) {
          var scrollArea = activePage.querySelector('.plant-wrap, .mixing-page-wrap, .content-area');
          if (scrollArea) scrollArea.scrollTop = 0;
        }
      }, 50);
    };
  }
  
  console.log('[GH-FIX] Layout terpotong telah diperbaiki (final)');
})();
