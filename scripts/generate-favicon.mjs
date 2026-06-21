import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';

const WIDTH = 64;
const HEIGHT = 64;
const SIZE = 64;

function drawFavicon(ctx) {
  // Dark background with rounded rect
  const r = 12;
  const x = 0, y = 0, w = WIDTH, h = HEIGHT;
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

  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, '#1a1a2e');
  bg.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = bg;
  ctx.fill();

  // Gold border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold gradient for text
  const gold = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gold.addColorStop(0, '#F4D960');
  gold.addColorStop(0.3, '#D4AF37');
  gold.addColorStop(0.7, '#C9A037');
  gold.addColorStop(1, '#B8860B');
  ctx.fillStyle = gold;

  // Draw "AG" text
  ctx.font = 'bold 34px "Playfair Display", Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AG', WIDTH / 2, HEIGHT / 2 + 2);
}

function createPNG(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawFavicon(ctx);
  return canvas.toBuffer('image/png');
}

function createICO() {
  const sizes = [16, 32, 48];
  const buffers = sizes.map(s => {
    const canvas = createCanvas(s, s);
    const ctx = canvas.getContext('2d');
    drawFavicon(ctx);
    return canvas.toBuffer('image/png');
  });
  // ICO header + directory entries + PNG data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // ICO type
  header.writeUInt16LE(sizes.length, 4); // count

  let offset = 6 + sizes.length * 16;
  const dirEntries = [];
  const iconData = [];

  for (let i = 0; i < sizes.length; i++) {
    const w = sizes[i] === 256 ? 0 : sizes[i];
    const h = sizes[i] === 256 ? 0 : sizes[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(w, 0);
    entry.writeUInt8(h, 1);
    entry.writeUInt8(0, 2);  // palette colors
    entry.writeUInt8(0, 3);  // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffers[i].length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    iconData.push(buffers[i]);
    offset += buffers[i].length;
  }

  return Buffer.concat([header, ...dirEntries, ...iconData]);
}

// Generate files
const targets = [
  { path: 'frontend/public/favicon.png', size: 32 },
  { path: 'frontend/public/favicon.ico', type: 'ico' },
  { path: 'admin/public/favicon.png', size: 32 },
  { path: 'admin/public/favicon.ico', type: 'ico' },
  { path: 'admin/vite-project/public/favicon.png', size: 32 },
  { path: 'admin/vite-project/public/favicon.ico', type: 'ico' },
];

targets.forEach(t => {
  const dir = t.path.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const buf = t.type === 'ico' ? createICO() : createPNG(t.size);
  writeFileSync(t.path, buf);
  console.log(`✓ ${t.path} (${buf.length} bytes)`);
});
