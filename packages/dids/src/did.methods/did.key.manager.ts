import { driver } from 'did-method-key';
import { IDidManager } from '../interface/i.did.manager';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';

export class DidKeyManager  implements IDidManager{
  private static instance: IDidManager;


  private wallet;

  private constructor() {
    this.wallet = Wallet.getInstance();
  }
  async createDID(options = {}): Promise<string> {
    const didDocument = await driver().generate();
    return didDocument.id.toString()
  }

  async resolveDID(did: string): Promise<any> {
    return  driver().get({did});
  }

  public static getInstance(): IDidManager {
    if (!DidKeyManager.instance) {
      DidKeyManager.instance = new DidKeyManager();
    }

    return DidKeyManager.instance;
  }


  async saveDID(did: string): Promise<boolean> {
    try {
      await this.wallet.add({
        type: 'DID',
        value: did
      })
      return true
    } catch (e) {
      console.error(e)
      return  false
    }
  }

  getWallet(): any {
    return this.wallet
  }
}
