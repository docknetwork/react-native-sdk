import { CachedDIDResolver } from './cached-did-resolver';

const mockStorageService = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

jest.mock('../storage', () => ({
  storageService: mockStorageService,
}));

const mockRouter = {
  resolve: jest.fn(),
  supports: jest.fn(),
};

describe('CachedDIDResolver', () => {
  let resolver: CachedDIDResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getItem.mockResolvedValue(null);
    resolver = new CachedDIDResolver(mockRouter);
  });

  describe('constructor', () => {
    it('should initialize with default TTL', () => {
      expect(resolver).toBeDefined();
      expect(mockStorageService.getItem).toHaveBeenCalledWith('did-cache');
    });

    it('should initialize with custom TTL', () => {
      const customTtl = 60000; // 1 minute
      const resolverWithCustomTtl = new CachedDIDResolver(mockRouter, { ttl: customTtl });
      expect(resolverWithCustomTtl).toBeDefined();
    });
  });

  describe('resolve', () => {
    const testDid = 'did:example:123';
    const testResult = { id: testDid, publicKey: [] };

    it('should resolve DID and cache the result on cache miss', async () => {
      mockRouter.resolve.mockResolvedValue(testResult);

      const result = await resolver.resolve(testDid);

      expect(mockRouter.resolve).toHaveBeenCalledWith(testDid);
      expect(result).toEqual(testResult);
      expect(mockStorageService.setItem).toHaveBeenCalled();
    });

    it('should return cached result on cache hit', async () => {
      const cachedData = {
        [testDid]: {
          value: testResult,
          id: testDid,
          timestamp: Date.now(),
        },
      };
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(cachedData));
      const resolverWithCache = new CachedDIDResolver(mockRouter);
      
      const result = await resolverWithCache.resolve(testDid);

      expect(result).toEqual(testResult);
      expect(mockRouter.resolve).not.toHaveBeenCalled();
    });

    it('should return stale value immediately and refresh in background when cache entry is expired', async () => {
      const expiredTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago (expired)
      const staleResult = { id: testDid, publicKey: [], stale: true };
      const freshResult = { id: testDid, publicKey: [], fresh: true };
      
      const cachedData = {
        [testDid]: {
          value: staleResult,
          id: testDid,
          timestamp: expiredTimestamp,
        },
      };

      mockStorageService.getItem.mockResolvedValue(JSON.stringify(cachedData));
      mockRouter.resolve.mockResolvedValue(freshResult);
      
      const resolverWithExpiredCache = new CachedDIDResolver(mockRouter);
      const result = await resolverWithExpiredCache.resolve(testDid);

      // Should return stale value immediately
      expect(result).toEqual(staleResult);
      
      // Background refresh should be triggered (not awaited)
      // Give it time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockRouter.resolve).toHaveBeenCalledWith(testDid);
    });
  });

  describe('getCache', () => {
    it('should return the current cache', () => {
      const cache = resolver.getCache();
      expect(cache).toBeDefined();
      expect(typeof cache).toBe('object');
    });
  });

  describe('setCache', () => {
    it('should set the cache', () => {
      const newCache = { 'did:example:456': { value: {}, id: 'did:example:456', timestamp: Date.now() } };
      resolver.setCache(newCache);
      expect(resolver.getCache()).toEqual(newCache);
    });
  });

  describe('clearCache', () => {
    beforeEach(() => {
      const cache = {
        'did:example:123': { value: {}, id: 'did:example:123', timestamp: Date.now() },
        'did:example:456': { value: {}, id: 'did:example:456', timestamp: Date.now() },
      };
      resolver.setCache(cache);
    });

    it('should clear specific DID from cache', () => {
      resolver.clearCache('did:example:123');
      
      const cache = resolver.getCache();
      expect(cache['did:example:123']).toBeUndefined();
      expect(cache['did:example:456']).toBeDefined();
      expect(mockStorageService.setItem).toHaveBeenCalled();
    });

    it('should clear entire cache when no DID specified', () => {
      resolver.clearCache();
      
      const cache = resolver.getCache();
      expect(Object.keys(cache)).toHaveLength(0);
      expect(mockStorageService.setItem).toHaveBeenCalled();
    });
  });

  describe('supports', () => {
    it('should delegate to router supports method', () => {
      const testId = 'did:example:123';
      mockRouter.supports.mockReturnValue(true);

      const result = resolver.supports(testId);

      expect(mockRouter.supports).toHaveBeenCalledWith(testId);
      expect(result).toBe(true);
    });
  });

  describe('loadCache', () => {
    it('should load cache from storage on initialization', async () => {
      const cachedData = {
        'did:example:123': {
          value: { id: 'did:example:123' },
          id: 'did:example:123',
          timestamp: Date.now(),
        },
      };

      mockStorageService.getItem.mockResolvedValue(JSON.stringify(cachedData));
      
      const newResolver = new CachedDIDResolver(mockRouter);
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow async loadCache to complete

      expect(mockStorageService.getItem).toHaveBeenCalledWith('did-cache');
      expect(newResolver.getCache()).toEqual(cachedData);
    });

    it('should handle empty cache from storage', async () => {
      mockStorageService.getItem.mockResolvedValue(null);
      
      const newResolver = new CachedDIDResolver(mockRouter);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(newResolver.getCache()).toEqual({});
    });
  });
});