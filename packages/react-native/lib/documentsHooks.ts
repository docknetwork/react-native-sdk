import {WalletEvents} from '@docknetwork/wallet-sdk-core/src/wallet';
import {useCallback, useEffect, useState} from 'react';
import {getWallet} from './wallet';

const useEventListener = (eventManager, eventNames, listener) => {
  useEffect(() => {
    eventNames.forEach(eventName => eventManager.on(eventName, listener));
    return () =>
      eventNames.forEach(eventName =>
        eventManager.removeListener(eventName, listener),
      );
  }, [eventManager, eventNames, listener]);
};

const events = [
  WalletEvents.documentAdded,
  WalletEvents.documentRemoved,
  WalletEvents.documentUpdated,
];

export function useDocument(id) {
  const [document, setDocument] = useState(null);

  const refetchDocument = useCallback(
    async updatedDoc => {
      if (updatedDoc.id !== id) return;
      const doc = await getWallet().getDocumentById(id);
      setDocument(doc);
    },
    [id],
  );

  useEffect(() => {
    getWallet().getDocumentById(id).then(setDocument);
  }, [id]);

  useEventListener(getWallet().eventManager, events, refetchDocument);

  return document;
}

export function useDocuments({type = null} = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(
    async (updatedDoc, forceFetch = false) => {
      console.log('fetching documents', updatedDoc, forceFetch);
      if (
        forceFetch ||
        updatedDoc?.type === type ||
        updatedDoc?.type?.includes(type)
      ) {
      const docs = await getWallet().getDocumentsByType(type);
      setDocuments(docs);
      setLoading(false);
      }
    },
    [type],
  );

  useEffect(() => {
    fetchDocuments(null, true);
  }, [fetchDocuments, setLoading]);

  useEventListener(getWallet().eventManager, events, fetchDocuments);
  useEventListener(
    getWallet().eventManager,
    [WalletEvents.networkUpdated],
    async () => fetchDocuments(null, true),
  );

  return {
    documents,
    loading,
  };
}
