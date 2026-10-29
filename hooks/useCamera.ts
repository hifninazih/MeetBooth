'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCameraOptions {
  isMirrored?: boolean;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCamera({ isMirrored = true }: UseCameraOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Stop current active track
  const stopStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setStream(null);
  }, []);

  // Enumerate video devices
  const updateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = deviceInfos
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${index + 1}`,
        }));
      setDevices(videoInputs);
    } catch (err) {
      console.warn('Gagal membaca daftar kamera:', err);
    }
  }, []);

  // Request camera stream
  const startCamera = useCallback(async (deviceIdToUse?: string, targetFacingMode?: 'user' | 'environment') => {
    // Stop existing stream first
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }

    const currentFacing = targetFacingMode || facingMode;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceIdToUse
        ? {
            deviceId: { exact: deviceIdToUse },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          }
        : {
            facingMode: currentFacing,
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
    };

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung WebRTC kamera.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = newStream;
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      await updateDevices();
      setIsLoading(false);
      setError(null);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      let message = 'Gagal mengakses kamera. Pastikan Anda telah memberikan izin akses.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'Perangkat kamera tidak ditemukan pada perangkat Anda.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          message = 'Kamera sedang digunakan oleh aplikasi lain.';
        }
      }
      setError(message);
      setIsLoading(false);
    }
  }, [facingMode, updateDevices]);

  // Flip camera between front and back
  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setSelectedDeviceId('');
    setIsLoading(true);
    startCamera(undefined, nextMode);
  }, [facingMode, startCamera]);

  // Switch to specific device
  const switchDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsLoading(true);
    startCamera(deviceId);
  }, [startCamera]);

  // Take photo from current video frame
  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      return null;
    }

    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.save();
    if (isMirrored && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored, facingMode]);

  // Mount effect: safely init camera
  useEffect(() => {
    let mounted = true;

    navigator.mediaDevices?.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 },
      },
    })
      .then(async (newStream) => {
        if (!mounted) {
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStreamRef.current = newStream;
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        await updateDevices();
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Camera access error:', err);
        let message = 'Gagal mengakses kamera. Pastikan Anda telah memberikan izin akses.';
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = 'Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            message = 'Perangkat kamera tidak ditemukan pada perangkat Anda.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            message = 'Kamera sedang digunakan oleh aplikasi lain.';
          }
        }
        setError(message);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, [updateDevices]);

  return {
    videoRef,
    stream,
    devices,
    selectedDeviceId,
    facingMode,
    isLoading,
    error,
    startCamera,
    stopStream,
    toggleFacingMode,
    switchDevice,
    capturePhoto,
  };
}
