import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';

function testTrigger(e, string) {
  const keys = string.toLowerCase().split('+');

  return keys.every(key => {
    switch (key) {
      case 'ctrl':
      case 'cmd':
      case 'meta':
        return e.ctrlKey || e.metaKey;
      case 'shift':
        return e.shiftKey;
      case 'alt':
        return e.altKey;
      default:
        return e.code.toLowerCase() === key
          || e.code === 'Key'.concat(key.toUpperCase())
          || e.code === 'Digit'.concat(key);
    }
  });
}

export default function QeditPrettier(options = {}) {
  const trigger = options.trigger || 'ctrl+enter';
  const formatOnInit = options.formatOnInit || false;
  const prettierOptions = options.prettierOptions || { parser: 'babel' };

  return editor => {
    function format() {
      const { selectionStart, selectionEnd, value } = editor.textarea;
      const selectionLength = selectionEnd - selectionStart;

      const result = prettier.formatWithCursor(value, {
        ...prettierOptions,
        plugins: [parserBabel],
        cursorOffset: selectionStart,
      });

      const offsetSelectionStart = result.cursorOffset;
      const offsetSelectionEnd = result.cursorOffset + selectionLength;

      editor.setValue(result.formatted, offsetSelectionStart, offsetSelectionEnd);
    }

    editor.textarea.addEventListener('keydown', e => {
      if (!testTrigger(e, trigger)) return;

      e.preventDefault();

      format();

      return false;
    }, false);

    if (formatOnInit) {
      format();
    }
  };
}
