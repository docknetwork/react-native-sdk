export default {
  name: 'storage',
  routes: {
    async getItem(...params) {
      return localStorage.getItem(...params);
    },
    async setItem(...params) {
      return localStorage.setItem(...params);
    },
  },
};
