import { LocalStorage } from "../src/types";

export const createMockLocalStorage = (): LocalStorage => {
  let data: any = {};

  return {
    getItem: jest.fn(async key => {
      return data[key];
    }),
    setItem: jest.fn(async (key, value) => {
      data[key] = value;
    }),
    removeItem: jest.fn(async key => {
      delete data[key];
    }),
  };
};
