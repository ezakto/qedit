const defaultOptions = {
  language: null,
  indentation: '  ',
  triggersIndent: ['{', '(', '[', ':'],
  triggersDedent: ['}', ')', ']'],
  pairOpen: ['{', '(', '['],
  pairClose: ['}', ')', ']'],
  autoPairs: { '{': '}', '(': ')', '[': ']', '<': '>', '"': '"', "'": "'" },
  showLineNumbers: false,
  highlightBracketPairs: true,
  plugins: [],
  render: (code, el) => {
    el.textContent = code + '\u200B';
  },
};

function createElement(tagName) {
  return document.createElement(tagName);
}

function addEventListener(el, type, handler) {
  return el.addEventListener(type, handler, false);
}

function setTextareaState(textarea, value, selectionStart = 0, selectionEnd = 0) {
  textarea.value = value;
  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionEnd;
}

function measureText(textarea) {
  const canvas = createElement('canvas');
  const ctx = canvas.getContext('2d');
  const style = window.getComputedStyle(textarea);

  ctx.font = `${style.fontSize} ${style.fontFamily}`;

  return [ctx.measureText('a').width, parseInt(style.lineHeight)];
}

function getCharacterData(textarea, pos = null) {
  const { value } = textarea;

  if (pos === null) pos = textarea.selectionStart;

  const lines = value.slice(0, pos).split('\n');
  const ln = lines.length;
  const col = lines.pop().length + 1;
  const char = value[pos];

  return { ln, col, char };
}

function getLineNumbers(textarea, start = null, end = null) {
  const { value } = textarea;

  if (start === null) start = textarea.selectionStart;
  if (end === null) end = textarea.selectionEnd;

  let currentChar = 0;
  let currentLine = 1;
  let lines = [];

  while (currentChar < end) {
    if (value[currentChar] === '\n') {
      if (currentChar >= start) {
        lines.push(currentLine);
      }

      currentLine++;
    }

    currentChar++;
  }

  lines.push(currentLine);

  return lines;
}

function findMatchingPair(textarea, pairOpen, pairClose) {
  const { selectionStart, selectionEnd, value } = textarea;

  if (selectionStart !== selectionEnd) return;

  const prevChar = value[selectionStart - 1];
  const nextChar = value[selectionStart];
  let char = null;
  let charPos = null;
  let pair = null;
  let backwards = false;

  if (pairOpen.includes(prevChar)) {
    char = prevChar;
    charPos = selectionStart - 1;
    pair = pairClose[pairOpen.indexOf(char)];
  } else if (pairOpen.includes(nextChar)) {
    char = nextChar;
    charPos = selectionStart;
    pair = pairClose[pairOpen.indexOf(char)];
  } else if (pairClose.includes(prevChar)) {
    char = prevChar;
    charPos = selectionStart - 1;
    pair = pairOpen[pairClose.indexOf(char)];
    backwards = true;
  } else if (pairClose.includes(nextChar)) {
    char = nextChar;
    charPos = selectionStart;
    pair = pairOpen[pairClose.indexOf(char)];
    backwards = true;
  } else {
    return;
  }

  let stack = 0;
  let step = backwards ? -1 : 1;
  let end = backwards ? 0 : value.length;

  for (let i = charPos + step; i !== end; i += step) {
    if (value[i] === char) {
      stack++;
      continue;
    }
    
    if (value[i] === pair) {
      if (stack) {
        stack--;
        continue;
      }

      return [
        getCharacterData(textarea, charPos),
        getCharacterData(textarea, i),
      ];
    }
  }

  return;
}

function insertText(textarea, text, at = null, preserveSelection = false) {
  const { selectionStart, selectionEnd, value } = textarea;

  if (at === null) {
    at = selectionStart;
  }

  textarea.value = value.slice(0, at) + text + value.slice(at);

  if (at <= selectionStart && !preserveSelection) {
    textarea.selectionStart = selectionStart + text.length;
    textarea.selectionEnd = selectionEnd + text.length;
  } else {
    textarea.selectionStart = selectionStart;
    textarea.selectionEnd = selectionEnd;
  }
}

function onSelectionUpdate(textarea, handler) {
  addEventListener(textarea, 'click', handler);
  addEventListener(textarea, 'keyup', handler);
  addEventListener(textarea, 'focus', handler);
}

