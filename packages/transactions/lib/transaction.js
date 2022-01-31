export type TransactionStatus = 'complete' | 'failed' | 'pending' | 'queued';

export type TransactionDetails = {
  hash: string,
  id: string,
  amount: string,
  recipientAddress: string,
  fromAddress: string,
  network: string,
  feeAmount: string,
  date: Date,
  status: TransactionStatus,
  retrySucceed: boolean,
  error: string,
};

export class Transaction {
  details: TransactionDetails;

  static create({accountAddress, amount}) {}

  on() {}

  getStatus() {
    return this.details.status;
  }

  send() {
    // TODO: Offline mode should queue the transaction
  }

  retry() {}
}
