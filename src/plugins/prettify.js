import PR from 'code-prettify';

function escape(html) {
  return html
    .split('&').join('&amp;')
    .split('"').join('&quot;')
    .split("'").join('&#39;')
    .split('<').join('&lt;')
    .split('>').join('&gt;');
}

export default function highlight(code, el, options) {
  const highlighted = PR.prettyPrintOne(escape(code), options.language);
  el.innerHTML = highlighted + '\u200B';
}
