export type LayoutStyle = 'strip' | 'double-strip' | 'grid-2x2';

export type DuoSplitStyle = 'side-by-side' | 'stacked' | 'picture-in-picture';

export type FilterStyle = 
  | 'normal' 
  | 'bw' 
  | 'vintage' 
  | 'warm' 
  | 'cool' 
  | 'sepia' 
  | 'soft';

export interface FrameTheme {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  borderColor?: string;
  pattern?: 'none' | 'dots' | 'grid' | 'film' | 'hearts' | 'stars';
}

export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // in pixels
  rotation: number; // degrees
}

export interface PhotoboothSettings {
  shotCount: 3 | 4;
  timerDuration: 3 | 5 | 10;
  isMirrored: boolean;
  soundEnabled: boolean;
  filter: FilterStyle;
  frameThemeId: string;
  customFrameColor: string;
  layout: LayoutStyle;
  title: string;
  dateText: string;
  showDate: boolean;
  showWatermark: boolean;
  stickers: StickerItem[];
  duoSplitStyle?: DuoSplitStyle;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

// Room & WebRTC Online Meet Types
export interface RoomParticipant {
  id: string;
  name: string;
  role: 'host' | 'guest';
  isReady: boolean;
  isMicMuted: boolean;
  isCameraOff: boolean;
  joinedAt: number;
  lastSeen: number;
}

export type RoomSessionStatus = 
  | 'waiting'      // Waiting for 2nd person
  | 'ready'        // Both participants in room
  | 'countdown'    // Synchronized countdown active
  | 'capturing'    // Snapping shot
  | 'finished';    // All poses taken, ready to style

export interface SignalMessage {
  id: string;
  senderId: string;
  targetId?: string;
  type: 
    | 'sdp_offer' 
    | 'sdp_answer' 
    | 'ice_candidate' 
    | 'start_countdown' 
    | 'sync_photo' 
    | 'sync_settings' 
    | 'finish_session' 
    | 'chat';
  payload: unknown;
  timestamp: number;
}

export interface RoomData {
  id: string;
  roomCode: string;
  createdAt: number;
  hostId: string;
  guestId?: string;
  participants: Record<string, RoomParticipant>;
  status: RoomSessionStatus;
  shotCount: 3 | 4;
  timerDuration: 3 | 5 | 10;
  currentPoseIndex: number;
  countdownNumber: number | null;
  capturedPhotos: CapturedPhoto[];
  settings: PhotoboothSettings;
  signals: SignalMessage[];
}
