/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const {getDefaultConfig} = require('metro-config');
const extraNodeModules = require('node-libs-react-native');

const wasmModules = ['mrklt'];

module.exports = async () => {
  const {
    resolver: {sourceExts, assetExts},
  } = await getDefaultConfig();

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
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
    resolver: {
      resolverMainFields: ['react-native', 'main'],
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      resolveRequest: (context, moduleName, platform) => {
        if (wasmModules.includes(moduleName)) {
          return {
            filePath: path.join(__dirname, './scripts/wasm-fallback.js'),
            type: 'sourceFile',
          };
        }

        if (moduleName.includes('@docknetwork/wallet-sdk-wasm/lib')) {
          // TODO: fix this on wallet-sdk-wasm rollup configs, this is breaking on react-native
          moduleName = moduleName.replace(
            '@docknetwork/wallet-sdk-wasm/lib',
            '@docknetwork/wallet-sdk-wasm/src',
          );
        }

        // Chain to the standard Metro resolver.
        return context.resolveRequest(context, moduleName, platform);
      },
      extraNodeModules: {
        ...extraNodeModules,
        vm: require.resolve('vm-browserify'),
        src: path.resolve(__dirname, './src'),
        realm: require.resolve('realm'),
        // 'credentials-context': path.resolve(
        //   __dirname,
        //   './rn-packages/credentials-context.js',
        // ),
        // 'security-context': path.resolve(
        //   __dirname,
        //   './rn-packages/security-context.js',
        // ),
      },
    },
  };
};
