// Work in progress
// Examples on how to integrate with react
// Will be moved to a separate package

import {useEffect, useState} from 'react';
import {TransactionEvents, Transactions} from './transactions';

function useTransactions() {
  const [transactions, setTransactions] = useState();

  useEffect(() => {
    const txModule = Transactions.getInstance();

    const handleChange = () => {
      txModule.getAll().then(setTransactions);
    };

    txModule.eventManager
      .on(TransactionEvents.added)
      .on(TransactionEvents.updated);
  }, []);
}

function useTransactionBuilder(address) {}

function Test() {
  const {
    transactions,
    handleSend,
    setInput,
    loading,
    handleChange,
    fee,
    isValid,
    errors,
    // refreshFee,
    retry,
  } = useTransactionBuilder('test-address');

  return (
    <div>
      <input onChange={handleChange('amount')} />
      <input onChange={handleChange('toAddress')} />
      <button onChange={handleSend} />
    </div>
  );
}
