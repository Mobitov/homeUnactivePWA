/**
 * Service Worker for HomeUnactive PWA
 * Enhanced offline implementation with synchronization support
 * Features:
 * - Advanced caching strategies for different content types
 * - API response caching for offline data access
 * - Offline fallback page
 * - Background sync support
 */

const CACHE_NAME = 'homeunactive-cache-v1';

// Assets to cache immediately on installation
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Dynamic cache for runtime assets
const DYNAMIC_CACHE = 'homeunactive-dynamic-v1';

// API cache for offline data
const API_CACHE = 'homeunactive-api-v1';

// Routes that should be cached with different strategies
const ROUTES_TO_CACHE = [
  '/workouts',
  '/stats',
  '/profile',
  '/settings'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting(); // Activate immediately

  event.waitUntil(
    Promise.all([
      // Cache app shell assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      }),
      
      // Create dynamic cache
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('[Service Worker] Initializing dynamic cache');
        return cache;
      }),
      
      // Create API cache
      caches.open(API_CACHE).then(cache => {
        console.log('[Service Worker] Initializing API cache');
        return cache;
      })
    ])
    .catch(error => {
      console.error('[Service Worker] Precaching failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              // Keep the current versions of our caches
              return name !== CACHE_NAME && 
                     name !== DYNAMIC_CACHE && 
                     name !== API_CACHE;
            })
            .map(name => {
              console.log(`[Service Worker] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Now ready to handle fetches!');
        return self.clients.claim();
      })
  );
});

// Helper function to determine which caching strategy to use
const getCachingStrategy = (request) => {
  const url = new URL(request.url);
  
  // API requests
  if (url.pathname.includes('/api/')) {
    return 'network-first-with-api-cache';
  }
  
  // App routes/pages
  if (ROUTES_TO_CACHE.some(route => url.pathname.includes(route))) {
    return 'cache-first';
  }
  
  // Static assets (JS, CSS, images)
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  ) {
    return 'cache-first';
  }
  
  // Default to network-first for everything else
  return 'network-first';
};

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;
  
  const strategy = getCachingStrategy(event.request);
  
  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirstStrategy(event));
      break;
    case 'network-first':
      event.respondWith(networkFirstStrategy(event));
      break;
    case 'network-first-with-api-cache':
      event.respondWith(networkFirstWithApiCacheStrategy(event));
      break;
    default:
      event.respondWith(networkFirstStrategy(event));
  }
});

// Cache-first strategy: Try cache first, then network
const cacheFirstStrategy = (event) => {
  return caches.match(event.request)
    .then(cachedResponse => {
      if (cachedResponse) {
        // Return the cached version
        return cachedResponse;
      }
      
      // If not in cache, try to fetch it
      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Cache the fetched resource
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(err => console.error('[SW] Cache write error:', err));
            
          return response;
        })
        .catch(error => {
          // If it's a page request, show offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
          throw error;
        });
    });
};

// Network-first strategy: Try network first, then cache
const networkFirstStrategy = (event) => {
  return fetch(event.request)
    .then(response => {
      if (!response || response.status !== 200) {
        return response;
      }
      
      // Cache the successful response
      const responseToCache = response.clone();
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          cache.put(event.request, responseToCache);
        })
        .catch(err => console.error('[SW] Cache write error:', err));
        
      return response;
    })
    .catch(error => {
      console.log('[SW] Network request failed, trying cache...', error);
      
      return caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If it's a page request, show offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
          
          throw error;
        });
    });
};

// Network-first with API cache strategy: Specialized for API requests
const networkFirstWithApiCacheStrategy = (event) => {
  return fetch(event.request)
    .then(response => {
      if (!response || response.status !== 200) {
        return response;
      }
      
      // Cache the successful API response
      const responseToCache = response.clone();
      caches.open(API_CACHE)
        .then(cache => {
          cache.put(event.request, responseToCache);
        })
        .catch(err => console.error('[SW] API cache write error:', err));
        
      return response;
    })
    .catch(error => {
      console.log('[SW] API request failed, trying cache...', error);
      
      return caches.match(event.request, { cacheName: API_CACHE })
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // No cached API response available
          throw error;
        });
    });
};

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'NETWORK_STATUS':
      // Track network status
      const isOnline = event.data.online;
      console.log(`[Service Worker] Network status: ${isOnline ? 'online' : 'offline'}`);
      
      // If we're coming back online, we could trigger background sync here if needed
      if (isOnline) {
        // Notify all clients that we're back online
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'ONLINE_STATUS_CHANGE',
              online: true
            });
          });
        });
      }
      break;
      
    case 'CLEAR_API_CACHE':
      // Clear specific API cache entries if requested
      const urlPattern = event.data.urlPattern;
      if (urlPattern) {
        caches.open(API_CACHE).then(cache => {
          cache.keys().then(requests => {
            requests.forEach(request => {
              if (request.url.includes(urlPattern)) {
                cache.delete(request);
                console.log(`[Service Worker] Cleared API cache for: ${request.url}`);
              }
            });
          });
        });
      }
      break;
  }
});

// Background sync for offline requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    console.log('[Service Worker] Syncing pending requests');
    // The actual sync is handled in the client code through the synchronizeRequests function
    // This is just a hook for potential future extensions
  }
});
