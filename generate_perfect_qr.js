const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createModernQR(outputPath, isDarkTheme = true) {
    const url = 'https://finteclub-qr.vercel.app/';
    const canvasSize = 1200;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    // Color System
    const bgColor = isDarkTheme ? '#06080E' : '#FFFFFF';
    const darkModuleColor = isDarkTheme ? '#00E5FF' : '#06080E';
    const lightModuleColor = isDarkTheme ? '#06080E' : '#FFFFFF';
    const accentCyan = '#00E5FF';
    const accentBlue = '#0072FF';

    // 1. Draw outer ambient gradient background
    if (isDarkTheme) {
        const bgGrad = ctx.createRadialGradient(
            canvasSize / 2, canvasSize / 2, 100,
            canvasSize / 2, canvasSize / 2, canvasSize / 2
        );
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#06080E');
        ctx.fillStyle = bgGrad;
    } else {
        ctx.fillStyle = '#FFFFFF';
    }
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 2. Generate raw QR matrix using qrcode module
    const qrData = QRCode.create(url, { errorCorrectionLevel: 'H' });
    const modules = qrData.modules;
    const moduleCount = modules.size;

    // Calculate dimensions
    const margin = 80;
    const qrSize = canvasSize - margin * 2;
    const cellSize = qrSize / moduleCount;

    // Draw QR background container card
    const padding = 30;
    const cardX = margin - padding;
    const cardY = margin - padding;
    const cardW = qrSize + padding * 2;
    const cardH = qrSize + padding * 2;

    ctx.fillStyle = isDarkTheme ? 'rgba(15, 23, 42, 0.85)' : '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fill();

    ctx.strokeStyle = isDarkTheme ? 'rgba(0, 229, 255, 0.4)' : '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Center Logo Mask Setup
    // Logo will occupy center ~24% of QR code area (well within 30% Level H error correction)
    const logoPercent = 0.26;
    const logoAreaSize = qrSize * logoPercent;
    const logoCenterX = canvasSize / 2;
    const logoCenterY = canvasSize / 2;
    const logoLeft = logoCenterX - logoAreaSize / 2;
    const logoRight = logoCenterX + logoAreaSize / 2;
    const logoTop = logoCenterY - logoAreaSize / 2;
    const logoBottom = logoCenterY + logoAreaSize / 2;

    // Helper to check if cell falls under central logo area
    function isUnderLogo(row, col) {
        const cx = margin + col * cellSize + cellSize / 2;
        const cy = margin + row * cellSize + cellSize / 2;
        const pad = 12;
        return (cx >= logoLeft - pad && cx <= logoRight + pad &&
                cy >= logoTop - pad && cy <= logoBottom + pad);
    }

    // 4. Render Modules
    for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
            if (isUnderLogo(r, c)) continue; // Skip modules beneath logo cutout

            const isDark = modules.get(r, c);
            if (isDark) {
                const x = margin + c * cellSize;
                const y = margin + r * cellSize;

                // Subtle gradient for dark modules in dark mode
                if (isDarkTheme) {
                    const grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
                    grad.addColorStop(0, accentCyan);
                    grad.addColorStop(1, accentBlue);
                    ctx.fillStyle = grad;
                } else {
                    ctx.fillStyle = darkModuleColor;
                }

                // Render smooth rounded module points
                ctx.beginPath();
                ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, cellSize * 0.25);
                ctx.fill();
            }
        }
    }

    // 5. Render Central Logo Frame
    const logoBgPadding = 18;
    const logoBgX = logoLeft - logoBgPadding;
    const logoBgY = logoTop - logoBgPadding;
    const logoBgSize = logoAreaSize + logoBgPadding * 2;

    ctx.fillStyle = isDarkTheme ? '#06080E' : '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(logoBgX, logoBgY, logoBgSize, logoBgSize, 24);
    ctx.fill();

    // Neon Border around Logo
    ctx.strokeStyle = accentCyan;
    ctx.lineWidth = 5;
    ctx.stroke();

    // 6. Draw Center Logo Image
    const logoPath = path.join(__dirname, 'logoqr.png');
    if (fs.existsSync(logoPath)) {
        const logo = await loadImage(logoPath);
        ctx.drawImage(logo, logoLeft, logoTop, logoAreaSize, logoAreaSize);
    }

    // Save Output PNG File
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Generated Modern QR] Saved to: ${outputPath}`);
}

async function run() {
    await createModernQR('./finteclub_qr.png', true);
    await createModernQR('./finteclub_qr_dark.png', true);
    await createModernQR('./finteclub_qr_scannable.png', false);
}

run().catch(console.error);
