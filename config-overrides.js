const { override } = require("customize-cra");
const path = require("path");

const supportMjs = () => (config) => {
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });

  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      mrklt: path.resolve(__dirname, "src/mrklt.js"),
    },
  };

  return config;
};

module.exports = override(supportMjs());
