module.exports = {
  root: true,
  extends: '@react-native-community',
  // plugins: ['jsdoc'],
  rules: {
    "react-native/no-inline-styles": 0,
    // JSDoc rules for TypeScript files
    // "jsdoc/require-jsdoc": ["error", {
    //   "require": {
    //     "FunctionDeclaration": false,
    //     "MethodDefinition": false,
    //     "ClassDeclaration": false,
    //     "ArrowFunctionExpression": false,
    //     "FunctionExpression": false
    //   },
    //   "contexts": [
    //     "ExportNamedDeclaration > FunctionDeclaration",
    //     "ExportNamedDeclaration > TSTypeAliasDeclaration",
    //     "ExportNamedDeclaration > TSInterfaceDeclaration",
    //     "ExportDefaultDeclaration > FunctionDeclaration",
    //     "ExportDefaultDeclaration > ClassDeclaration"
    //   ],
    //   "checkConstructors": false
    // }],
    // "jsdoc/require-description": ["error", {
    //   "contexts": ["any"]
    // }],
    // "jsdoc/require-param": "error",
    // "jsdoc/require-param-type": "off", // TypeScript handles types
    // "jsdoc/require-param-description": "error",
    // "jsdoc/require-returns": "error",
    // "jsdoc/require-returns-type": "off", // TypeScript handles types
    // "jsdoc/require-returns-description": "error",
    // "jsdoc/check-alignment": "error",
    // "jsdoc/check-param-names": "error",
    // "jsdoc/check-tag-names": "error",
    // "jsdoc/check-types": "off", // TypeScript handles types
    // "jsdoc/valid-types": "off" // TypeScript handles types
  },
  overrides: [
    // {
    //   // Apply stricter rules only to TypeScript files
    //   files: ['*.ts', '*.tsx'],
    //   parser: '@typescript-eslint/parser',
    //   parserOptions: {
    //     ecmaVersion: 2020,
    //     sourceType: 'module'
    //   }
    // }
    // {
    //   // Disable JSDoc rules for test files
    //   files: ['*.test.js', '*.test.ts', '*.spec.js', '*.spec.ts'],
    //   rules: {
    //     "jsdoc/require-jsdoc": "off",
    //     "jsdoc/require-description": "off",
    //     "jsdoc/require-param": "off",
    //     "jsdoc/require-returns": "off"
    //   }
    // }
  ],
  globals: {
    Buffer: true
  },
  env: {
    "jest/globals": true,
    "browser": true
  }
};
