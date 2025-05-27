/**
 * API Client wrapper for HomeUnactive PWA
 * Handles offline-first API requests with fallback to cached data
 */

import {
  cacheApiResponse,
  getCachedResponse,
  queueRequest,
  isOnline
} from './offline-storage';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  useCache?: boolean;
  skipCache?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Enhanced fetch function with offline support
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    useCache = true,
    skipCache = false
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include'
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  // Try to use cache first if it's a GET request and caching is enabled
  if (method === 'GET' && useCache && !skipCache) {
    const cachedData = await getCachedResponse(url);
    if (cachedData) {
      console.log(`[API] Using cached data for ${url}`);
      return cachedData as T;
    }
  }

  // Check if we're online
  if (!isOnline()) {
    console.log(`[API] Offline: ${method} ${url}`);
    
    // For GET requests, try to get from cache even if skipCache was true
    if (method === 'GET') {
      const cachedData = await getCachedResponse(url);
      if (cachedData) {
        console.log(`[API] Offline mode: using cached data for ${url}`);
        return cachedData as T;
      }
      throw new Error('No cached data available and device is offline');
    }
    
    // For non-GET requests, queue them for later
    await queueRequest({
      url,
      method,
      body,
      headers: requestInit.headers as Record<string, string>
    });
    
    console.log(`[API] Request queued for when online: ${method} ${url}`);
    throw new Error('Device is offline. Request has been queued for later.');
  }

  // We're online, make the actual request
  try {
    const response = await fetch(url, requestInit);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Cache successful GET responses
    if (method === 'GET' && useCache) {
      await cacheApiResponse(url, data);
    }
    
    return data as T;
  } catch (error) {
    console.error(`[API] Error fetching ${url}:`, error);
    
    // Last attempt to get from cache if it's a GET
    if (method === 'GET' && useCache) {
      const cachedData = await getCachedResponse(url);
      if (cachedData) {
        console.log(`[API] Error recovery: using cached data for ${url}`);
        return cachedData as T;
      }
    }
    
    throw error;
  }
};

// Convenience methods
export const apiGet = <T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) => 
  apiFetch<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
  apiFetch<T>(endpoint, { ...options, method: 'POST', body });

export const apiPut = <T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
  apiFetch<T>(endpoint, { ...options, method: 'PUT', body });

export const apiDelete = <T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) => 
  apiFetch<T>(endpoint, { ...options, method: 'DELETE' });

export const apiPatch = <T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
  apiFetch<T>(endpoint, { ...options, method: 'PATCH', body });
