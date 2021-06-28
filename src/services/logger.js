

export default {
  name: "logger",
  routes: {
    async log(...params) {
      console.log(...params);
      
      return 'ok';
    },
  },
};
