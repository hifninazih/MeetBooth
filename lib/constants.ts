import { FrameTheme, FilterStyle, LayoutStyle, PhotoboothSettings } from '@/types';

export const FRAME_THEMES: FrameTheme[] = [
  {
    id: 'classic-white',
    name: 'Classic White',
    bgColor: '#ffffff',
    textColor: '#1e293b',
    accentColor: '#64748b',
    borderColor: '#e2e8f0',
    pattern: 'none',
  },
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    bgColor: '#18181b',
    textColor: '#f4f4f5',
    accentColor: '#a1a1aa',
    borderColor: '#27272a',
    pattern: 'none',
  },
  {
    id: 'pastel-pink',
    name: 'Sweet Pink',
    bgColor: '#fdf2f8',
    textColor: '#9d174d',
    accentColor: '#f472b6',
    borderColor: '#fbcfe8',
    pattern: 'hearts',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    bgColor: '#f5f3ff',
    textColor: '#5b21b6',
    accentColor: '#a78bfa',
    borderColor: '#ddd6fe',
    pattern: 'stars',
  },
  {
    id: 'retro-cream',
    name: 'Vintage Cream',
    bgColor: '#fefce8',
    textColor: '#713f12',
    accentColor: '#ca8a04',
    borderColor: '#fef08a',
    pattern: 'dots',
  },
  {
    id: 'cyber-mint',
    name: 'Cyber Mint',
    bgColor: '#ecfdf5',
    textColor: '#065f46',
    accentColor: '#34d399',
    borderColor: '#a7f3d0',
    pattern: 'grid',
  },
  {
    id: 'film-noir',
    name: 'Film Negative',
    bgColor: '#09090b',
    textColor: '#fafafa',
    accentColor: '#fbbf24',
    borderColor: '#18181b',
    pattern: 'film',
  },
];

export const FILTER_OPTIONS: { id: FilterStyle; name: string; cssFilter: string }[] = [
  { id: 'normal', name: 'Original', cssFilter: 'none' },
  { id: 'bw', name: 'B&W Classic', cssFilter: 'grayscale(100%) contrast(115%)' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(35%) contrast(105%) brightness(95%) saturate(85%)' },
  { id: 'warm', name: 'Warm Glow', cssFilter: 'sepia(25%) saturate(130%) brightness(102%)' },
  { id: 'cool', name: 'Cool Teal', cssFilter: 'hue-rotate(180deg) saturate(90%) brightness(105%) contrast(95%)' },
  { id: 'sepia', name: 'Sepia Noir', cssFilter: 'sepia(90%) contrast(110%) brightness(90%)' },
  { id: 'soft', name: 'Soft Dream', cssFilter: 'contrast(90%) brightness(108%) saturate(110%)' },
];

export const LAYOUT_OPTIONS: { id: LayoutStyle; name: string; description: string; icon: string }[] = [
  { id: 'strip', name: 'Single Strip', description: 'Klasik vertical photo strip 3 atau 4 foto bertingkat', icon: 'column' },
  { id: 'double-strip', name: 'Twin Strip (2x)', description: 'Dua strip berdampingan cocok untuk dipotong & dibagikan!', icon: 'columns' },
  { id: 'grid-2x2', name: 'Grid 2x2', description: 'Format kotak polaroid 4 foto bergaya album Instagram', icon: 'grid' },
];

export const AVAILABLE_STICKERS: string[] = [
  '✨', '💖', '🌸', '📸', '🎞️', '🎀', '⭐', '✌️', '🧸', '🕶️', '🥂', '🎉',
  '🌻', '🍰', '💄', '🍒', '🦋', '🍀', '🐾', '🔥', '💫', '🖤', '🍓', '💌'
];

export const DEFAULT_SETTINGS: PhotoboothSettings = {
  shotCount: 3,
  timerDuration: 3,
  isMirrored: true,
  soundEnabled: true,
  filter: 'normal',
  frameThemeId: 'classic-white',
  customFrameColor: '#ffffff',
  layout: 'strip',
  title: 'PHOTOBOOTH MEMORY',
  dateText: new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase(),
  showDate: true,
  showWatermark: true,
  stickers: [],
};
