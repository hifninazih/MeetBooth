import { DuoSplitStyle } from '@/types';

interface CaptureDuoOptions {
  localVideo: HTMLVideoElement | null;
  remoteVideo: HTMLVideoElement | null;
  isLocalMirrored?: boolean;
  isRemoteMirrored?: boolean;
  style?: DuoSplitStyle;
  localName?: string;
  remoteName?: string;
}

export function captureDuoPhoto({
  localVideo,
  remoteVideo,
  isLocalMirrored = true,
  isRemoteMirrored = true,
  style = 'side-by-side',
  localName,
  remoteName,
}: CaptureDuoOptions): string | null {
  const canvas = document.createElement('canvas');
  const targetW = 1200;
  const targetH = 900; // standard 4:3 aspect ratio
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, targetW, targetH);

  if (style === 'side-by-side') {
    const halfW = targetW / 2;

    // Draw Left Half (Local Video)
    if (localVideo && localVideo.readyState >= 2) {
      drawClippedVideo(ctx, localVideo, 0, 0, halfW, targetH, isLocalMirrored);
    } else {
      drawVideoPlaceholder(ctx, 0, 0, halfW, targetH, localName || 'Kamu');
    }

    // Draw Right Half (Remote Video)
    if (remoteVideo && remoteVideo.readyState >= 2) {
      drawClippedVideo(ctx, remoteVideo, halfW, 0, halfW, targetH, isRemoteMirrored);
    } else {
      drawVideoPlaceholder(ctx, halfW, 0, halfW, targetH, remoteName || 'Teman');
    }

    // Elegant vertical divider line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, targetH);
    ctx.stroke();

    // Center cute love badge between both participants
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(halfW, targetH / 2, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💖', halfW, targetH / 2);
    ctx.restore();
  } else if (style === 'stacked') {
    const halfH = targetH / 2;

    // Draw Top Half
    if (localVideo && localVideo.readyState >= 2) {
      drawClippedVideo(ctx, localVideo, 0, 0, targetW, halfH, isLocalMirrored);
    } else {
      drawVideoPlaceholder(ctx, 0, 0, targetW, halfH, localName || 'Kamu');
    }

    // Draw Bottom Half
    if (remoteVideo && remoteVideo.readyState >= 2) {
      drawClippedVideo(ctx, remoteVideo, 0, halfH, targetW, halfH, isRemoteMirrored);
    } else {
      drawVideoPlaceholder(ctx, 0, halfH, targetW, halfH, remoteName || 'Teman');
    }

    // Horizontal divider
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, halfH);
    ctx.lineTo(targetW, halfH);
    ctx.stroke();
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

function drawClippedVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number,
  y: number,
  w: number,
  h: number,
  isMirrored: boolean
) {
  ctx.save();

  // Clip to bounds
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Calculate cover aspect ratio
  const vW = video.videoWidth || 1280;
  const vH = video.videoHeight || 720;
  const videoRatio = vW / vH;
  const targetRatio = w / h;

  let sx = 0, sy = 0, sw = vW, sh = vH;
  if (videoRatio > targetRatio) {
    sw = vH * targetRatio;
    sx = (vW - sw) / 2;
  } else {
    sh = vW / targetRatio;
    sy = (vH - sh) / 2;
  }

  if (isMirrored) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    ctx.drawImage(video, sx, sy, sw, sh, x, y, w, h);
  }

  ctx.restore();
}

function drawVideoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string
) {
  ctx.save();
  ctx.fillStyle = '#27272a';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, x + w / 2, y + h / 2);
  ctx.restore();
}
