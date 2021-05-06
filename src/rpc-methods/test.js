import { generateMethods } from "../rpc-util";

export default generateMethods({
  parent: "test",
  methodList: [
    function sum(a, b) {
      return a + b;
    },
    function sumObj(params) {
      return params.a + params.b;
    },
  ],
});