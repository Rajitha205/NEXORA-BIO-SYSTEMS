// ===== NEXORA BIO SYSTEMS — CORE JS =====

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});

function animateCursorRing() {
    if (cursorRing) {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
    }
    requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

document.querySelectorAll('a, button, .card-glass, canvas').forEach(el => {
    el.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); });
});

// ===== PARTICLE SYSTEM =====
const particleCanvas = document.getElementById('particles-canvas');
if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    let W, H;

    function resizeParticleCanvas() {
        W = particleCanvas.width = window.innerWidth;
        H = particleCanvas.height = window.innerHeight;
    }
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.7 ? '#00F0FF' : '#39FF14';
            this.life = 0; this.maxLife = Math.random() * 300 + 200;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY; this.life++;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H || this.life > this.maxLife) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity * (1 - this.life / this.maxLife);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 6; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill(); ctx.restore();
        }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// ===== NAVIGATION =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    const scrollInd = document.getElementById('scrollIndicator');
    if (scrollInd) scrollInd.classList.toggle('hidden', window.scrollY > 200);
});

if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        navToggle.classList.toggle('open');
    });
}

// Set active nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger progress bars
            entry.target.querySelectorAll('.progress-bar-fill').forEach(bar => {
                const w = bar.dataset.width;
                if (w) setTimeout(() => { bar.style.width = w + '%'; }, 200);
            });
            // Trigger count-up
            entry.target.querySelectorAll('[data-count]').forEach(el => {
                countUp(el, parseInt(el.dataset.count));
            });
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Global progress bar trigger
const progressObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.progress-bar-fill').forEach(bar => {
                const w = bar.dataset.width;
                if (w) setTimeout(() => { bar.style.width = w + '%'; }, 300);
            });
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.progress-bar-wrap').forEach(el => progressObserver.observe(el));

// ===== COUNT UP =====
function countUp(el, target) {
    let start = 0;
    const duration = 2000;
    const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const current = Math.floor(ease * target);
        el.textContent = current >= 1000 ? (current / 1000).toFixed(1) + 'k+' : current + (target > 99 ? '+' : '');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target >= 1000 ? (target / 1000).toFixed(1) + 'k+' : target + '+';
    };
    requestAnimationFrame(step);
}

// Trigger count-up on visible stats
const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count);
            if (target) countUp(el, target);
            countObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// ===== MOLECULAR DATA CARDS =====
document.querySelectorAll('.mol-data-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.mol-data-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});

// ===== GLOBE CANVAS BACKGROUND GRID =====
function drawGlobeGrid() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) * 0.4;

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        // Draw globe circle
        ctx.strokeStyle = 'rgba(57,255,20,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

        // Draw latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
            const y = cy + Math.sin(lat * Math.PI / 180) * r;
            const rx = Math.cos(lat * Math.PI / 180) * r;
            if (rx > 0) {
                ctx.strokeStyle = 'rgba(57,255,20,0.07)';
                ctx.beginPath(); ctx.ellipse(cx, y, rx, rx * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
            }
        }
        // Draw meridian lines
        for (let lon = 0; lon < 180; lon += 45) {
            const a = (lon + t) * Math.PI / 180;
            ctx.strokeStyle = 'rgba(57,255,20,0.06)';
            ctx.beginPath(); ctx.ellipse(cx, cy, r * Math.abs(Math.cos(a)), r, 0, 0, Math.PI * 2); ctx.stroke();
        }

        // Connection lines between nodes (approximate positions)
        const nodes = [
            { x: cx - r * 0.75, y: cy - r * 0.15 }, // San Francisco
            { x: cx + r * 0.0, y: cy - r * 0.1 },   // Zurich
            { x: cx + r * 0.7, y: cy },               // Tokyo
            { x: cx + r * 0.55, y: cy + r * 0.25 }, // Singapore
            { x: cx + r * 0.28, y: cy + r * 0.05 }, // Mumbai
        ];
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const alpha = 0.08 + 0.06 * Math.sin(t * 0.05 + i + j);
                ctx.strokeStyle = `rgba(57,255,20,${alpha})`;
                ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
            }
        }
        t += 0.3;
        requestAnimationFrame(draw);
    }
    draw();
}
drawGlobeGrid();

