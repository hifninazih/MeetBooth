'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomData, RoomParticipant, SignalMessage } from '@/types';

interface UseWebRTCRoomOptions {
  roomId: string;
  participantId: string;
  participantName?: string;
  role: 'host' | 'guest';
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function useWebRTCRoom({
  roomId,
  participantId,
  role,
}: UseWebRTCRoomOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'disconnected'
  >('idle');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

  // Synchronized countdown trigger callback
  const onCountdownReceivedRef = useRef<((duration: number) => void) | null>(null);
  const onPhotoSyncedRef = useRef<((photoDataUrl: string) => void) | null>(null);
  const onFinishSessionRef = useRef<(() => void) | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const lastSignalTimeRef = useRef<number>(0);
  const hasCreatedOfferRef = useRef<boolean>(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize local camera and mic
  const initLocalMedia = useCallback(async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;

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
      console.warn('Microphone access denied, falling back to video only:', err);
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        localStreamRef.current = videoOnly;
        setLocalStream(videoOnly);
        return videoOnly;
      } catch (videoErr) {
        console.error('Camera access completely failed:', videoErr);
        return null;
      }
    }
  }, []);

  // Post a signal message to room
  const sendSignal = useCallback(
    async (type: SignalMessage['type'], payload: unknown) => {
      try {
        await fetch(`/api/rooms/${roomId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: participantId,
            type,
            payload,
          }),
        });
      } catch (err) {
        console.warn('Failed to send signal:', err);
      }
    },
    [roomId, participantId]
  );

  // Setup PeerConnection
  const getOrCreatePeerConnection = useCallback(
    (stream: MediaStream) => {
      if (pcRef.current) return pcRef.current;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      // Add all local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle incoming remote track
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          setConnectionState('connected');
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal('ice_candidate', event.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setConnectionState('connected');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionState('disconnected');
        }
      };

      return pc;
    },
    [sendSignal]
  );

  // Toggle Mic
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !isMicMuted;
      audioTracks.forEach((track) => {
        track.enabled = !nextState;
      });
      setIsMicMuted(nextState);
    }
  }, [isMicMuted]);

  // Toggle Video
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !isCameraOff;
      videoTracks.forEach((track) => {
        track.enabled = !nextState;
      });
      setIsCameraOff(nextState);
    }
  }, [isCameraOff]);

  // Public methods to trigger actions
  const triggerRemoteCountdown = useCallback(
    (duration: number) => {
      sendSignal('start_countdown', { duration });
    },
    [sendSignal]
  );

  const syncCapturedPhoto = useCallback(
    (photoDataUrl: string) => {
      sendSignal('sync_photo', { photoDataUrl });
    },
    [sendSignal]
  );

  const triggerFinishSession = useCallback(() => {
    sendSignal('finish_session', {});
  }, [sendSignal]);

  // Handle incoming signals
  const processSignals = useCallback(
    async (signals: SignalMessage[]) => {
      if (!signals || signals.length === 0) return;

      const pc = pcRef.current;

      for (const sig of signals) {
        try {
          if (sig.type === 'sdp_offer' && role === 'guest' && pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(sig.payload as RTCSessionDescriptionInit));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal('sdp_answer', answer);
          } else if (sig.type === 'sdp_answer' && role === 'host' && pc) {
            if (pc.signalingState !== 'stable') {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.payload as RTCSessionDescriptionInit));
            }
          } else if (sig.type === 'ice_candidate' && pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(sig.payload as RTCIceCandidateInit));
            } catch (iceErr) {
              console.warn('Error adding ICE candidate:', iceErr);
            }
          } else if (sig.type === 'start_countdown') {
            if (onCountdownReceivedRef.current) {
              const p = sig.payload as { duration?: number };
              onCountdownReceivedRef.current(p?.duration || 3);
            }
          } else if (sig.type === 'sync_photo') {
            if (onPhotoSyncedRef.current) {
              const p = sig.payload as { photoDataUrl?: string };
              if (p?.photoDataUrl) {
                onPhotoSyncedRef.current(p.photoDataUrl);
              }
            }
          } else if (sig.type === 'finish_session') {
            if (onFinishSessionRef.current) {
              onFinishSessionRef.current();
            }
          }
        } catch (e) {
          console.warn('Error processing signal:', sig.type, e);
        }
      }
    },
    [role, sendSignal]
  );

  // Main lifecycle: Init media, poll signals, manage room connection
  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function init() {
      const stream = await initLocalMedia();
      if (!isMounted || !stream) return;

      const pc = getOrCreatePeerConnection(stream);

      // Polling loop for signals and room status
      const poll = async () => {
        if (!isMounted) return;
        try {
          const res = await fetch(
            `/api/rooms/${roomId}/signal?participantId=${participantId}&since=${lastSignalTimeRef.current}`
          );
          if (!res.ok) return;

          const data = await res.json();
          if (!data.success) return;

          if (data.signals && data.signals.length > 0) {
            lastSignalTimeRef.current = Math.max(
              ...data.signals.map((s: SignalMessage) => s.timestamp),
              lastSignalTimeRef.current
            );
            await processSignals(data.signals);
          }

          // Check if guest joined to initiate offer (Host only)
          const participants = data.participants as Record<string, RoomParticipant>;
          const participantsList = Object.values(participants);
          const hasGuest = participantsList.some((p) => p.role === 'guest');

          if (role === 'host' && hasGuest && !hasCreatedOfferRef.current && pc) {
            hasCreatedOfferRef.current = true;
            setConnectionState('connecting');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal('sdp_offer', offer);
          }

          // Fetch full room data if needed
          setRoomData((prev) => ({
            ...(prev || ({} as RoomData)),
            participants,
            status: data.roomStatus,
            currentPoseIndex: data.currentPoseIndex,
            countdownNumber: data.countdownNumber,
          }));
        } catch (err) {
          console.warn('Signal polling error:', err);
        }
      };

      // Initial poll
      await poll();
      pollInterval = setInterval(poll, 450);
    }

    init();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [
    roomId,
    participantId,
    role,
    initLocalMedia,
    getOrCreatePeerConnection,
    processSignals,
    sendSignal,
  ]);

  const friendParticipant: RoomParticipant | undefined = roomData?.participants
    ? Object.values(roomData.participants).find((p) => p.id !== participantId)
    : undefined;

  return {
    localStream,
    remoteStream,
    connectionState,
    roomData,
    friendParticipant,
    isGuestJoined: !!friendParticipant,
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
