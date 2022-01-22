const {rollup} = require('rollup');
const json = require('@rollup/plugin-json');
// const multiInput = require('rollup-plugin-multi-input');
const commonjs = require('@rollup/plugin-commonjs');
// const {terser} = require('rollup-plugin-terser');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
// var flow = require('rollup-plugin-flow');
const {babel} = require('@rollup/plugin-babel');
const {wasm} = require('@rollup/plugin-wasm');

// see below for details on these options
const inputOptions = {
  plugins: [
    // multiInput(),

    wasm(),

    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              esmodules: true,
            },
          },
        ],
        ['@babel/preset-flow'],
      ],
      plugins: ['transform-flow-strip-types'],
    }),
    commonjs(),
    nodeResolve(),

    // flow({
    //   all: true,
    //   // include: "@docknetwork"
    // }),
    json(),
    // terser(),
  ],
};

// you can create multiple outputs from the same input to generate e.g.
// different formats like CommonJS and ESM

async function build({input, outputDir}) {
  let bundle;
  let buildFailed = false;
  try {
    // create a bundle
    bundle = await rollup({
      ...inputOptions,
      input,
    });

    // an array of file names this bundle depends on
    console.log(bundle.watchFiles);

    // await generateOutputs(bundle);
    const outputOptionsList = [
      {
        dir: outputDir,
        format: 'esm',
        entryFileNames: '[name].js',
      },
      {
        dir: outputDir,
        format: 'cjs',
        entryFileNames: '[name].cjs',
      },
    ];
    for (const outputOptions of outputOptionsList) {
      const {output} = await bundle.write(outputOptions);

      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          console.log('Asset', chunkOrAsset);
        } else {
          console.log('Chunk', chunkOrAsset.modules);
        }
      }
    }
  } catch (error) {
    buildFailed = true;
    // do some error reporting
    console.error(error);
  }
  if (bundle) {
    // closes the bundle
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}

module.exports = {
  build,
};
