const path = require('path');

module.exports = {
  // Use the same test environment as Create React App
  testEnvironment: 'jsdom',
  
  // Setup files after env
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module name mapper to handle webpack aliases and special imports
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    
    // Handle @docknetwork/credential-sdk exports field mapping
    '^@docknetwork/credential-sdk/(.*)$': '<rootDir>/node_modules/@docknetwork/credential-sdk/dist/esm/$1',
    
    // Handle node polyfills
    '^assert$': 'assert-browserify',
    '^crypto$': 'crypto-browserify',
    '^fs$': '<rootDir>/src/__mocks__/fs.js',
    '^path$': 'path-browserify',
    '^process$': 'process/browser',
  },
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        ['@babel/plugin-proposal-decorators', { legacy: true }]
      ]
    }],
    '^.+\\.wasm$': '<rootDir>/src/__mocks__/wasmTransform.js',
  },
  
  // Ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(@docknetwork|@sphereon|@digitalcredentials|@transmute|@comunica|@stablelib)/)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node', 'wasm'],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  // Module paths
  modulePaths: ['<rootDir>/src'],
  
  // Resolver configuration
  resolver: '<rootDir>/jest.resolver.js',
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/setupTests.js',
    '!src/shim.js'
  ],
  
  // Global setup
  globals: {
    'window': {},
    'global': {}
  }
};