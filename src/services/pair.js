import { getCurrentPair } from "./keyring";

function setCurrent(index) {
  currentPairIdx = index;
}

function address() {
  return getCurrentPair().address;
}

function isLocked() {
  return getCurrentPair().isLocked;
}

function lock() {
  return getCurrentPair().lock();
}

function unlock(...params) {
  return getCurrentPair().unlock(...params);
}

function toJson(password) {
  return getCurrentPair().toJson(password);
}

export default {
  name: "pair",
  routes: [
    setCurrent,
    address,
    isLocked,
    lock,
    unlock,
    toJson
  ],
}