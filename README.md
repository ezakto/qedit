<p align="center">
  <img src="https://ezakto.github.io/qedit/logo_e.png" alt="Qedit" width="200"><br>
  Instant, small, and flexible code snippets editor
</p>

## Install

```shell
npm install qedit
```

or

```html
<script src="path/to/lib/qedit.js">
```

And include basic styles:

```html
<link rel="stylesheet" href="path/to/lib/qedit.css">
```

## Usage

The basic structure consist in three wrappers: `div > pre > code`. The main div wrapper is enhanced with the editor functionality, while the `pre > code` combo is the standard HTML5 to embed source code.

```html
<div class="qedit">
  <pre><code>function hello() {
  return 'world';
}</code></pre>
</div>
```

Then you init the editor with `create(container)`:

```js
import Qedit from 'qedit';

Qedit.create(document.querySelector('.qedit'));
```

If you call `Qedit.create()` without a container element (or `null`), it'll look for and instantiate all elements with class name `.qedit`.

### Syntax highlighter

By default, there is no syntax highlighting when creating a Qedit instance. However, the library ships with three plugins for different highlighters you can include in the options param:

#### Prism.js

```js
import Qedit from 'qedit';
import QeditPrism from 'qedit/plugins/prism';

Qedit.create(document.querySelector('.qedit'), {
  render: QeditPrism,
});
```

Don't forget to `npm install prism` or include it in a script tag.

#### Highlight.js

```js
import Qedit from 'qedit';
import QeditHljs from 'qedit/plugins/hljs';

Qedit.create(document.querySelector('.qedit'), {
  render: QeditHljs,
});
```

Don't forget to `npm install highlight.js` or include it in a script tag.

#### Code Prettify

```js
import Qedit from 'qedit';
import QeditPrettify from 'qedit/plugins/prettify';

Qedit.create(document.querySelector('.qedit'), {
  render: QeditPrettify,
});
```

Don't forget to `npm install code-prettify` or include it in a script tag.

### Plugins

Qedit plugins are simply defined as functions called on editor initialization with the editor instance as only argument. Plugins are listed in the `plugins` array of the options param.

#### Prettier

Currently the only plugin shipped with the library:

```js
import Qedit from 'qedit';
import QeditPrettier from 'qedit/plugins/prettier';

Qedit.create(document.querySelector('.qedit'), {
  plugins: [QeditPrettier()],
});
```

Optionally, you can configure the plugin passing an options object. The defaults are:

```js
  plugins: [QeditPrettier({
    trigger: 'ctrl+enter',
    formatOnInit: false,
    prettierOptions: { parser: 'babel' },
  })],
```

Don't forget to `npm install prettier` or include it in a script tag (along with `prettier/parser-babel` if you use the default behavior).

## Options and defaults

```js
Qedit.create(null, {
  language: null, // if null, it'll look for the container class .language-xxxx
  indentation: '  ', // what to insert/remove when pressing tab/shift+tab
  triggersIndent: ['{', '(', '[', ':'], // characters that add indentation on line break
  triggersDedent: ['}', ')', ']'], // characters that removes indentation
  highlightBracketPairs: true, // whether to highlight matching bracket pairs or not
  pairOpen: ['{', '(', '['], // pairs to highlight
  pairClose: ['}', ')', ']'], // matching pair in same order as in pairOpen
  autoPairs: { '{': '}', '(': ')', '[': ']', '<': '>', '"': '"', "'": "'" }, // pairs to automatically insert
  showLineNumbers: false, // whether to show line numbers or not
  plugins: [], // List of plugins
  render: (code, el) => { el.textContent = code + '\u200B' }, // rendering function
});
```
