const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const extraNodeModules = require('node-libs-react-native');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules,
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    minifierConfig: {
      keep_classnames: true, // enable to fix typeorm
      keep_fnames: true, // enable to fix typeorm
      mangle: {
        toplevel: false,
        keep_classnames: true, // enable to fix typeorm
        keep_fnames: true, // enable to fix typeorm
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_funcs: false,
      },
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
