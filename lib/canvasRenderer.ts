import { CapturedPhoto, PhotoboothSettings } from '@/types';
import { FRAME_THEMES, FILTER_OPTIONS } from './constants';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function renderPhotoboothCanvas(
  photos: CapturedPhoto[],
  settings: PhotoboothSettings,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load all images
  const loadedImages: HTMLImageElement[] = [];
  for (const p of photos) {
    try {
      const img = await loadImage(p.dataUrl);
      loadedImages.push(img);
    } catch (e) {
      console.warn('Failed to load photo:', e);
    }
  }

  if (loadedImages.length === 0) {
    throw new Error('Tidak ada foto yang tersedia untuk dirender.');
  }

  const theme = FRAME_THEMES.find((t) => t.id === settings.frameThemeId) || FRAME_THEMES[0];
  const bgColor = settings.customFrameColor || theme.bgColor;
  const textColor = theme.textColor;
  const accentColor = theme.accentColor;

  const filterDef = FILTER_OPTIONS.find((f) => f.id === settings.filter);
  const canvasFilter = filterDef ? filterDef.cssFilter : 'none';

  // Base dimensions (will be multiplied by scale)
  let baseWidth = 600;
  let baseHeight = 1800;

  if (settings.layout === 'strip') {
    // Single vertical strip
    baseWidth = 500;
    const photoH = 340;
    const padding = 28;
    const gap = 20;
    const footerH = 140;
    baseHeight = padding * 2 + loadedImages.length * photoH + (loadedImages.length - 1) * gap + footerH;
  } else if (settings.layout === 'double-strip') {
    // Twin side-by-side strip
    baseWidth = 1000;
    const photoH = 340;
    const padding = 28;
    const gap = 20;
    const footerH = 140;
    baseHeight = padding * 2 + loadedImages.length * photoH + (loadedImages.length - 1) * gap + footerH;
  } else if (settings.layout === 'grid-2x2') {
    // 2x2 Polaroid Grid
    baseWidth = 800;
    baseHeight = 940;
  }

  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;
  ctx.scale(scale, scale);

  // 1. Draw Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // 2. Draw Decorative Patterns
  drawPattern(ctx, theme.pattern || 'none', baseWidth, baseHeight, accentColor);

  // 3. Draw Photos based on layout
  if (settings.layout === 'strip') {
    renderSingleStrip(ctx, loadedImages, baseWidth, canvasFilter);
  } else if (settings.layout === 'double-strip') {
    renderDoubleStrip(ctx, loadedImages, baseWidth, canvasFilter);
  } else if (settings.layout === 'grid-2x2') {
    renderGrid2x2(ctx, loadedImages, baseWidth, canvasFilter);
  }

  // 4. Draw Footer Text & Date
  drawFooterTexts(ctx, settings, baseWidth, baseHeight, textColor, accentColor);

  // 5. Draw Stickers
  drawStickers(ctx, settings, baseWidth, baseHeight);

  return canvas;
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: string,
  width: number,
  height: number,
  accentColor: string
) {
  ctx.save();
  if (pattern === 'dots') {
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.15;
    const step = 24;
    for (let x = 12; x < width; x += step) {
      for (let y = 12; y < height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'grid') {
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    const step = 30;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (pattern === 'film') {
    // 35mm film perforations along left & right borders
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    const holeW = 12;
    const holeH = 16;
    const step = 32;
    for (let y = 16; y < height - 16; y += step) {
      // Left sprocket
      drawRoundedRect(ctx, 8, y, holeW, holeH, 3);
      ctx.fill();
      // Right sprocket
      drawRoundedRect(ctx, width - 8 - holeW, y, holeW, holeH, 3);
      ctx.fill();
    }
  } else if (pattern === 'hearts') {
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.18;
    ctx.font = '16px serif';
    for (let y = 30; y < height; y += 70) {
      ctx.fillText('♥', 10, y);
      ctx.fillText('♥', width - 24, y + 35);
    }
  } else if (pattern === 'stars') {
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.2;
    ctx.font = '16px serif';
    for (let y = 30; y < height; y += 60) {
      ctx.fillText('✦', 12, y);
      ctx.fillText('✦', width - 24, y + 30);
    }
  }
  ctx.restore();
}

function renderSingleStrip(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  stripWidth: number,
  filterCss: string
) {
  const paddingX = 36;
  const startY = 36;
  const photoW = stripWidth - paddingX * 2;
  const photoH = Math.round(photoW * 0.72); // 4:3-ish ratio
  const gap = 18;

  images.forEach((img, index) => {
    const y = startY + index * (photoH + gap);

    // Photo shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, paddingX, y, photoW, photoH, 8);
    ctx.fill();
    ctx.restore();

    // Clip & Draw image
    ctx.save();
    drawRoundedRect(ctx, paddingX, y, photoW, photoH, 8);
    ctx.clip();

    ctx.filter = filterCss;
    drawImageCover(ctx, img, paddingX, y, photoW, photoH);
    ctx.restore();

    // Subtle border
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, paddingX, y, photoW, photoH, 8);
    ctx.stroke();
    ctx.restore();
  });
}

function renderDoubleStrip(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  totalWidth: number,
  filterCss: string
) {
  const halfWidth = totalWidth / 2;

  // Render left strip
  renderSingleStrip(ctx, images, halfWidth, filterCss);

  // Render right strip
  ctx.save();
  ctx.translate(halfWidth, 0);
  renderSingleStrip(ctx, images, halfWidth, filterCss);
  ctx.restore();

  // Draw cutting dotted line in center
  ctx.save();
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.45)';
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(halfWidth, 10);
  ctx.lineTo(halfWidth, ctx.canvas.height);
  ctx.stroke();

  // Little scissors icon text
  ctx.fillStyle = 'rgba(120, 120, 120, 0.6)';
  ctx.font = '14px sans-serif';
  ctx.fillText('✂', halfWidth - 6, 24);
  ctx.restore();
}

function renderGrid2x2(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  width: number,
  filterCss: string
) {
  const padding = 36;
  const gap = 16;
  const colW = (width - padding * 2 - gap) / 2;
  const rowH = Math.round(colW * 0.85);

  images.slice(0, 4).forEach((img, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = padding + col * (colW + gap);
    const y = padding + row * (rowH + gap);

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, x, y, colW, rowH, 8);
    ctx.fill();
    ctx.restore();

    // Clip & Draw
    ctx.save();
    drawRoundedRect(ctx, x, y, colW, rowH, 8);
    ctx.clip();
    ctx.filter = filterCss;
    drawImageCover(ctx, img, x, y, colW, rowH);
    ctx.restore();

    // Border
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, x, y, colW, rowH, 8);
    ctx.stroke();
    ctx.restore();
  });
}

