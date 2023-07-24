import json from '@rollup/plugin-json';
import multiInput from 'rollup-plugin-multi-input';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import flow from 'rollup-plugin-flow';
import {babel} from '@rollup/plugin-babel';

const presets = ['@babel/preset-env'];

export default async function () {
  return [
    {
      presets,
      plugins: [multiInput.default(), json(), babel({ babelHelpers: 'bundled' }), flow({all: true}), commonjs()],
      input: ['src/**/*.js', '!src/**/*.test.js'],
      output: [
        {
          dir: 'lib',
          format: 'esm',
          entryFileNames: '[name].js',
        },
        {
          dir: 'lib',
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      ],
    },
  ];
}
