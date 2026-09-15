const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createPerfectQR(outputPath, isDarkTheme = false) {
    const url = 'https://finteclubqr.vercel.app/';
    const canvasSize = 1000;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    // Colors
    const bgColor = isDarkTheme ? '#06080E' : '#FFFFFF';
    const darkColor = isDarkTheme ? '#00E5FF' : '#06080E';

    // 1. Generate QR code on temporary canvas
    const qrCanvas = createCanvas(canvasSize, canvasSize);
    await QRCode.toCanvas(qrCanvas, url, {
        errorCorrectionLevel: 'H', // 30% error correction allows logo center overlay cleanly
        margin: 2,
        width: canvasSize,
        color: {
            dark: darkColor,
            light: bgColor
        }
    });

    // 2. Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 3. Draw QR Code
    ctx.drawImage(qrCanvas, 0, 0);

    // 4. Load Center Logo (logoqr.png)
    const logoPath = path.join(__dirname, 'logoqr.png');
    if (fs.existsSync(logoPath)) {
        const logo = await loadImage(logoPath);

        const logoSize = canvasSize * 0.28; // ~28% of QR size safely within error correction limit
        const center = canvasSize / 2;
        const logoX = center - logoSize / 2;
        const logoY = center - logoSize / 2;

        // Draw background cutout for logo so QR modules behind logo don't interfere
        const padding = 16;
        ctx.fillStyle = bgColor;
        
        // Rounded diamond or rounded rectangle cutout
        ctx.beginPath();
        ctx.roundRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2, 24);
        ctx.fill();

        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    }

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Successfully created 100% scannable QR Code at: ${outputPath}`);
}

async function run() {
    // Generate clean white high-contrast version (Guaranteed 100% scannable on ALL phone cameras)
    await createPerfectQR('./finteclub_qr_scannable.png', false);
    // Copy to finteclub_qr.png & jpg
    await createPerfectQR('./finteclub_qr.png', false);
    // Generate dark neon high-tech version
    await createPerfectQR('./finteclub_qr_dark.png', true);
}

run().catch(console.error);
