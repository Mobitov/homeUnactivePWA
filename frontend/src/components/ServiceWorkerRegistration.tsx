'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { setupNetworkMonitoring, isOnline, synchronizeRequests } from '../lib/offline-storage';

export const ServiceWorkerRegistration = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [reconnectionAttempt, setReconnectionAttempt] = useState(0);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Function to check network status and update state
  const checkNetworkStatus = useCallback(() => {
    const offline = !navigator.onLine;
    setIsOffline(offline);
    
    // If offline status changed, handle it
    if (offline) {
      // Show alert after a short delay to avoid false positives
      setTimeout(() => setShowOfflineAlert(true), 1000);
      setReconnectionAttempt(0); // Reset reconnection counter
    } else {
      setShowOfflineAlert(false); // Hide alert when back online
      
      // Trigger synchronization when back online
      synchronizeRequests().catch(err => {
        console.error('Failed to synchronize requests:', err);
      });
    }
    
    // If we have a service worker, send the network status to it
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'NETWORK_STATUS',
        online: !offline
      });
    }
  }, []);
  
  // Reconnection attempt function
  const attemptReconnection = useCallback(() => {
    if (!isOffline) return; // Don't attempt if we're already online
    
    setReconnectionAttempt(prev => prev + 1);
    console.log(`Attempting to reconnect (attempt ${reconnectionAttempt + 1})...`);
    
    // Create a test request to check connectivity
    fetch('/offline-check', { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        console.log('Reconnection successful!');
        setIsOffline(false);
        setShowOfflineAlert(false);
        checkNetworkStatus(); // Refresh network status
      })
      .catch(err => {
        console.log('Still offline:', err);
        // The reconnection interval will try again
      });
  }, [isOffline, reconnectionAttempt, checkNetworkStatus]);

  // Handle DevTools offline mode manually
  const setupDevToolsOfflineDetection = useCallback(() => {
    // Create a request that we'll use to detect DevTools offline mode
    const testOfflineStatus = () => {
      fetch('/offline-check', { method: 'HEAD', cache: 'no-store' })
        .then(() => {
          // If the fetch succeeds, we're online
          if (isOffline) {
            setIsOffline(false);
          }
        })
        .catch(() => {
          // If the fetch fails, we might be offline
          // Check if it's because of DevTools offline mode
          if (navigator.onLine) {
            // Navigator says we're online, but fetch failed - likely DevTools offline mode
            setIsOffline(true);
          }
        });
    };

    // Test offline status immediately and then every 5 seconds
    testOfflineStatus();
    const interval = setInterval(testOfflineStatus, 5000);
    return () => clearInterval(interval);
  }, [isOffline]);

  // Set up reconnection interval when offline
  useEffect(() => {
    if (!isOffline) return;
    
    const reconnectionInterval = setInterval(() => {
      attemptReconnection();
    }, 10000); // Try every 10 seconds
    
    return () => clearInterval(reconnectionInterval);
  }, [isOffline, attemptReconnection]);
  
  // Initialize network monitoring
  useEffect(() => {
    // Initial network status
    checkNetworkStatus();
    
    // Monitor network status changes
    const cleanup = setupNetworkMonitoring(
      () => checkNetworkStatus(),
      () => checkNetworkStatus()
    );

    // Setup detection for DevTools offline mode
    const cleanupDevTools = setupDevToolsOfflineDetection();

    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          setSwRegistration(registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed, but waiting to activate
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Detect controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
      });
      
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OFFLINE_STATUS') {
          setIsOffline(event.data.offline);
        }
      });
    }

    return () => {
      cleanup();
      cleanupDevTools();
    };
  }, [checkNetworkStatus, setupDevToolsOfflineDetection]);

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      // Send message to service worker to skip waiting
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      // Reload page to activate new service worker
      window.location.reload();
    }
  };

  // State for sync status notification
  const [syncStatus, setSyncStatus] = useState<{ show: boolean; message: string; isError?: boolean }>({ 
    show: false, 
    message: '' 
  });

  // Listen for sync events
  useEffect(() => {
    const handleSyncProcessed = (event: CustomEvent) => {
      if (event.detail.success) {
        setSyncStatus({
          show: true,
          message: `Synchronized data successfully`
        });
      } else {
        setSyncStatus({
          show: true,
          message: `Failed to synchronize some data`,
          isError: true
        });
      }
    };

    const handleSyncComplete = (event: CustomEvent) => {
      if (event.detail.totalProcessed > 0) {
        setSyncStatus({
          show: true,
          message: `Synchronized ${event.detail.totalProcessed} offline ${event.detail.totalProcessed === 1 ? 'change' : 'changes'}`
        });

        // Hide the message after 5 seconds
        setTimeout(() => {
          setSyncStatus({ show: false, message: '' });
        }, 5000);
      }
    };

    window.addEventListener('offline-sync-processed', handleSyncProcessed as EventListener);
    window.addEventListener('offline-sync-complete', handleSyncComplete as EventListener);

    return () => {
      window.removeEventListener('offline-sync-processed', handleSyncProcessed as EventListener);
      window.removeEventListener('offline-sync-complete', handleSyncComplete as EventListener);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black py-1 px-4 text-center text-sm">
          You are currently offline. Some features may be limited. 
          {reconnectionAttempt > 0 && (
            <span className="ml-2">Reconnection attempt: {reconnectionAttempt}</span>
          )}
        </div>
      )}
      
      {showOfflineAlert && isOffline && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto border border-red-500">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">You're Offline</h3>
            </div>
            <p className="mb-4 text-gray-700">
              Your device appears to be offline. Don't worry - HomeUnactive works offline, and you can still access your previously loaded data.
            </p>
            <p className="mb-4 text-gray-700">
              We'll automatically attempt to reconnect every 10 seconds.
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowOfflineAlert(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Continue Offline
              </button>
            </div>
          </div>
        </div>
      )}
      
      {syncStatus.show && (
        <div className={`fixed top-${isOffline ? '6' : '0'} left-0 right-0 z-50 ${syncStatus.isError ? 'bg-red-500' : 'bg-green-500'} text-white py-1 px-4 text-center text-sm`}>
          {syncStatus.message}
        </div>
      )}
      
      {updateAvailable && (
        <div className="fixed bottom-20 left-0 right-0 z-50 bg-blue-600 text-white py-2 px-4 flex justify-between items-center">
          <span>App update available!</span>
          <button 
            onClick={handleUpdate}
            className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium"
          >
            Update now
          </button>
        </div>
      )}
    </>
  );
};
