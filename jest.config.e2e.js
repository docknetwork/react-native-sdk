module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  reporters: ['default', 'jest-junit', '<rootDir>/scripts/slack-reporter.js'],
  testTimeout: 420000,
  maxConcurrency: 1,
  testMatch: ['<rootDir>/integration-tests/**/*.test.ts'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx|cjs)$': [
      'babel-jest',
      {
        configFile: require.resolve('./babel.config.js'),
      },
    ],
  },
  resetMocks: false,
  setupFilesAfterEnv: ['<rootDir>/setup-integration-tests.js'],
  globalTeardown: './scripts/test-teardown-globals.js',
  setupFiles: ['jest-localstorage-mock'],
  moduleNameMapper: {
    '@digitalbazaar/x25519-key-agreement-key-2020':
      '@digitalbazaar/x25519-key-agreement-key-2020/lib/X25519KeyAgreementKey2020',
    '@digitalbazaar/ed25519-verification-key-2020':
      '@digitalbazaar/ed25519-verification-key-2020/lib/Ed25519VerificationKey2020',
    '@digitalbazaar/ed25519-verification-key-2018':
      '@digitalbazaar/ed25519-verification-key-2018/src/Ed25519VerificationKey2018',
    '@digitalbazaar/minimal-cipher': '@digitalbazaar/minimal-cipher/Cipher',
    '@digitalbazaar/did-method-key': '@digitalbazaar/did-method-key/lib/main',
    '@docknetwork/wallet-sdk-wasm/lib/(.*)': '@docknetwork/wallet-sdk-wasm/src/$1',
    '@docknetwork/wallet-sdk-data-store/lib/(.*)': '@docknetwork/wallet-sdk-data-store/src/$1',
    '@docknetwork/wallet-sdk-data-store/lib': '@docknetwork/wallet-sdk-data-store/src',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@polkadot|@babel|@docknetwork|@digitalbazaar|base58-universal)',
  ],
};
