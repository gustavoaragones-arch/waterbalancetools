/**
 * Printable pages: offer PDF via jsPDF or fallback to print.
 * Lightweight; loads jsPDF from CDN only when user clicks Download PDF.
 */
(function () {
  'use strict';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function printableToPdf() {
    var title = document.title || 'WaterBalanceTools';
    if (window.jspdf && window.jspdf.jsPDF) {
      generatePdf(title);
      return;
    }
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      .then(function () { generatePdf(title); })
      .catch(function () { window.print(); });
  }

  function generatePdf(title) {
    try {
      var doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      var margin = 40;
      var y = 40;
      var body = document.body;
      var main = body.querySelector('.printable-content') || body.querySelector('main') || body;
      var text = main ? (main.innerText || main.textContent || '').replace(/\s+/g, ' ').trim() : '';
      if (text.length > 8000) text = text.slice(0, 8000);
      doc.setFontSize(14);
      doc.text(title, margin, y);
      y += 20;
      doc.setFontSize(10);
      var lines = doc.splitTextToSize(text, doc.internal.pageSize.width - margin * 2);
      var pageH = doc.internal.pageSize.height;
      for (var i = 0; i < lines.length; i++) {
        if (y > pageH - 40) { doc.addPage(); y = margin; }
        doc.text(lines[i], margin, y);
        y += 14;
      }
      doc.save((title.replace(/\s*\|\s*WaterBalanceTools.*$/, '') || 'checklist') + '.pdf');
    } catch (e) {
      window.print();
    }
  }

  window.WaterBalance = window.WaterBalance || {};
  window.WaterBalance.printableToPdf = printableToPdf;
})();
