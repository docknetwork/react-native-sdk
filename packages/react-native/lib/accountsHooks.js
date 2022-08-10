import {useWallet} from './index';
import {useMemo} from 'react';

export function useAccounts() {
  const {documents} = useWallet({syncDocs: true});
  const accounts = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents.filter(doc => doc.type === 'Address');
    }
    return [];
  }, [documents]);

  return useMemo(() => {
    return {
      accounts,
    };
  }, [accounts]);
}
