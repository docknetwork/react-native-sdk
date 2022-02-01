export default {
  name: 'logger',
  routes: {
    async log(...params) {
      // TODO: start using winston
      console.log(...params);
    },
  },
};
