module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    jest: true,
    node: true,
  },
  globals: {
    localStorage: 'readonly',
  },
  overrides: [
    {
      files: ['jest.setup.js', '**/__tests__/**/*', '**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
    },
    {
      files: ['shim.js'],
      env: {
        browser: true,
      },
      globals: {
        localStorage: 'writable',
      },
    },
  ],
};
