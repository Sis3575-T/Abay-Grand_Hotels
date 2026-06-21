import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

// ── CRC32 ──────────────────────────────────────────────────────────────────
function crc32(buf) {
  let crc = 0xffffffff;
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const tBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tBuf, data])));
  return Buffer.concat([len, tBuf, data, crc]);
}

// ── PNG writer ─────────────────────────────────────────────────────────────
function createPNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const stride = w * 4;
  const raw = Buffer.alloc(h * (1 + stride));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + stride)] = 0;
    const srcOff = y * stride;
    const dstOff = y * (1 + stride) + 1;
    for (let x = 0; x < stride; x++) raw[dstOff + x] = rgba[srcOff + x];
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── ICO writer (PNG-based) ────────────────────────────────────────────────
function createICO(sizes, pixelFn) {
  const pngs = sizes.map(s => createPNG(s, s, pixelFn(s)));
  const hdr = Buffer.alloc(6);
  hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(sizes.length, 4);
  let off = 6 + sizes.length * 16;
  const parts = [hdr];
  for (let i = 0; i < sizes.length; i++) {
    const e = Buffer.alloc(16);
    const s = sizes[i];
    e.writeUInt8(s >= 256 ? 0 : s, 0);
    e.writeUInt8(s >= 256 ? 0 : s, 1);
    e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(off, 12);
    parts.push(e);
    off += pngs[i].length;
  }
  pngs.forEach(p => parts.push(p));
  return Buffer.concat(parts);
}

// ── Pixel geometry helpers ─────────────────────────────────────────────────
function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// ── Letter A segments (normalised 0-1 within letter bounding box) ─────────
// Serif-style capital A
const segsA = [
  [0.50, 0.00, 0.05, 0.90], // left leg
  [0.50, 0.00, 0.95, 0.90], // right leg
  [0.15, 0.50, 0.85, 0.50], // crossbar
  [0.33, 0.00, 0.67, 0.00], // top serif
  [0.00, 0.90, 0.12, 0.90], // left foot serif
  [0.88, 0.90, 1.00, 0.90], // right foot serif
];

// Serif-style capital G
const segsG = [
  [0.90, 0.05, 0.50, 0.00], // top-right to top-center
  [0.50, 0.00, 0.10, 0.08], // top-center to top-left curve
  [0.10, 0.08, 0.04, 0.30], // top-left curve down
  [0.04, 0.30, 0.04, 0.70], // left side
  [0.04, 0.70, 0.10, 0.92], // bottom-left curve
  [0.10, 0.92, 0.50, 1.00], // bottom curve to center
  [0.50, 1.00, 0.90, 0.92], // bottom curve to right
  [0.90, 0.92, 0.90, 0.55], // right side up
  [0.55, 0.48, 0.98, 0.48], // crossbar
  [0.42, 0.00, 0.58, 0.00], // top serif
  [0.85, 0.92, 0.96, 0.90], // bottom-right serif
];

