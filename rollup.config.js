export default [
  {
    input: 'removeConsole/index.js',
    output: {
      file: 'lib/remove.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
    },
  },
]
