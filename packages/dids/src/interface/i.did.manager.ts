export interface DIDResponse {
  id: string
  content: any
}
export interface IDidManager {
  createDID: (options?: any)=> Promise<DIDResponse>
  getDIDs: ()=> Promise<Array<DIDResponse>>
  saveDID: (didDocument: any)=> Promise<DIDResponse>
  getWallet: ()=> any
}
