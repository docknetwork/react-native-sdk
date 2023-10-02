import {getAccount, useWallet} from './index';
import {useMemo} from 'react';

export function useAccounts() {
  const {documents, wallet} = useWallet();
  const accounts = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents
        .filter(doc => doc.type === 'Address')
        .map(doc => {
          const account = getAccount(doc.address, documents);
          return {
            fetchBalance: () => {
              wallet?.accounts?.fetchBalance(doc.address);
            },
            ...account,
            ...doc,
          };
        });
    }
    return [];
  }, [documents, wallet?.accounts]);

  return useMemo(() => {
    return {
      accounts,
    };
  }, [accounts]);
}
