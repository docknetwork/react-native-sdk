export default {
  name: 'storage',
  routes: {
    async getItem(...params) {
      return global.localStorage.getItem(...params);
    },
    async setItem(...params) {
      return global.localStorage.setItem(...params);
    },
  },
};