// ── Main pixel generator ───────────────────────────────────────────────────
function generatePixels(size) {
  const px = new Uint8Array(size * size * 4);
  const nM = 4 / size;         // normalised margin
  const nR = 12 / size;        // normalised corner radius
  const halfW = 0.5 - nM;      // half-width of inner rect
  const halfH = 0.5 - nM;      // half-height of inner rect
  const cornerCx = halfW - nR; // corner circle centre (relative to quadrant)
  const cornerCy = halfH - nR;

  // Letter layout
  const lH = 0.76;            // letter height (fraction of icon)
  const lTop = (1 - lH) / 2;
  const lW = 0.36;            // each letter width
  const gap = 0.16;           // gap between A and G
  const totalW = lW * 2 + gap;
  const left = (1 - totalW) / 2;
  const aLeft = left;
  const gLeft = left + lW + gap;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / size, ny = y / size;

      // ---- Background ----
      const t = ny;
      const bgR = Math.round(26 - (26 - 15) * t);
      const bgG = Math.round(26 - (26 - 10) * t);
      const bgB = Math.round(46 - (46 - 26) * t);

      // ---- Rounded rect containment ----
      // Map to top-right quadrant
      let qx = nx < 0.5 ? 0.5 - nx : nx - 0.5;
      let qy = ny < 0.5 ? 0.5 - ny : ny - 0.5;

      let inside = true;
      if (qx > halfW || qy > halfH) {
        inside = false;
      } else if (qx > cornerCx && qy > cornerCy) {
        // Corner zone – check circular arc
        const dx = qx - cornerCx, dy = qy - cornerCy;
        if (dx * dx + dy * dy > nR * nR) inside = false;
      }

      if (!inside) {
        px[i] = 0; px[i+1] = 0; px[i+2] = 0; px[i+3] = 0;
        continue;
      }

      px[i] = bgR; px[i+1] = bgG; px[i+2] = bgB; px[i+3] = 255;

      // ---- Gold border ----
      // Compute distance to inner edge
      const edgeDist = Math.min(
        halfW - qx,
        halfH - qy
      );
      const borderW = 1.5 / size;

      // For corner zones, edgeDist above is the min dist to nearest axis edge,
      // but the actual distance to the rounded edge is different.
      // Fix: compute true distance to rounded rect edge
      let trueEdgeDist = edgeDist;
      if (qx > cornerCx && qy > cornerCy) {
        // In corner – distance is from point to circular arc
        const dx = qx - cornerCx, dy = qy - cornerCy;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        trueEdgeDist = nR - distFromCenter;
      } else if (qx > cornerCx) {
        // Past corner horizontally – distance is horizontal
        trueEdgeDist = halfW - qx;
      } else if (qy > cornerCy) {
        // Past corner vertically – distance is vertical
        trueEdgeDist = halfH - qy;
      }

      if (trueEdgeDist < borderW) {
        const goldT = ny;
        const gR = Math.round(212 + 43 * goldT);
        const gG = Math.round(175 - 40 * goldT);
        const gB = Math.round(55 + 40 * goldT);
        px[i] = gR; px[i+1] = gG; px[i+2] = gB;
        px[i+3] = Math.round(255 * (0.5 + 0.5 * (trueEdgeDist / borderW)));
        continue;
      }

      // ---- "AG" text ----
      const inA = nx >= aLeft && nx <= aLeft + lW && ny >= lTop && ny <= lTop + lH;
      const inG = nx >= gLeft && nx <= gLeft + lW && ny >= lTop && ny <= lTop + lH;

      if (inA || inG) {
        const lx = inA ? (nx - aLeft) / lW : (nx - gLeft) / lW;
        const ly = (ny - lTop) / lH;
        const segs = inA ? segsA : segsG;
        const strokeW = 0.20;
        if (strokeSegments(lx, ly, segs, strokeW)) {
          const goldT2 = (lx + ly * 0.5) / 1.5;
          px[i] = Math.round(244 - 56 * goldT2);
          px[i+1] = Math.round(217 - 57 * goldT2);
          px[i+2] = Math.round(96 - 58 * goldT2);
          px[i+3] = 255;
        }
      }
    }
  }
  return px;
}

function strokeSegments(px, py, segs, w) {
  const hw = w / 2;
  for (const s of segs) {
    if (distToSeg(px, py, s[0], s[1], s[2], s[3]) < hw) return true;
  }
  return false;
}

// ── Generate all files ─────────────────────────────────────────────────────
const configs = [
  { path: 'frontend/public/favicon.png',            type: 'png', size: 32 },
  { path: 'frontend/public/favicon.ico',            type: 'ico' },
  { path: 'frontend/public/apple-touch-icon.png',   type: 'png', size: 180 },
  { path: 'admin/public/favicon.png',               type: 'png', size: 32 },
  { path: 'admin/public/favicon.ico',               type: 'ico' },
  { path: 'admin/public/apple-touch-icon.png',      type: 'png', size: 180 },
  { path: 'admin/vite-project/public/favicon.png',   type: 'png', size: 32 },
  { path: 'admin/vite-project/public/favicon.ico',   type: 'ico' },
  { path: 'admin/vite-project/public/apple-touch-icon.png', type: 'png', size: 180 },
];

console.log('Generating favicons...\n');

for (const c of configs) {
  const dir = c.path.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let buf;
  if (c.type === 'ico') {
    const icoSizes = c.path.includes('apple') ? [180] : [16, 32, 48];
    buf = createICO(icoSizes, generatePixels);
  } else {
    buf = createPNG(c.size, c.size, generatePixels(c.size));
  }

  writeFileSync(c.path, buf);
  const dims = c.type === 'ico' ? 'ICO' : `${c.size}\u00d7${c.size}`;
  console.log(`  \u2713 ${c.path}  (${dims}, ${buf.length} bytes)`);
}

console.log('\nDone!');
