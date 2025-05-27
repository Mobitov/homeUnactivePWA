'use client';

import React from 'react';
import DeviceFeatures from '@/components/DeviceFeatures';

export default function DeviceTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Device Features Test</h1>
      <p className="mb-6 text-center text-gray-600">
        Test your device's camera, flash, and vibration capabilities
      </p>
      
      <DeviceFeatures />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-2">How to test:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Allow camera permissions when prompted</li>
          <li>Click "Start Camera" to activate your device's camera</li>
          <li>Try the "Turn Flash On" button (requires camera to be active)</li>
          <li>Press "Vibrate" to test your device's vibration motor</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">
          Note: Some features may not work on all devices or browsers. For best results, use Chrome on Android.
        </p>
      </div>
    </div>
  );
}
