import { driver } from 'did-method-key';
import { IDidManager, DIDResponse } from '../interface/i.did.manager';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';

export class DidKeyManager  implements IDidManager{
  private static instance: IDidManager;

  private readonly wallet;

  private constructor() {
    this.wallet = Wallet.getInstance();
  }
  async createDID(options = {}): Promise<DIDResponse> {
    const didDocument = await driver().generate();
    return this.saveDID(didDocument)
  }


  public static getInstance(): IDidManager {
    if (!DidKeyManager.instance) {
      DidKeyManager.instance = new DidKeyManager();
    }
    return DidKeyManager.instance;
  }


  async saveDID(didDocument: any): Promise<DIDResponse> {
    const doc = await this.wallet.add({
      type: 'DID',
      value: didDocument
    })
    return {
      id: doc.id,
      content: doc.value,
    };
  }

  getWallet(): any {
    return this.wallet
  }

  async getDIDs(): Promise<Array<DIDResponse>> {
    const documents = await this.wallet.query({
      type: 'DID',
    });

    return documents.map((document: any) => ({
      content: document.value,
      id: document.id,
    }));
  }
}
