const QRCode = require('qrcode');
const fs = require('fs');

async function generateScannableQR() {
    const url = 'https://finteclubqr.vercel.app/';
    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1,
        margin: 2,
        color: {
            dark: '#000000', // Crisp black modules for maximum camera contrast & scannability
            light: '#FFFFFF' // Bright white background for instant scanning on any phone camera
        },
        width: 1000
    };

    try {
        await QRCode.toFile('./finteclub_qr_clean.png', url, options);
        console.log('Clean scannable QR generated successfully!');
    } catch (err) {
        console.error(err);
    }
}

generateScannableQR();
