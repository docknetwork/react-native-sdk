export default class CapabilityInvoker {
  constructor(key) {
    this.key = key;
    this.id = key.id;
  }

  async sign({data}) {
    const signer = this.key.signer();
    return signer.sign({data});
  }

  async toJson(exportPrivateKey = false) {
    const keypair = await this.key.export({
      type: 'JsonWebKey2020',
      privateKey: exportPrivateKey,
    });
    if (keypair.id.indexOf('#') === 0) {
      keypair.id = keypair.controller + keypair.id;
    }
    delete keypair.publicKeyJwk.kid;
    delete keypair.privateKeyJwk.kid;
    return keypair;
  }
}
