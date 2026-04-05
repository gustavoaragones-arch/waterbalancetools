/**
 * Shared SERP / AEO HTML fragments (programmatic generators).
 * No external deps.
 */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** Plain text truncated to max words (for snippet p text, no HTML). */
function truncateWordsPlain(text, maxWords) {
  const w = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (w.length <= maxWords) return w.join(' ');
  return w.slice(0, maxWords).join(' ') + '…';
}

/** Snippet allows <strong> only — pass trusted short strings. */
function snippetBlock(htmlInsideP) {
  return '<div class="snippet"><p>' + htmlInsideP + '</p></div>';
}

function stepsSection(items) {
  const lis = items.map(t => '        <li>' + escHtml(t) + '</li>').join('\n');
  return (
    '    <section class="serp-block serp-steps">\n' +
    '      <h2>Steps</h2>\n' +
    '      <ul>\n' +
    lis +
    '\n      </ul>\n' +
    '    </section>'
  );
}

/** One or more HTML paragraphs (trusted — may include <strong> from generators). */
function whatThisMeansSection(htmlParagraphOrParts) {
  const parts = Array.isArray(htmlParagraphOrParts)
    ? htmlParagraphOrParts
    : [htmlParagraphOrParts];
  const ps = parts.map(html => '      <p>' + html + '</p>').join('\n');
  return (
    '    <section class="serp-block serp-definition">\n' +
    '      <h2>What This Means</h2>\n' +
    ps +
    '\n    </section>'
  );
}

function recommendedLevelsSection(items) {
  const lis = items
    .map(
      line =>
        '        <li>' +
        (line.html ? line.html : escHtml(line.label) + ': ' + escHtml(line.value)) +
        '</li>'
    )
    .join('\n');
  return (
    '    <section class="serp-block serp-levels">\n' +
    '      <h2>Recommended Levels</h2>\n' +
    '      <ul>\n' +
    lis +
    '\n      </ul>\n' +
    '    </section>'
  );
}

function commonQuestionsSection(faqItems) {
  const inner = faqItems
    .map(
      x =>
        '        <div class="faq-item"><h3>' +
        escHtml(x.q) +
        '</h3><p>' +
        escHtml(x.a) +
        '</p></div>'
    )
    .join('\n');
  return (
    '    <section class="faq-section common-questions">\n' +
    '      <h2>Common Questions</h2>\n' +
    '      <div class="faq-list">\n' +
    inner +
    '\n      </div>\n' +
    '    </section>'
  );
}

/**
 * Insert internal cluster section before FAQ (SERP order: explanation → cluster → FAQ).
 */
/** Plain-text paragraphs (escaped). */
function whatHappensIfIncorrectSection(paragraphs) {
  const ps = paragraphs
    .map(t => '      <p>' + escHtml(t) + '</p>')
    .join('\n');
  return (
    '    <section class="serp-block serp-risk">\n' +
    '      <h2>What happens if levels are incorrect</h2>\n' +
    ps +
    '\n    </section>'
  );
}

function quickTipsSection(items) {
  const lis = items.map(t => '        <li>' + escHtml(t) + '</li>').join('\n');
  return (
    '    <section class="serp-block serp-quick-tips">\n' +
    '      <h2>Quick tips</h2>\n' +
    '      <ul>\n' +
    lis +
    '\n      </ul>\n' +
    '    </section>'
  );
}

function insertBeforeCommonQuestions(html, sectionHtml) {
  if (html.includes('class="faq-section common-questions"')) {
    return html.replace(
      /(\s*)(<section class="faq-section common-questions">)/i,
      sectionHtml + '$1$2'
    );
  }
  if (html.includes('class="faq-section"')) {
    return html.replace(/(\s*)(<section class="faq-section">)/i, sectionHtml + '$1$2');
  }
  return html.replace('</main>', sectionHtml + '</main>');
}

module.exports = {
  escHtml,
  escapeAttr,
  truncateWordsPlain,
  snippetBlock,
  stepsSection,
  whatThisMeansSection,
  recommendedLevelsSection,
  whatHappensIfIncorrectSection,
  quickTipsSection,
  commonQuestionsSection,
  insertBeforeCommonQuestions
};
