'use client';

import React, { useState, useRef, useEffect } from 'react';

export const DeviceFeatures = () => {
  const [hasCamera, setHasCamera] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [hasVibration, setHasVibration] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Check device capabilities
  useEffect(() => {
    // Check vibration
    setHasVibration('vibrate' in navigator);
    
    // Check camera & flash availability
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Camera API is not supported in your browser');
      return;
    }
    
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
        
        // Try to detect if any camera has flash
        // Note: This is an approximation as there's no direct API to check flash
        setHasFlash(videoDevices.length > 0);
      })
      .catch(err => {
        console.error('Error checking devices:', err);
        setErrorMessage('Could not check device capabilities');
      });
  }, []);
  
  // Function to start camera
  const startCamera = async () => {
    try {
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = mediaStream;
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsCameraActive(true);
      setErrorMessage(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setErrorMessage('Failed to access camera: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  // Function to stop camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      mediaStreamRef.current = null;
      setStream(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsCameraActive(false);
      setIsFlashOn(false);
    }
  };
  
  // Function to toggle flash
  const toggleFlash = async () => {
    if (!stream) return;
    
    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      // Check if torch is supported
      if (capabilities && 'torch' in capabilities) {
        const newFlashState = !isFlashOn;
        await track.applyConstraints({ advanced: [{ torch: newFlashState }] });
        setIsFlashOn(newFlashState);
      } else {
        setErrorMessage('Flash/torch is not supported on this device');
      }
    } catch (err) {
      console.error('Error toggling flash:', err);
      setErrorMessage('Failed to toggle flash: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  // Function to trigger vibration
  const triggerVibration = () => {
    if (navigator.vibrate) {
      // Vibrate with a pattern: 300ms on, 100ms off, 300ms on
      navigator.vibrate([300, 100, 300]);
    } else {
      setErrorMessage('Vibration not supported on this device');
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Device Features</h2>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Camera</h3>
        <div className="flex items-center justify-between mb-2">
          <span>Camera available: {hasCamera ? 'Yes ✅' : 'No ❌'}</span>
          {hasCamera && (
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`px-4 py-2 rounded ${
                isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
          )}
        </div>
        
        {isCameraActive && (
          <div className="mt-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-lg border border-gray-300"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Flash</h3>
        <div className="flex items-center justify-between">
          <span>Flash available: {hasFlash ? 'Yes ✅' : 'No ❌'}</span>
          {hasFlash && (
            <button
              onClick={toggleFlash}
              disabled={!isCameraActive}
              className={`px-4 py-2 rounded ${
                isFlashOn ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'
              } text-white ${!isCameraActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFlashOn ? 'Turn Flash Off' : 'Turn Flash On'}
            </button>
          )}
        </div>
        {isCameraActive && hasFlash && (
          <p className="text-sm text-gray-600 mt-1">
            Note: Flash will only work if your device supports torch mode and the camera is active.
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Vibration</h3>
        <div className="flex items-center justify-between">
          <span>Vibration available: {hasVibration ? 'Yes ✅' : 'No ❌'}</span>
          {hasVibration && (
            <button
              onClick={triggerVibration}
              className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white"
            >
              Vibrate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceFeatures;
