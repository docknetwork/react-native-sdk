import { Wallet } from "../src/modules/wallet";

async function main() {
  const wallet = Wallet.getInstance();

  await wallet.load();
  
  
}

main();