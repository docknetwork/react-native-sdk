import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {WalletEvents} from '@docknetwork/wallet-sdk-core/src/wallet';
import {WalletDocument} from '@docknetwork/wallet-sdk-wasm/src/types';
import {useWallet} from '../index';
import {getCredentialProvider} from '../wallet';

interface CredentialStatus {
  credentialId: string;
  status: any;
  error?: Error;
  lastUpdated: Date;
}

interface CredentialContextValue {
  credentials: WalletDocument[];
  credentialStatusList: CredentialStatus[];
  clearCache: () => Promise<void>;
}

const CredentialContext = createContext<CredentialContextValue | undefined>(
  undefined,
);

export const useCredentialContext = () => {
  const context = useContext(CredentialContext);
  if (!context) {
    throw new Error(
      'useCredentialContext must be used within CredentialProvider',
    );
  }
  return context;
};

interface CredentialProviderProps {
  children: ReactNode;
}

export const CredentialProvider: React.FC<CredentialProviderProps> = ({
  children,
}) => {
  const {documents, wallet} = useWallet();
  const [credentials, setCredentials] = useState<WalletDocument[]>([]);
  const [credentialStatusList, setCredentialStatusList] = useState<CredentialStatus[]>([]);

  useEffect(() => {
    // it should work for string and array of strings
    setCredentials(documents.filter((doc) => doc.type.includes('VerifiableCredential')));
    setCredentialStatusList(documents.filter(doc => doc.type.includes('CredentialStatus')).map(doc => ({
      credentialId: doc.id.replace('#status', ''),
      // @ts-ignore
      status: doc.status,
      // @ts-ignore
      lastUpdated: doc.updatedAt,
    })));
  }, [documents]);

  const clearCache = useCallback(async () => {
    try {
      const statusDocuments = documents.filter(doc => doc.type.includes('CredentialStatus'));
      
      for (const statusDoc of statusDocuments) {
        await wallet.removeDocument(statusDoc.id);
      }
      
      setCredentialStatusList([]);
    } catch (error) {
      console.error('Error clearing credential status cache:', error);
      throw error;
    }
  }, [documents, wallet]);

  const value = useMemo(
    () => ({
      credentials,
      credentialStatusList,
      clearCache,
    }),
    [
      credentials,
      credentialStatusList,
      clearCache,
    ],
  );

  return (
    <CredentialContext.Provider value={value}>
      {children}
    </CredentialContext.Provider>
  );
};

export const useCredentialStatus = (credentialId: string) => {
  const {
    credentialStatusList,
  } = useCredentialContext();

  return credentialStatusList.find(status => status.credentialId === credentialId);
};
