export interface IDidManager {
  createDID: (options?: any)=> Promise<string>
  resolveDID: (did: string)=> Promise<any>
  saveDID: (did: string)=> Promise<boolean>
  getWallet: ()=> any
}
