import { RoomData, RoomParticipant, SignalMessage } from '@/types';
import { DEFAULT_SETTINGS } from './constants';

interface GlobalRoomStore {
  rooms: Map<string, RoomData>;
}

const globalStore = globalThis as unknown as { __photobooth_rooms__?: GlobalRoomStore };

if (!globalStore.__photobooth_rooms__) {
  globalStore.__photobooth_rooms__ = {
    rooms: new Map<string, RoomData>(),
  };
}

const rooms = globalStore.__photobooth_rooms__.rooms;

// Generate friendly 6-char room code like "LDR-892"
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createRoom(hostName: string = 'Host'): { room: RoomData; hostId: string } {
  cleanupOldRooms();

  const id = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const roomCode = generateRoomCode();
  const hostId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const host: RoomParticipant = {
    id: hostId,
    name: hostName,
    role: 'host',
    isReady: true,
    isMicMuted: false,
    isCameraOff: false,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  const newRoom: RoomData = {
    id,
    roomCode,
    createdAt: Date.now(),
    hostId,
    participants: {
      [hostId]: host,
    },
    status: 'waiting',
    shotCount: 3,
    timerDuration: 3,
    currentPoseIndex: 0,
    countdownNumber: null,
    capturedPhotos: [],
    settings: {
      ...DEFAULT_SETTINGS,
      title: 'DUO PHOTOBOOTH',
      duoSplitStyle: 'side-by-side',
    },
    signals: [],
  };

  rooms.set(id, newRoom);
  rooms.set(roomCode.toUpperCase(), newRoom);

  return { room: newRoom, hostId };
}

export function getRoom(idOrCode: string): RoomData | null {
  const room = rooms.get(idOrCode.toUpperCase()) || rooms.get(idOrCode);
  return room || null;
}

export function joinRoom(
  idOrCode: string,
  guestName: string = 'Teman'
): { room: RoomData; guestId: string } | null {
  const room = getRoom(idOrCode);
  if (!room) return null;

  const guestId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const guest: RoomParticipant = {
    id: guestId,
    name: guestName,
    role: 'guest',
    isReady: true,
    isMicMuted: false,
    isCameraOff: false,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  room.participants[guestId] = guest;
  room.guestId = guestId;
  room.status = 'ready';

  return { room, guestId };
}

export function updateParticipant(
  roomId: string,
  participantId: string,
  updates: Partial<RoomParticipant>
): RoomData | null {
  const room = getRoom(roomId);
  if (!room || !room.participants[participantId]) return null;

  room.participants[participantId] = {
    ...room.participants[participantId],
    ...updates,
    lastSeen: Date.now(),
  };

  return room;
}

export function addSignal(
  roomId: string,
  senderId: string,
  type: SignalMessage['type'],
  payload: unknown,
  targetId?: string
): SignalMessage | null {
  const room = getRoom(roomId);
  if (!room) return null;

  const signal: SignalMessage = {
    id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId,
    targetId,
    type,
    payload,
    timestamp: Date.now(),
  };

  room.signals.push(signal);

  if (room.signals.length > 100) {
    room.signals = room.signals.slice(-100);
  }

  return signal;
}

export function getSignals(
  roomId: string,
  participantId: string,
  sinceTimestamp: number = 0
): SignalMessage[] {
  const room = getRoom(roomId);
  if (!room) return [];

  return room.signals.filter(
    (s) =>
      s.senderId !== participantId &&
      s.timestamp > sinceTimestamp &&
      (!s.targetId || s.targetId === participantId)
  );
}

export function updateRoomState(roomId: string, updates: Partial<RoomData>): RoomData | null {
  const room = getRoom(roomId);
  if (!room) return null;

  Object.assign(room, updates);
  return room;
}

function cleanupOldRooms() {
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  for (const [key, room] of rooms.entries()) {
    if (room.createdAt < sixHoursAgo) {
      rooms.delete(key);
    }
  }
}
