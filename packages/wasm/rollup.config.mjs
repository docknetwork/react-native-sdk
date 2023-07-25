import json from '@rollup/plugin-json';
import multiInput from 'rollup-plugin-multi-input';
import commonjs from '@rollup/plugin-commonjs';
import flow from 'rollup-plugin-flow';

export default async function () {
  return [
    {
      plugins: [
        multiInput.default(),
        json(),
        flow({all: true}),
        commonjs(),
      ],
      input: ['src/**/*.js', '!src/**/*.test.js'],
      output: [
        {
          dir: 'lib',
          format: 'cjs',
          entryFileNames: '[name].js'
        },
        {
          dir: 'lib',
          format: 'esm',
          entryFileNames: '[name].mjs'
        },
      ],
    },
  ];
}
