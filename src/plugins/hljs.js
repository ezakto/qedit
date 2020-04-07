import hljs from 'highlight.js';

export default function highlight(code, el, options) {
  const highlighted = hljs.highlight(options.language, code).value;
  el.innerHTML = highlighted + '\u200B';
}
