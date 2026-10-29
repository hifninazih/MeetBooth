'use client';

import { useState, useCallback } from 'react';
import { CapturedPhoto, PhotoboothSettings, StickerItem } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

const STORAGE_KEY_PHOTOS = 'online_booth_captured_photos';
const STORAGE_KEY_SETTINGS = 'online_booth_settings';

export function usePhotoboothStore() {
  const [photos, setPhotos] = useState<CapturedPhoto[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_PHOTOS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<PhotoboothSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isLoaded] = useState<boolean>(true);

  // Save photos to sessionStorage whenever changed
  const savePhotos = useCallback((newPhotos: CapturedPhoto[]) => {
    setPhotos(newPhotos);
    try {
      sessionStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(newPhotos));
    } catch (e) {
      console.warn('Gagal menyimpan foto ke storage:', e);
    }
  }, []);

  // Update settings and persist
  const updateSettings = useCallback((newSettings: Partial<PhotoboothSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        sessionStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Gagal menyimpan pengaturan ke storage:', e);
      }
      return updated;
    });
  }, []);

  const addPhoto = useCallback((dataUrl: string) => {
    const newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dataUrl,
      timestamp: Date.now(),
    };
    setPhotos((prev) => {
      const updated = [...prev, newPhoto];
      try {
        sessionStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Gagal menyimpan foto:', e);
      }
      return updated;
    });
    return newPhoto;
  }, []);

  const replacePhoto = useCallback((index: number, dataUrl: string) => {
    setPhotos((prev) => {
      const updated = [...prev];
      if (index >= 0 && index < updated.length) {
        updated[index] = {
          ...updated[index],
          dataUrl,
          timestamp: Date.now(),
        };
      }
      try {
        sessionStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Gagal update foto:', e);
      }
      return updated;
    });
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        sessionStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Gagal hapus foto:', e);
      }
      return updated;
    });
  }, []);

  const resetPhotos = useCallback(() => {
    setPhotos([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY_PHOTOS);
    } catch (e) {
      console.warn('Gagal reset storage:', e);
    }
  }, []);

  const addSticker = useCallback((emoji: string) => {
    const newSticker: StickerItem = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      emoji,
      x: 30 + Math.random() * 40,
      y: 70 + Math.random() * 20,
      size: 36,
      rotation: (Math.random() - 0.5) * 30,
    };
    updateSettings({
      stickers: [...settings.stickers, newSticker],
    });
  }, [settings.stickers, updateSettings]);

  const removeSticker = useCallback((id: string) => {
    updateSettings({
      stickers: settings.stickers.filter((s) => s.id !== id),
    });
  }, [settings.stickers, updateSettings]);

  return {
    photos,
    settings,
    isLoaded,
    savePhotos,
    addPhoto,
    replacePhoto,
    removePhoto,
    resetPhotos,
    updateSettings,
    addSticker,
    removeSticker,
  };
}