function create(block = null, opts = {}) {
  if (!block) {
    const ret = [];

    document.querySelectorAll('.qedit').forEach(el => {
      ret.push(create(el, opts));
    });

    return ret;
  }

  const options = { ...defaultOptions, ...opts };

  const {
    indentation,
    triggersIndent,
    triggersDedent,
    pairOpen,
    pairClose,
    autoPairs,
    showLineNumbers,
    highlightLines,
    highlightBracketPairs,
  } = options;

  options.language = options.language || (block.className.match(/lang(?:uage)?-([\w-]+)/) || [, 'clike'])[1];

  const code = block.querySelector('code');
  const textarea = createElement('textarea');
  const undoStack = [];
  const redoStack = [];
  const inserts = [];
  let linenumbers = null;
  let startLine = +block.dataset.line || 1;
  
  textarea.value = code.textContent;

  block.appendChild(textarea);

  const [charWidth, lineHeight] = measureText(textarea);

  if (showLineNumbers || block.dataset.showLineNumbers) {
    linenumbers = createElement('div');
    linenumbers.className = 'qedit-line-numbers';
    inserts.push(linenumbers);
    block.setAttribute('data-show-line-numbers', true);
  }

  if (highlightLines || block.dataset.highlightLines) {
    (highlightLines || block.dataset.highlightLines).split(',').forEach(l => {
      let start = l;
      let end = l;

      if (l.indexOf('-') > -1) {
        [start, end] = l.split('-');
      }

      start = +start - startLine + 1;
      end = +end - startLine + 1;

      const linehighlight = createElement('div');
      linehighlight.className = 'qedit-line-highlight';
      linehighlight.style.top = `${(start - 1) * lineHeight + 20}px`;
      linehighlight.style.height = `${(end - start + 1) * lineHeight}px`;
      inserts.push(linehighlight);
    });
    block.setAttribute('data-highlight-lines', highlightLines || block.dataset.highlightLines);
  }

  if (highlightBracketPairs || block.dataset.highlightBracketPairs) {
    const characterHighlightA = createElement('div');
    const characterHighlightB = createElement('div');
  
    [characterHighlightA, characterHighlightB].forEach(el => {
      el.className = 'qedit-character-highlight';
      el.style.width = `${charWidth}px`;
      el.style.height = `${lineHeight}px`;
    });

    textarea.characterHighlightA = characterHighlightA;
    textarea.characterHighlightB = characterHighlightB;
    inserts.push(characterHighlightA, characterHighlightB);
    block.setAttribute('data-highlight-bracket-pairs', true);
  }

  const fragment = document.createDocumentFragment();
  inserts.forEach(fragment.appendChild, fragment);
  block.appendChild(fragment);

  function _render() {
    options.render(textarea.value, code, options);

    if (linenumbers) {
      linenumbers.textContent = textarea.value.split('\n').map((l, n) => n + startLine).join('\n');
    }
  }

  function render() {
    setTimeout(_render, 0);
  }

  function addUndo(state) {
    undoStack.push(state);

    if (undoStack.length > 50) {
      undoStack.shift();
    }
  }

  if (highlightBracketPairs) {
    const { characterHighlightA, characterHighlightB } = textarea;

    onSelectionUpdate(textarea, () => {
      const matchingPair = findMatchingPair(textarea, pairOpen, pairClose);
  
      if (matchingPair) {
        characterHighlightA.style.visibility = 'visible';
        characterHighlightB.style.visibility = 'visible';
        characterHighlightA.style.transform = `translate(${charWidth * (matchingPair[0].col - 1)}px, ${lineHeight * (matchingPair[0].ln - 1)}px)`;
        characterHighlightB.style.transform = `translate(${charWidth * (matchingPair[1].col - 1)}px, ${lineHeight * (matchingPair[1].ln - 1)}px)`;
      } else {
        characterHighlightA.style.visibility = 'hidden';
        characterHighlightB.style.visibility = 'hidden';
      }
    });
  }

  addEventListener(textarea, 'keydown', e => {
    // tab
    if (e.which === 9) {
      e.preventDefault();

      const { selectionStart, selectionEnd } = textarea;
      const collapsed = selectionStart === selectionEnd;

      addUndo({
        text: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      });

      if (e.shiftKey) {
        const lines = textarea.value.split('\n');
        const lns = getLineNumbers(textarea);
        let tmpSelectionStart = selectionStart;
        let selectionLength = selectionEnd - selectionStart;
        
        lns.forEach((ln, idx) => {
          const line = lines[ln - 1];

          lines[ln - 1] = lines[ln - 1].replace(new RegExp(`^${indentation}`), '');

          if (line !== lines[ln - 1]) {
            if (idx === 0) {
              tmpSelectionStart -= indentation.length;
            } else {
              selectionLength -= indentation.length;
            }
          }
        });

        setTextareaState(
          textarea,
          lines.join('\n'),
          Math.max(0, tmpSelectionStart),
          Math.max(0, tmpSelectionStart) + selectionLength
        );
      } else if (!collapsed) {
        const lines = textarea.value.split('\n');
        const lns = getLineNumbers(textarea)
        
        lns.forEach(ln => {
          lines[ln - 1] = `${indentation}${lines[ln - 1]}`;
        });
        
        setTextareaState(
          textarea,
          lines.join('\n'),
          selectionStart + indentation.length,
          selectionEnd + indentation.length * lns.length
        );
      } else {
        insertText(textarea, indentation);
      }

      render();
    }

    // ctrl [shift] z
    if (e.ctrlKey && e.which === 90) {
      e.preventDefault();

      const state = e.shiftKey ? redoStack.pop() : undoStack.pop();

      if (!state) return;

      if (e.shiftKey) {
        undoStack.push(state)
      } else {
        redoStack.push(state);
      }

      setTextareaState(
        textarea,
        state.text,
        state.selectionStart,
        state.selectionEnd
      );

      render();
    }
  });

  addEventListener(textarea, 'input', e => {
    const { selectionStart, selectionEnd, value } = textarea;

    addUndo({
      text: textarea.value,
      selectionStart,
      selectionEnd,
    });

    switch (e.inputType) {
      case 'insertLineBreak': {
        const lastChar = value.substr(selectionStart - 2, 1);
        const nextChar = value.substr(selectionEnd, 1);
        const slice = value.slice(0, selectionStart);
        const lines = slice.split('\n');
        const lastLine = lines[lines.length - 2];
        let indent = (lastLine.match(/^[^\S\n]+/) || [''])[0];

        if (autoPairs[lastChar] && nextChar === autoPairs[lastChar]) {
          insertText(textarea, `\n${indent}`);
        }

        if (triggersIndent.includes(lastChar)) {
          indent += indentation;
        }

        setTextareaState(
          textarea,
          slice + indent + textarea.value.slice(selectionStart),
          selectionStart + indent.length,
          selectionStart + indent.length
        );

        break;
      }

      case 'insertText': {
        if (triggersDedent.includes(e.data)) {
          const lines = value.slice(0, selectionStart).split('\n');
          let line = lines.pop();
          
          if (line.match(new RegExp(`^[^\\S\\n]{${indentation.length},}\\${e.data}$`))) {
            line = line.slice(indentation.length);
            lines.push(line);

            setTextareaState(
              textarea,
              lines.join('\n') + value.slice(selectionStart),
              selectionStart - indentation.length,
              selectionEnd - indentation.length
            );
          }
        }

        if (autoPairs[e.data]) {
          insertText(textarea, autoPairs[e.data], selectionStart, true);
        }

        break;
      }
    }
    
    render();
  });

  const editor = {
    el: block,
    textarea,
    getValue() {
      return textarea.value;
    },
    setValue(value, selectionStart = 0, selectionEnd = 0, undo = true) {
      if (undo) {
        addUndo({
          text: textarea.value,
          selectionStart: textarea.selectionStart,
          selectionEnd: textarea.selectionEnd,
        });
      }

      setTextareaState(textarea, value, selectionStart, selectionEnd);

      render();
    },
    destroy() {
      inserts.concat(textarea).forEach(block.removeChild, block);
    },
  };

  options.plugins.forEach(plugin => {
    plugin(editor);
  });

  render();

  return editor;
}

export default {
  defaultOptions,
  create,
};
