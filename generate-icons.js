/**
 * PWA Icon & Favicon Generator Script
 * Generates all required PWA icon sizes and the official favicon.png 
 * using a programmatic teal chart design.
 * Run: node generate-icons.js
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(import.meta.dirname, 'public', 'icons');
const FAVICON_PATH = path.join(import.meta.dirname, 'public', 'favicon.png');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const s = size;

    // Background matching the app's dark theme
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, s, s);

    // Subtle radial gradient glow
    const grd = ctx.createRadialGradient(s * 0.5, s * 0.55, 0, s * 0.5, s * 0.55, s * 0.5);
    grd.addColorStop(0, 'rgba(0, 212, 170, 0.1)');
    grd.addColorStop(1, 'rgba(0, 212, 170, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, s, s);

    // Chart line design
    const padding = s * 0.22;
    const chartW = s - padding * 2;
    const chartH = s - padding * 2;
    const startX = padding;
    const startY = padding;

    const points = [
        [0, 0.8],
        [0.15, 0.65],
        [0.3, 0.75],
        [0.45, 0.45],
        [0.6, 0.55],
        [0.75, 0.3],
        [0.9, 0.15],
        [1.0, 0.2],
    ];

    // Draw chart line with glow
    ctx.shadowColor = '#00d4aa';
    ctx.shadowBlur = s * 0.05;
    ctx.beginPath();
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = Math.max(2, s * 0.04);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    points.forEach(([x, y], i) => {
        const px = startX + x * chartW;
        const py = startY + y * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Area fill
    ctx.shadowBlur = 0;
    ctx.lineTo(startX + chartW, startY + chartH);
    ctx.lineTo(startX, startY + chartH);
    ctx.closePath();

    const areaGrd = ctx.createLinearGradient(0, startY, 0, startY + chartH);
    areaGrd.addColorStop(0, 'rgba(0, 212, 170, 0.2)');
    areaGrd.addColorStop(1, 'rgba(0, 212, 170, 0)');
    ctx.fillStyle = areaGrd;
    ctx.fill();

    // Highlight dot
    const lastPt = points[points.length - 1];
    const dotX = startX + lastPt[0] * chartW;
    const dotY = startY + lastPt[1] * chartH;
    const dotR = Math.max(3, s * 0.03);

    ctx.shadowColor = '#00d4aa';
    ctx.shadowBlur = s * 0.05;
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e14'; // Hollow center look
    ctx.fill();
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = Math.max(1.5, s * 0.015);
    ctx.stroke();
    ctx.shadowBlur = 0;

    return canvas;
}

// Generate PWA Icons
for (const size of SIZES) {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Generated PWA Icon: ${filePath}`);
}

// Generate Favicon (512px version saved as favicon.png)
const faviconCanvas = drawIcon(512);
fs.writeFileSync(FAVICON_PATH, faviconCanvas.toBuffer('image/png'));
console.log(`✓ Generated Favicon: ${FAVICON_PATH}`);

console.log('\nAll branding assets generated successfully from teal chart design!');
