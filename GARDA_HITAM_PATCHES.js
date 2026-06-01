// ================================================================
// GARDA HITAM PATCHES — v13 MINIMAL
// Hanya nambal 2 rule CSS yang missing di drives.html
// ================================================================
(function () {
  'use strict';

  // Hapus patch lama
  ['gh-v6-fix','gh-v7-fix','gh-v8-fix','gh-v9-fix',
   'gh-v10-fix','gh-v11-fix','gh-v12-fix','gh-v13-fix'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });

  var css = document.createElement('style');
  css.id  = 'gh-v13-fix';
  css.textContent = `

    /* FIX 1: plant page butuh rule yang sama seperti mixing page */
    #page-plant.active { overflow: hidden; }
    #page-plant.active .plant-wrap {
      flex: 1 1 0%;
      height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    /* FIX 2: mobile — position:fixed di drives.html bunuh scroll plant-wrap */
    @media (max-width: 768px) {
      html, body {
        position: relative !important;
        top: auto !important;
        left: auto !important;
      }
    }

  `;
  document.head.appendChild(css);

  console.log('[GH-PATCH v13] 2 rule fix applied');
})();
