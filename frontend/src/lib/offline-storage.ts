/**
 * IndexedDB-based offline storage system for the HomeUnactive PWA
 * Handles offline data storage, request queuing, and synchronization
 * Provides automatic synchronization when back online
 */

// Database configuration
const DB_NAME = 'homeunactive-offline-db';
const DB_VERSION = 1;
const STORE_CACHE = 'api-cache';
const STORE_QUEUE = 'request-queue';

// Types
type ApiRequest = {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
};

type CachedResponse = {
  url: string;
  data: any;
  timestamp: number;
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Failed to open offline database');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        const cacheStore = db.createObjectStore(STORE_CACHE, { keyPath: 'url' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Store data in cache
export const cacheApiResponse = async (url: string, data: any): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_CACHE], 'readwrite');
    const store = transaction.objectStore(STORE_CACHE);
    
    const cacheEntry: CachedResponse = {
      url,
      data,
      timestamp: Date.now()
    };
    
    store.put(cacheEntry);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Failed to cache API response:', error);
    throw error;
  }
};

// Get cached data
export const getCachedResponse = async (url: string): Promise<any | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_CACHE], 'readonly');
    const store = transaction.objectStore(STORE_CACHE);
    
    const request = store.get(url);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Failed to get cached response:', error);
    return null;
  }
};

// Queue request for later
export const queueRequest = async (request: Omit<ApiRequest, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const queuedRequest: ApiRequest = {
      ...request,
      id,
      timestamp: Date.now()
    };
    
    store.add(queuedRequest);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(id);
      transaction.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Failed to queue request:', error);
    throw error;
  }
};

// Get all queued requests
export const getQueuedRequests = async (): Promise<ApiRequest[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Failed to get queued requests:', error);
    return [];
  }
};

// Remove a request from the queue
export const removeQueuedRequest = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    
    store.delete(id);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Failed to remove queued request:', error);
    throw error;
  }
};

// Clear outdated cache (older than 7 days)
export const clearOldCache = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_CACHE], 'readwrite');
    const store = transaction.objectStore(STORE_CACHE);
    const index = store.index('timestamp');
    
    // Calculate timestamp for 7 days ago
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const range = IDBKeyRange.upperBound(oneWeekAgo);
    const request = index.openCursor(range);
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
};

// Network status monitoring
export const setupNetworkMonitoring = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  const handleOnline = () => {
    console.log('App is online');
    onOnline();
  };

  const handleOffline = () => {
    console.log('App is offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Check if the app is currently online
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Synchronize all queued requests when back online
export const synchronizeRequests = async (): Promise<void> => {
  if (!isOnline()) {
    console.log('[Sync] Cannot synchronize while offline');
    return;
  }

  try {
    const queuedRequests = await getQueuedRequests();
    
    if (queuedRequests.length === 0) {
      console.log('[Sync] No requests to synchronize');
      return;
    }

    console.log(`[Sync] Processing ${queuedRequests.length} queued requests`);
    
    // Sort requests by timestamp (oldest first)
    const sortedRequests = [...queuedRequests].sort((a, b) => a.timestamp - b.timestamp);
    
    // Process each request
    for (const request of sortedRequests) {
      try {
        console.log(`[Sync] Processing request: ${request.method} ${request.url}`);
        
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers || {},
          body: request.body ? JSON.stringify(request.body) : undefined,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
        }
        
        // If successful, remove the request from the queue
        await removeQueuedRequest(request.id);
        console.log(`[Sync] Successfully processed request: ${request.id}`);
        
        // Dispatch a custom event to notify components about the synchronized data
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('offline-sync-processed', {
            detail: {
              requestId: request.id,
              url: request.url,
              method: request.method,
              success: true
            }
          }));
        }
      } catch (error) {
        console.error(`[Sync] Failed to process request ${request.id}:`, error);
        
        // Notify about failed synchronization
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('offline-sync-processed', {
            detail: {
              requestId: request.id,
              url: request.url,
              method: request.method,
              success: false,
              error
            }
          }));
        }
      }
    }
    
    // Final notification that sync is complete
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: {
          totalProcessed: queuedRequests.length
        }
      }));
    }
  } catch (error) {
    console.error('[Sync] Error during synchronization:', error);
  }
};
