import Prism from 'prismjs';

export default function highlight(code, el, options) {
  const highlighted = Prism.highlight(code, Prism.languages[options.language], options.language);
  el.innerHTML = highlighted + '\u200B';
}
