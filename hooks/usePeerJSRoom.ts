'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type PeerType from 'peerjs';
import type { DataConnection, MediaConnection } from 'peerjs';

export interface PeerJSRoomOptions {
  roomCode: string;
  participantName: string;
  role: 'host' | 'guest';
}

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
};

// Standardize room code to safe peer ID format: letters & digits only
export function formatPeerRoomId(code: string): string {
  const sanitized = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `mb-${sanitized}-host`;
}

export function usePeerJSRoom({
  roomCode,
  participantName,
  role,
}: PeerJSRoomOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [friendName, setFriendName] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<
    'initializing' | 'waiting_for_peer' | 'connecting' | 'connected' | 'error'
  >('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

  const peerRef = useRef<PeerType | null>(null);
  const dataConnRef = useRef<DataConnection | null>(null);
  const callConnRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Callbacks for events
  const onCountdownReceivedRef = useRef<((duration: number) => void) | null>(null);
  const onPhotoSyncedRef = useRef<((dataUrl: string) => void) | null>(null);
  const onFinishSessionRef = useRef<(() => void) | null>(null);

  // Initialize camera and microphone
  const initMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
        },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('Microphone not available, using video only:', err);
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        localStreamRef.current = videoOnly;
        setLocalStream(videoOnly);
        return videoOnly;
      } catch (videoErr) {
        console.error('Failed to access camera:', videoErr);
        setErrorMessage('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
        setConnectionStatus('error');
        return null;
      }
    }
  }, []);

  // Send message over data connection
  const sendMessage = useCallback((type: string, payload: unknown = {}) => {
    if (dataConnRef.current && dataConnRef.current.open) {
      dataConnRef.current.send({ type, payload });
    }
  }, []);

  const triggerRemoteCountdown = useCallback(
    (duration: number) => {
      sendMessage('START_COUNTDOWN', { duration });
    },
    [sendMessage]
  );

  const syncCapturedPhoto = useCallback(
    (photoDataUrl: string) => {
      sendMessage('SYNC_PHOTO', { photoDataUrl });
    },
    [sendMessage]
  );

  const triggerFinishSession = useCallback(() => {
    sendMessage('FINISH_SESSION', {});
  }, [sendMessage]);

  // Handle incoming data message
  const handleDataMessage = useCallback((data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const msg = data as { type: string; payload?: Record<string, unknown> };

    if (msg.type === 'IDENTIFY') {
      const name = (msg.payload?.name as string) || 'Teman';
      setFriendName(name);
      setConnectionStatus('connected');
    } else if (msg.type === 'START_COUNTDOWN') {
      const dur = (msg.payload?.duration as number) || 3;
      if (onCountdownReceivedRef.current) {
        onCountdownReceivedRef.current(dur);
      }
    } else if (msg.type === 'SYNC_PHOTO') {
      const url = msg.payload?.photoDataUrl as string;
      if (url && onPhotoSyncedRef.current) {
        onPhotoSyncedRef.current(url);
      }
    } else if (msg.type === 'FINISH_SESSION') {
      if (onFinishSessionRef.current) {
        onFinishSessionRef.current();
      }
    }
  }, []);

  // Toggle Mic
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !isMicMuted;
      audioTracks.forEach((t) => (t.enabled = !nextState));
      setIsMicMuted(nextState);
    }
  }, [isMicMuted]);

  // Toggle Camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !isCameraOff;
      videoTracks.forEach((t) => (t.enabled = !nextState));
      setIsCameraOff(nextState);
    }
  }, [isCameraOff]);

  // Main lifecycle: Setup PeerJS instance and WebRTC handlers
  useEffect(() => {
    let isMounted = true;
    let peerInstance: PeerType | null = null;

    async function setupPeer() {
      const stream = await initMedia();
      if (!isMounted || !stream) return;

      try {
        const { default: Peer } = await import('peerjs');

        const hostPeerId = formatPeerRoomId(roomCode);

        if (role === 'host') {
          // Host claims the static host ID for this room code
          peerInstance = new Peer(hostPeerId, {
            config: ICE_CONFIG,
          });
        } else {
          // Guest gets random ID and connects to host
          peerInstance = new Peer({
            config: ICE_CONFIG,
          });
        }

        peerRef.current = peerInstance;

        peerInstance.on('open', () => {
          if (!isMounted) return;

          if (role === 'host') {
            setConnectionStatus('waiting_for_peer');
          } else {
            // Guest initiates connection & call to host
            setConnectionStatus('connecting');

            const conn = peerInstance!.connect(hostPeerId, { reliable: true });
            dataConnRef.current = conn;

            conn.on('open', () => {
              if (!isMounted) return;
              conn.send({ type: 'IDENTIFY', payload: { name: participantName } });
              setConnectionStatus('connected');
            });

            conn.on('data', (d) => {
              if (isMounted) handleDataMessage(d);
            });

            const call = peerInstance!.call(hostPeerId, stream);
            callConnRef.current = call;

            call.on('stream', (rStream) => {
              if (isMounted) {
                setRemoteStream(rStream);
                setConnectionStatus('connected');
              }
            });

            call.on('error', (e) => {
              console.warn('Call error:', e);
            });
          }
        });

        // Host listens for guest connections
        if (role === 'host') {
          peerInstance.on('connection', (conn) => {
            dataConnRef.current = conn;

            conn.on('open', () => {
              // Greet guest and identify host name
              conn.send({ type: 'IDENTIFY', payload: { name: participantName } });
            });

            conn.on('data', (d) => {
              if (isMounted) handleDataMessage(d);
            });
          });

          peerInstance.on('call', (call) => {
            callConnRef.current = call;
            call.answer(stream); // Answer incoming call with local stream

            call.on('stream', (rStream) => {
              if (isMounted) {
                setRemoteStream(rStream);
                setConnectionStatus('connected');
              }
            });
          });
        }

        peerInstance.on('error', (err) => {
          console.warn('PeerJS error:', err.type, err);
          if (!isMounted) return;

          if (err.type === 'unavailable-id') {
            // Host ID already taken, connect as guest instead
            setErrorMessage('Room dengan kode ini sedang aktif. Anda dapat bergabung sebagai teman.');
          } else if (err.type === 'peer-unavailable') {
            setErrorMessage(
              'Host belum berada di dalam room ini. Pastikan teman yang membuat room sudah membuka halaman ini.'
            );
          } else {
            setErrorMessage(`Koneksi terganggu: ${err.message || 'Coba muat ulang halaman'}`);
          }
          setConnectionStatus('error');
        });
      } catch (e) {
        console.error('Failed to initialize PeerJS:', e);
        if (isMounted) {
          setErrorMessage('Gagal memuat sistem koneksi WebRTC.');
          setConnectionStatus('error');
        }
      }
    }

    setupPeer();

    return () => {
      isMounted = false;

      if (callConnRef.current) {
        callConnRef.current.close();
        callConnRef.current = null;
      }

      if (dataConnRef.current) {
        dataConnRef.current.close();
        dataConnRef.current = null;
      }

      if (peerInstance) {
        peerInstance.destroy();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [roomCode, role, participantName, initMedia, handleDataMessage]);

  return {
    localStream,
    remoteStream,
    friendName,
    connectionStatus,
    isGuestJoined: !!remoteStream || connectionStatus === 'connected',
    errorMessage,
    isMicMuted,
    isCameraOff,
    toggleMic,
    toggleCamera,
    triggerRemoteCountdown,
    syncCapturedPhoto,
    triggerFinishSession,
    setOnCountdownReceived: (cb: (duration: number) => void) => {
      onCountdownReceivedRef.current = cb;
    },
    setOnPhotoSynced: (cb: (dataUrl: string) => void) => {
      onPhotoSyncedRef.current = cb;
    },
    setOnFinishSession: (cb: () => void) => {
      onFinishSessionRef.current = cb;
    },
  };
}