// ===== SMOOTH HOVER EFFECTS =====
document.querySelectorAll('.card-glass--hover').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== TERMINAL TYPING EFFECT =====
function typeEffect(el, text, speed = 40) {
    let i = 0;
    el.textContent = '';
    const timer = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) clearInterval(timer);
    }, speed);
}

// ===== EXPORT UTILITIES =====
window.NexoraCore = { countUp, typeEffect };

// ===== 3D CANVAS LOGO =====
function init3DLogos() {
    const logos = document.querySelectorAll('.nav-logo-icon, .footer-logo-icon');

    logos.forEach(container => {
        container.innerHTML = '<canvas style="width:100%; height:100%; display:block;"></canvas>';
        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });

        let width, height;
        function resize() {
            const rect = container.getBoundingClientRect();
            width = rect.width || 40;
            height = rect.height || 40;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        window.addEventListener('resize', resize);
        resize();

        const numNodes = 35;
        const nodes = [];
        for (let i = 0; i < numNodes; i++) {
            const phi = Math.acos(-1 + (2 * i) / numNodes);
            const theta = Math.sqrt(numNodes * Math.PI) * phi;
            const r = 10 + Math.random() * 4;
            nodes.push({
                baseX: r * Math.sin(phi) * Math.cos(theta),
                baseY: r * Math.sin(phi) * Math.sin(theta),
                baseZ: r * Math.cos(phi),
                color: Math.random() > 0.8 ? '#39FF14' : '#00F0FF',
                isSpecial: i === 0
            });
        }

        let angleX = 0;
        let angleY = 0;

        function render() {
            ctx.clearRect(0, 0, width, height);
            const cx = width / 2;
            const cy = height / 2;

            // Draw concentric background rings
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
            ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
            ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();

            angleY += 0.01;
            angleX += 0.005;

            const projected = [];
            for (let i = 0; i < numNodes; i++) {
                const node = nodes[i];

                const x1 = node.baseX * Math.cos(angleY) - node.baseZ * Math.sin(angleY);
                const z1 = node.baseX * Math.sin(angleY) + node.baseZ * Math.cos(angleY);

                const y2 = node.baseY * Math.cos(angleX) - z1 * Math.sin(angleX);
                const z2 = node.baseY * Math.sin(angleX) + z1 * Math.cos(angleX);

                const scale = 30 / (30 + z2);

                projected.push({
                    x: cx + x1 * scale,
                    y: cy + y2 * scale,
                    z: z2,
                    scale: scale,
                    color: node.color,
                    isSpecial: node.isSpecial
                });
            }

            projected.sort((a, b) => b.z - a.z);

            // Connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < projected.length; i++) {
                for (let j = i + 1; j < projected.length; j++) {
                    const pA = projected[i];
                    const pB = projected[j];
                    const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
                    if (dist < 6 * pA.scale) {
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 * pA.scale})`;
                        ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
                    }
                }
            }

            // Draw projected nodes
            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                const size = (p.isSpecial ? 2.5 : 1.2) * p.scale;
                const alpha = Math.max(0.2, 1 - (p.z + 15) / 30);

                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill();

                // Ring for special node
                if (p.isSpecial) {
                    ctx.strokeStyle = p.color;
                    ctx.beginPath(); ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2); ctx.stroke();
                }
            }
            ctx.globalAlpha = 1.0;

            requestAnimationFrame(render);
        }
        render();
    });
}
document.addEventListener('DOMContentLoaded', init3DLogos);
if (document.readyState === 'complete' || document.readyState === 'interactive') init3DLogos();
