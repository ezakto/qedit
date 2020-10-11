import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const plugins = [
  production && terser(),
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
  },
  {
    input: 'src/plugins/prettier.js',
    output: {
      format: 'umd',
      file: 'lib/plugins/prettier.js',
      name: 'QeditPrettier',
      globals: { 'prettier/standalone': 'prettier', 'prettier/parser-babel': 'prettierPlugins.babel' }
    },
    external: ['prettier/standalone', 'prettier/parser-babel'],
    plugins,
  }
];
