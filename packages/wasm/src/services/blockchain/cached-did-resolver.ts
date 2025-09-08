import { storageService } from '../storage';

interface CacheEntry {
  value: any;
  id: string;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number;
}

interface DIDResolver {
  resolve(did: string): Promise<any>;
  supports(id: string): boolean;
}

export class CachedDIDResolver {
  private router: DIDResolver;
  private cache: Record<string, CacheEntry> = {};
  private ttl: number;
  private readonly CACHE_KEY = 'did-cache';

  constructor(router: DIDResolver, cacheOptions: CacheOptions = {}) {
    this.router = router;
    // 7 days default
    this.ttl = cacheOptions.ttl || 7 * 24 * 60 * 60 * 1000;
    this.loadCache();
  }

  async loadCache(): Promise<void> {
    const cachedData = await storageService.getItem(this.CACHE_KEY);
    if (cachedData) {
      this.cache = JSON.parse(cachedData);
    }
  }

  async resolve(did: string): Promise<any> {
    const cached = this.cache[did];

    if (cached) {
      if (Date.now() - cached.timestamp < this.ttl) {
        console.log('Cache hit for:', did);
        return cached.value;
      } else {
        console.log('Cache expired for:', did, 'returning stale value and refreshing in background');
        // Return stale value immediately, refresh in background
        this.refreshInBackground(did);
        return cached.value;
      }
    }

    console.log('Cache miss, resolving:', did);
    const result = await this.router.resolve(did);

    this.cache[did] = {
      value: result,
      id: did,
      timestamp: Date.now()
    };

    this.saveCache();

    return result;
  }

  private async refreshInBackground(did: string): Promise<void> {
    try {
      console.log('Refreshing cache in background for:', did);
      const result = await this.router.resolve(did);
      
      this.cache[did] = {
        value: result,
        id: did,
        timestamp: Date.now()
      };

      this.saveCache();
      console.log('Background refresh completed for:', did);
    } catch (error) {
      console.warn('Background refresh failed for:', did, error);
    }
  }

  saveCache(): void {
    storageService.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
  }

  getCache(): Record<string, CacheEntry> {
    return this.cache;
  }

  setCache(cache: Record<string, CacheEntry>): void {
    this.cache = cache;
  }

  /**
   * if the did is provided, it will remove the specific did from the cache
   * otherwise, it will clear the entire cache
   * @param did
   */
  clearCache(did?: string): void {
    if (did) {
      delete this.cache[did];
    } else {
      this.cache = {};
    }
    this.saveCache();
  }

  supports(id: string): boolean {
    return this.router.supports(id);
  }
}