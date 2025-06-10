import { useDocument, useDocuments } from './documentsHooks';
import { getWallet } from './wallet';
import { act, renderHook } from '@testing-library/react-hooks';

const mockDocument = { id: 'mock-document-id' };

const mockWallet = {
  getDocumentById: jest.fn(() => Promise.resolve(mockDocument)),
  getDocumentsByType: jest.fn(() => Promise.resolve([])),
  eventManager: {
    on: jest.fn(),
    removeListener: jest.fn(),
  },
};

jest.mock('./wallet', () => ({
  getWallet: jest.fn(() => mockWallet),
}));

describe('useDocument', () => {

  beforeEach(() => {
    getWallet.mockReturnValue(mockWallet);
    mockWallet.getDocumentById.mockReset();
    mockWallet.eventManager.on.mockReset();
    mockWallet.eventManager.removeListener.mockReset();
  });

  it('should fetch the document by documentId', async () => {
    const documentId = 'document-id';
    const document = { id: documentId, content: 'content' };
    mockWallet.getDocumentById.mockResolvedValue(document);

    const { result, waitFor } = renderHook(() =>
      useDocument(documentId),
    );

    await waitFor(() => expect(getWallet).toHaveBeenCalled())
    expect(mockWallet.getDocumentById).toHaveBeenCalledWith(documentId);
    expect(result.current).toEqual(document);
  });

  it('should fetch the document when documentUpdated event is emitted', async () => {
    const documentId = 'document-id';
    const initialDocument = { id: documentId, content: 'content' };
    const updatedDocument = { id: documentId, content: 'updated content' };
    mockWallet.getDocumentById
      .mockResolvedValueOnce(initialDocument)
      .mockResolvedValueOnce(updatedDocument);

    const { result, waitFor } = renderHook(() =>
      useDocument(documentId),
    );

    act(() => {
      mockWallet.eventManager.on.mock.calls[0][1](updatedDocument);
    });

    await waitFor(() => expect(mockWallet.getDocumentById).toHaveBeenCalledTimes(2));
    expect(result.current).toEqual(updatedDocument);
  });

  it('should fetch the document when documentAdded event is emitted', async () => {
    const documentId = 'document-id';
    const initialDocument = null;
    const newDocument = { id: documentId, content: 'added content' };
    mockWallet.getDocumentById
      .mockResolvedValueOnce(initialDocument)
      .mockResolvedValueOnce(newDocument);

    const { result, waitFor } = renderHook(() =>
      useDocument(documentId),
    );

    act(() => {
      mockWallet.eventManager.on.mock.calls[0][1](newDocument);
    });

    await waitFor(() => expect(mockWallet.getDocumentById).toHaveBeenCalledTimes(2));
    expect(result.current).toEqual(newDocument);
  });

  it('should fetch the document when documentRemoved event is emitted', async () => {
    const documentId = 'document-id';
    const initialDocument = { id: documentId, content: 'content' };
    const newDocument = { id: documentId, content: 'updated content' };
    mockWallet.getDocumentById
      .mockResolvedValueOnce(initialDocument)
      .mockResolvedValueOnce(newDocument);

    const { result, waitFor } = renderHook(() =>
      useDocument(documentId),
    );

    act(() => {
      mockWallet.eventManager.on.mock.calls[0][1](newDocument);
    });

    await waitFor(() => expect(mockWallet.getDocumentById).toHaveBeenCalledTimes(2));
    expect(result.current).toEqual(newDocument);
  });

});

describe('useDocuments', () => {
  beforeEach(() => {
    getWallet.mockReturnValue(mockWallet);
    mockWallet.getDocumentById.mockReset();
    mockWallet.eventManager.on.mockReset();
    mockWallet.eventManager.removeListener.mockReset();
  });

  it('should fetch the document correctly', async () => {
    const type = 'type1';
    const documents = [
      { id: 'doc1', type },
      { id: 'doc2', type },
    ];
    mockWallet.getDocumentsByType.mockResolvedValue(documents);

    const { result, waitFor } = renderHook(() => useDocuments({ type }));

    await waitFor(() => expect(mockWallet.getDocumentsByType).toHaveBeenCalledWith(type));
    expect(result.current.documents).toEqual(documents);
    expect(result.current.loading).toEqual(false);
  });
  it('should refetch documents on networkUpdated event', async () => {
    const { waitFor } = renderHook(() =>
      useDocuments({ type: 'mockType' }),
    );
    await mockWallet.eventManager.on.mock.calls[2][1]();

    expect(mockWallet.getDocumentsByType).toHaveBeenCalledWith('mockType');
  });

  it('should force refetch documents on networkUpdated event if type is not set', async () => {
    const { waitFor } = renderHook(() =>
      useDocuments(),
    );
    mockWallet.getDocumentsByType.mockReset();
    await mockWallet.eventManager.on.mock.calls[3][1]();

    expect(mockWallet.getDocumentsByType).toHaveBeenCalledTimes(1);
  });
});