function drawFooterTexts(
  ctx: CanvasRenderingContext2D,
  settings: PhotoboothSettings,
  width: number,
  height: number,
  textColor: string,
  accentColor: string
) {
  ctx.save();
  ctx.textAlign = 'center';

  if (settings.layout === 'double-strip') {
    const halfWidth = width / 2;
    drawSingleFooter(ctx, settings, halfWidth / 2, height, textColor, accentColor);
    drawSingleFooter(ctx, settings, halfWidth + halfWidth / 2, height, textColor, accentColor);
  } else {
    drawSingleFooter(ctx, settings, width / 2, height, textColor, accentColor);
  }

  ctx.restore();
}

function drawSingleFooter(
  ctx: CanvasRenderingContext2D,
  settings: PhotoboothSettings,
  centerX: number,
  totalHeight: number,
  textColor: string,
  accentColor: string
) {
  const footerBaseY = totalHeight - 75;

  // Title
  if (settings.title) {
    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px ui-sans-serif, system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(settings.title.toUpperCase(), centerX, footerBaseY);
  }

  // Date
  if (settings.showDate && settings.dateText) {
    ctx.fillStyle = accentColor;
    ctx.font = '600 13px ui-sans-serif, system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(settings.dateText, centerX, footerBaseY + 28);
  }

  // Mini Branding Watermark
  if (settings.showWatermark) {
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.45;
    ctx.font = 'italic 10px ui-sans-serif, system-ui, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('ONLINE BOOTH • MEMORIES', centerX, footerBaseY + 50);
    ctx.globalAlpha = 1.0;
  }
}

function drawStickers(
  ctx: CanvasRenderingContext2D,
  settings: PhotoboothSettings,
  width: number,
  height: number
) {
  if (!settings.stickers || settings.stickers.length === 0) return;

  settings.stickers.forEach((sticker) => {
    ctx.save();
    const x = (sticker.x / 100) * width;
    const y = (sticker.y / 100) * height;

    ctx.translate(x, y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${sticker.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  });
}

// Utility: Draw image with cover aspect ratio
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    // Image is wider than target
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    // Image is taller than target
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Utility: Rounded Rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
