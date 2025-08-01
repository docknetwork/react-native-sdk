// Jest setup file - Load reflect-metadata FIRST before anything else
require('reflect-metadata');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock crypto for React Native
jest.mock('react-native-crypto', () => require('crypto'));

// Mock React Native SQLite Storage
jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    executeSql: jest.fn(),
    close: jest.fn(),
  })),
  deleteDatabase: jest.fn(),
  DEBUG: jest.fn(),
  ERRORS: jest.fn(),
}));

// Mock React Native level fs for SQLite
jest.mock('react-native-level-fs', () => ({
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  stat: jest.fn(),
  unlink: jest.fn(),
}));

// Global timeout for async tests
jest.setTimeout(30000);