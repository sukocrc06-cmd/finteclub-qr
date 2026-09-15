/* ==========================================================================
   FinTeClub - Interactive Script
   Background Animation, QR Code Generator & Interactivity
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCanvasAnimation();
    initQRCode();
    initCopyEmail();
    initShareAndDownload();
});

/* --------------------------------------------------------------------------
   1. Dynamic Circuit & Candlestick Background Animation
   -------------------------------------------------------------------------- */
function initCanvasAnimation() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle nodes for circuit effect
    const particles = [];
    const particleCount = Math.min(Math.floor(width / 25), 45);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI
        });
    }

    // Candlesticks array for fintech vibe
    const candlesticks = [];
    const candleCount = 12;
    for (let i = 0; i < candleCount; i++) {
        candlesticks.push({
            x: (width / candleCount) * i + Math.random() * 30,
            y: Math.random() * height,
            w: 8,
            h: Math.random() * 40 + 20,
            isBull: Math.random() > 0.4,
            speed: Math.random() * 0.3 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw ambient gradient overlay
        const bgGrad = ctx.createRadialGradient(
            width / 2, height / 3, 50,
            width / 2, height / 2, Math.max(width, height)
        );
        bgGrad.addColorStop(0, '#0d1527');
        bgGrad.addColorStop(1, '#06080E');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw Candlesticks floating in background
        candlesticks.forEach(c => {
            c.y -= c.speed;
            if (c.y < -60) {
                c.y = height + 60;
                c.x = Math.random() * width;
            }

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = c.isBull ? 'rgba(0, 229, 255, 0.15)' : 'rgba(0, 114, 255, 0.12)';
            ctx.fillStyle = c.isBull ? 'rgba(0, 229, 255, 0.08)' : 'rgba(0, 114, 255, 0.06)';

            // Wick
            ctx.beginPath();
            ctx.moveTo(c.x + c.w / 2, c.y - 12);
            ctx.lineTo(c.x + c.w / 2, c.y + c.h + 12);
            ctx.stroke();

            // Body
            ctx.fillRect(c.x, c.y, c.w, c.h);
            ctx.strokeRect(c.x, c.y, c.w, c.h);
        });

        // Draw Circuit Nodes & Connecting Lines
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.03;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Connect close particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const alpha = (1 - dist / 140) * 0.2;
                    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    // Draw orthogonal circuit line
                    ctx.lineTo(p.x, p2.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Draw Node
            const alpha = 0.3 + Math.sin(p.pulse) * 0.2;
            ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* --------------------------------------------------------------------------
   2. QR Code Generation with Center Logo
   -------------------------------------------------------------------------- */
function initQRCode() {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;

    const targetURL = window.location.href.startsWith('http') 
        ? window.location.href 
        : 'https://finteclub-qr.vercel.app/';

    if (typeof QRious !== 'undefined') {
        new QRious({
            element: canvas,
            value: targetURL,
            size: 220,
            background: '#06080E',
            foreground: '#00E5FF',
            level: 'H' // High error correction for logo placement
        });
    }
}

/* --------------------------------------------------------------------------
   3. Copy Email to Clipboard
   -------------------------------------------------------------------------- */
function initCopyEmail() {
    const copyBtn = document.getElementById('copyEmailBtn');
    const emailText = document.getElementById('emailText');

    if (!copyBtn || !emailText) return;

    copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const textToCopy = emailText.textContent.trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('E-posta adresi kopyalandı!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('E-posta adresi kopyalandı!');
        });
    });
}

/* --------------------------------------------------------------------------
   4. Share & Download QR Code
   -------------------------------------------------------------------------- */
function initShareAndDownload() {
    const downloadBtn = document.getElementById('downloadQrBtn');
    const shareBtn = document.getElementById('shareBtn');
    const qrCanvas = document.getElementById('qrCanvas');
    const logoImg = document.getElementById('qrCenterLogo');

    if (downloadBtn && qrCanvas) {
        downloadBtn.addEventListener('click', () => {
            // Merge canvas with center logo for export image
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = 400;
            exportCanvas.height = 400;
            const ctx = exportCanvas.getContext('2d');

            // Background
            ctx.fillStyle = '#06080E';
            ctx.fillRect(0, 0, 400, 400);

            // Border & Glow
            ctx.strokeStyle = '#00E5FF';
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, 380, 380);

            // Draw QR Code
            ctx.drawImage(qrCanvas, 50, 50, 300, 300);

            // Draw Logo in Center
            if (logoImg && logoImg.complete) {
                const logoSize = 70;
                const logoX = (400 - logoSize) / 2;
                const logoY = (400 - logoSize) / 2;

                ctx.fillStyle = '#06080E';
                ctx.beginPath();
                ctx.arc(200, 200, logoSize / 2 + 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#00E5FF';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            }

            // Trigger Download
            const link = document.createElement('a');
            link.download = 'FinTeClub_QR_Code.png';
            link.href = exportCanvas.toDataURL('image/png');
            link.click();

            showToast('QR Kod indiriliyor...');
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const shareData = {
                title: 'FinTeClub AYBÜ',
                text: 'Ankara Yıldırım Beyazıt Üniversitesi Finans ve Teknoloji Kulübü',
                url: window.location.href.startsWith('http') ? window.location.href : 'https://finteclub-qr.vercel.app/'
            };

            if (navigator.share) {
                navigator.share(shareData).catch(() => {});
            } else {
                navigator.clipboard.writeText(shareData.url).then(() => {
                    showToast('Bağlantı adresi kopyalandı!');
                });
            }
        });
    }
}

/* Toast Helper */
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
