import { terser } from 'rollup-plugin-terser';

const plugins = [
  terser(),
];

export default [
  {
    input: 'src/qedit.js',
    output: {
      format: 'umd',
      file: 'lib/qedit.js',
      name: 'Qedit',
    },
    plugins,
  },
  {
    input: 'src/plugins/prism.js',
    output: {
      format: 'umd',
      file: 'lib/plugins/prism.js',
      name: 'QeditPrism',
      globals: { prismjs: 'Prism' }
    },
    external: ['prismjs'],
    plugins,
  },
  {
    input: 'src/plugins/hljs.js',
    output: {
      format: 'umd',
      file: 'lib/plugins/hljs.js',
      name: 'QeditHljs',
      globals: { 'highlight.js': 'hljs' }
    },
    external: ['highlight.js'],
    plugins,
  },
  {
    input: 'src/plugins/prettify.js',
    output: {
      format: 'umd',
      file: 'lib/plugins/prettify.js',
      name: 'QeditPrettify',
      globals: { 'code-prettify': 'PR' }
    },
    external: ['code-prettify'],
    plugins,
  }
];