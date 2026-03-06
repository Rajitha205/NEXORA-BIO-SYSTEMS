// ===== NEXORA HOME PAGE — 3D DNA HELIX (45° TILTED) + MOLECULAR VIEWER =====

// ===== DNA CANVAS =====
(function () {
    const canvas = document.getElementById('dna-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let mouseX = 0.5, mouseY = 0.5;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / W;
        mouseY = (e.clientY - rect.top) / H;
    });

    let t = 0;
    const NUM_NODES = 22;
    const HELIX_RADIUS = 72;
    const PITCH = 42; // degrees per node

    // ===== 45° TILT TRANSFORM =====
    // We rotate the entire helix 45° around X-axis (rightward lean perspective)
    const TILT_X = Math.PI / 4;   // 45° forward tilt
    const TILT_Z = Math.PI / 5.5; // ~32° rightward cant

    function applyHelixTransform(lx, ly, lz) {
        // Apply X-axis tilt (forward lean 45°)
        const y1 = ly * Math.cos(TILT_X) - lz * Math.sin(TILT_X);
        const z1 = ly * Math.sin(TILT_X) + lz * Math.cos(TILT_X);
        // Apply Z-axis rotation (rightward cant)
        const x2 = lx * Math.cos(TILT_Z) - y1 * Math.sin(TILT_Z);
        const y2 = lx * Math.sin(TILT_Z) + y1 * Math.cos(TILT_Z);
        return { x: x2, y: y2, z: z1 };
    }

    function perspective(x, y, z) {
        const fov = 600;
        const scale = fov / (fov + z + 200);
        return { px: x * scale, py: y * scale, depth: z, scale };
    }

    function drawDNA() {
        ctx.clearRect(0, 0, W, H);
        t += 0.010;

        // Center of helix — offset slightly right for the tilted look
        const cx = W * 0.52 + (mouseX - 0.5) * 18;
        const cy = H * 0.50 + (mouseY - 0.5) * 10;
        const totalHeight = H * 0.9;

        const strand1 = [], strand2 = [];

        for (let i = 0; i < NUM_NODES; i++) {
            const localY = -totalHeight / 2 + i * (totalHeight / (NUM_NODES - 1));
            const angle = t + i * (PITCH * Math.PI / 180);

            // Local helix coords
            const lx1 = Math.cos(angle) * HELIX_RADIUS;
            const lx2 = Math.cos(angle + Math.PI) * HELIX_RADIUS;
            const lz1 = Math.sin(angle) * HELIX_RADIUS * 0.4; // squash Z for perspective
            const lz2 = Math.sin(angle + Math.PI) * HELIX_RADIUS * 0.4;

            const t1 = applyHelixTransform(lx1, localY, lz1);
            const t2 = applyHelixTransform(lx2, localY, lz2);

            const p1 = perspective(t1.x, t1.y, t1.z);
            const p2 = perspective(t2.x, t2.y, t2.z);

            strand1.push({ sx: cx + p1.px, sy: cy + p1.py, depth: p1.depth, scale: p1.scale, raw: t1 });
            strand2.push({ sx: cx + p2.px, sy: cy + p2.py, depth: p2.depth, scale: p2.scale, raw: t2 });
        }

        // --- Draw backbones first (behind) ---
        [[strand1, '57,255,20'], [strand2, '0,240,255']].forEach(([strand, col]) => {
            ctx.beginPath();
            strand.forEach((p, i) => {
                i === 0 ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
            });
            const g = ctx.createLinearGradient(strand[0].sx, strand[0].sy, strand[strand.length - 1].sx, strand[strand.length - 1].sy);
            g.addColorStop(0, `rgba(${col},0)`);
            g.addColorStop(0.15, `rgba(${col},0.7)`);
            g.addColorStop(0.85, `rgba(${col},0.7)`);
            g.addColorStop(1, `rgba(${col},0)`);
            ctx.strokeStyle = g;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 16;
            ctx.shadowColor = col === '57,255,20' ? '#39FF14' : '#00F0FF';
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // --- Draw bridges (base pairs) with depth sort ---
        const bridges = strand1.map((s1, i) => ({ s1, s2: strand2[i], avgDepth: (s1.depth + strand2[i].depth) / 2 }));
        bridges.sort((a, b) => a.avgDepth - b.avgDepth);

        bridges.forEach(({ s1, s2 }) => {
            const alpha = Math.max(0.15, (s1.scale + s2.scale) / 2);
            const grad = ctx.createLinearGradient(s1.sx, s1.sy, s2.sx, s2.sy);
            grad.addColorStop(0, `rgba(57,255,20,${alpha * 0.7})`);
            grad.addColorStop(0.35, `rgba(0,240,255,${alpha * 0.9})`);
            grad.addColorStop(0.65, `rgba(0,240,255,${alpha * 0.9})`);
            grad.addColorStop(1, `rgba(57,255,20,${alpha * 0.7})`);
            ctx.beginPath();
            ctx.moveTo(s1.sx, s1.sy);
            ctx.lineTo(s2.sx, s2.sy);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2 + alpha * 1.8;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00F0FF';
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // --- Draw nodes (depth sorted) ---
        const allNodes = [
            ...strand1.map(p => ({ ...p, col: '57,255,20', hex: '#39FF14' })),
            ...strand2.map(p => ({ ...p, col: '0,240,255', hex: '#00F0FF' }))
        ].sort((a, b) => a.depth - b.depth);

        allNodes.forEach(node => {
            const brightness = Math.max(0.25, node.scale);
            const r = (4 + brightness * 5) * Math.max(0.7, node.scale);

            // Outer glow
            const glow = ctx.createRadialGradient(node.sx, node.sy, 0, node.sx, node.sy, r * 3);
            glow.addColorStop(0, `rgba(${node.col},${brightness * 0.4})`);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, r * 3, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Core sphere
            const core = ctx.createRadialGradient(node.sx - r * 0.25, node.sy - r * 0.25, 0, node.sx, node.sy, r);
            core.addColorStop(0, `rgba(255,255,255,${brightness * 0.9})`);
            core.addColorStop(0.35, `rgba(${node.col},${brightness * 0.95})`);
            core.addColorStop(1, `rgba(${node.col},${brightness * 0.3})`);
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, r, 0, Math.PI * 2);
            ctx.fillStyle = core;
            ctx.shadowBlur = 20;
            ctx.shadowColor = node.hex;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Scan pulse
        const scanProgress = (t * 0.5 % 1);
        const scanPx = strand1[0].sx + (strand1[NUM_NODES - 1].sx - strand1[0].sx) * scanProgress;
        const scanPy = strand1[0].sy + (strand1[NUM_NODES - 1].sy - strand1[0].sy) * scanProgress;
        const scanGrad = ctx.createRadialGradient(scanPx, scanPy, 0, scanPx, scanPy, 80);
        scanGrad.addColorStop(0, 'rgba(57,255,20,0.12)');
        scanGrad.addColorStop(1, 'rgba(57,255,20,0)');
        ctx.beginPath();
        ctx.arc(scanPx, scanPy, 80, 0, Math.PI * 2);
        ctx.fillStyle = scanGrad;
        ctx.fill();

        // Orbital ellipses (angled to match tilt)
        for (let r = 0; r < 3; r++) {
            const orbitCy = cy + Math.sin(t * 0.4 + r * 1.1) * 15;
            const orbitRx = HELIX_RADIUS * (1.6 + r * 0.4);
            const orbitRy = orbitRx * 0.18; // flat perspective ring
            const alpha = 0.05 + Math.sin(t * 0.8 + r) * 0.025;
            ctx.save();
            ctx.translate(cx, orbitCy);
            ctx.rotate(-0.28); // match tilt angle visually
            ctx.beginPath();
            ctx.ellipse(0, 0, orbitRx, orbitRy, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(drawDNA);
    }
    drawDNA();
})();

// ===== MOLECULAR VIEWER CANVAS =====
(function () {
    const canvas = document.getElementById('molecular-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let rotX = 0.4, rotY = Math.PI / 6; // start at slight angle
    let isDragging = false, lastMX = 0, lastMY = 0;

    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener('resize', resize);

    canvas.addEventListener('mousedown', e => { isDragging = true; lastMX = e.clientX; lastMY = e.clientY; });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', e => {
        if (isDragging) {
            rotY += (e.clientX - lastMX) * 0.012;
            rotX += (e.clientY - lastMY) * 0.012;
            lastMX = e.clientX; lastMY = e.clientY;
        }
    });

    const atoms = [
        { id: 0, ox: 0, oy: 0, oz: 0, r: 16, color: '#39FF14', label: 'C' },
        { id: 1, ox: 90, oy: 0, oz: 0, r: 12, color: '#00F0FF', label: 'O' },
        { id: 2, ox: -90, oy: 0, oz: 0, r: 12, color: '#00F0FF', label: 'O' },
        { id: 3, ox: 0, oy: 90, oz: 0, r: 9, color: '#39FF14', label: 'H' },
        { id: 4, ox: 0, oy: -90, oz: 0, r: 9, color: '#39FF14', label: 'H' },
        { id: 5, ox: 0, oy: 0, oz: 90, r: 12, color: '#ff6b6b', label: 'N' },
        { id: 6, ox: 0, oy: 0, oz: -90, r: 13, color: '#9644ff', label: 'P' },
        { id: 7, ox: 65, oy: 65, oz: 0, r: 8, color: '#00F0FF', label: 'H' },
        { id: 8, ox: -65, oy: -65, oz: 0, r: 8, color: '#39FF14', label: 'H' },
        { id: 9, ox: 50, oy: 0, oz: 70, r: 7, color: '#ff6b6b', label: 'N' },
        { id: 10, ox: -50, oy: 0, oz: -70, r: 7, color: '#9644ff', label: 'P' },
    ];
    const bonds = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [2, 8], [5, 9], [6, 10]];

    function rotate3D(x, y, z) {
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
        return { x: x1, y: y2, z: z2 };
    }

    function project(x, y, z) {
        const fov = 450;
        const scale = fov / (fov + z + 120);
        return { x: W / 2 + x * scale, y: H / 2 + y * scale, scale };
    }

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        t += 0.008;
        if (!isDragging) { rotY += 0.007; }

        const projected = atoms.map(a => {
            const { x, y, z } = rotate3D(a.ox, a.oy, a.oz);
            const p = project(x, y, z);
            return { ...a, px: p.x, py: p.y, pz: z, scale: p.scale };
        });

        const sorted = [...projected].sort((a, b) => a.pz - b.pz);

        // Bonds
        bonds.forEach(([i, j]) => {
            const a = projected[i], b = projected[j];
            const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
            grad.addColorStop(0, a.color + '90');
            grad.addColorStop(1, b.color + '90');
            ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 8; ctx.shadowColor = '#39FF14';
            ctx.stroke(); ctx.shadowBlur = 0;
        });

        // Atoms
        sorted.forEach(a => {
            const r = a.r * a.scale * 2.2;
            const glow = ctx.createRadialGradient(a.px, a.py, 0, a.px, a.py, r * 3.5);
            glow.addColorStop(0, a.color + '35'); glow.addColorStop(1, 'transparent');
            ctx.beginPath(); ctx.arc(a.px, a.py, r * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = glow; ctx.fill();

            const core = ctx.createRadialGradient(a.px - r * 0.25, a.py - r * 0.25, 0, a.px, a.py, r);
            core.addColorStop(0, '#ffffff');
            core.addColorStop(0.3, a.color); core.addColorStop(1, a.color + '70');
            ctx.beginPath(); ctx.arc(a.px, a.py, r, 0, Math.PI * 2);
            ctx.fillStyle = core;
            ctx.shadowBlur = 18; ctx.shadowColor = a.color;
            ctx.fill(); ctx.shadowBlur = 0;

            if (r > 8) {
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.font = `bold ${Math.max(8, Math.round(r * 0.68))}px JetBrains Mono, monospace`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(a.label, a.px, a.py);
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

// ===== PROGRESS BARS AUTO-TRIGGER =====
document.querySelectorAll('.progress-bar-fill').forEach(bar => {
    const w = bar.dataset.width;
    if (w) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { bar.style.width = w + '%'; obs.unobserve(bar); } });
        }, { threshold: 0.4 });
        obs.observe(bar);
    }
});

// ===== PIPELINE PROGRESS ANIMATION =====
const progressLine = document.querySelector('.pipeline-progress-line');
if (progressLine) {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                progressLine.style.transition = 'width 2.2s cubic-bezier(0.4,0,0.2,1)';
                progressLine.style.width = '0%';
                setTimeout(() => { progressLine.style.width = '65%'; }, 150);
            }
        });
    }, { threshold: 0.3 });
    obs.observe(progressLine);
}
