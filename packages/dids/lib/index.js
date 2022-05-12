"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const did_key_manager_1 = require("./did.methods/did.key.manager");
did_key_manager_1.DidKeyManager.getInstance().saveDID('did:key:z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV').then((res) => {
    console.log(res);
});
