import json from '@rollup/plugin-json';
import multiInput from 'rollup-plugin-multi-input';
import commonjs from '@rollup/plugin-commonjs';
import flow from 'rollup-plugin-flow';
import typescript from '@rollup/plugin-typescript'; // Import the TypeScript plugin

export default async function () {
  return [
    {
      plugins: [
        multiInput.default(),
        json(),
        flow({
          all: true,
          include: 'src/**/*.js',
        }),
        commonjs(),
        typescript(),
      ],
      input: ['src/**/*.ts', 'src/**/*.js', '!src/**/*.test.ts', '!src/**/*.test.js'],
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
