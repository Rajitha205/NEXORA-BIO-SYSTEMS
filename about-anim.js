// 3D Animated Molecule Avatar for About Page
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    window.addEventListener('resize', resize);
    resize();

    // 3D Nodes for a stylized molecule
    const nodes = [];
    const numNodes = 70;

    // Create a sphere of nodes
    for (let i = 0; i < numNodes; i++) {
        // distribute roughly evenly
        const phi = Math.acos(-1 + (2 * i) / numNodes);
        const theta = Math.sqrt(numNodes * Math.PI) * phi;

        // Randomize radius a bit giving it a dynamic shell feel
        const r = 50 + Math.random() * 20;

        nodes.push({
            x: r * Math.cos(theta) * Math.sin(phi),
            y: r * Math.sin(theta) * Math.sin(phi),
            z: r * Math.cos(phi),
            baseX: r * Math.cos(theta) * Math.sin(phi),
            baseY: r * Math.sin(theta) * Math.sin(phi),
            baseZ: r * Math.cos(phi),
            randomOffsets: { x: Math.random() * 10, y: Math.random() * 10, z: Math.random() * 10 }
        });
    }

    let angleX = 0;
    let angleY = 0;
    let time = 0;

    function render() {
        ctx.clearRect(0, 0, width, height);

        angleY += 0.005;
        angleX += 0.002;
        time += 0.01;

        const projectedNodes = [];

        // Project 3D nodes to 2D
        for (let i = 0; i < numNodes; i++) {
            const node = nodes[i];

            // Add organic wiggle
            const cx = node.baseX + Math.sin(time * 2 + node.randomOffsets.x) * 4;
            const cy = node.baseY + Math.cos(time * 2.5 + node.randomOffsets.y) * 4;
            const cz = node.baseZ + Math.sin(time * 3 + node.randomOffsets.z) * 4;

            // Rotate Y
            const x1 = cx * Math.cos(angleY) - cz * Math.sin(angleY);
            const z1 = cx * Math.sin(angleY) + cz * Math.cos(angleY);

            // Rotate X
            const y2 = cy * Math.cos(angleX) - z1 * Math.sin(angleX);
            const z2 = cy * Math.sin(angleX) + z1 * Math.cos(angleX);

            const scale = 200 / (200 + z2);

            projectedNodes.push({
                x: (width / 2) + x1 * scale,
                y: (height / 2) + y2 * scale,
                z: z2,
                scale: scale
            });
        }

        projectedNodes.sort((a, b) => b.z - a.z); // Depth sorting

        // Draw connections for close nodes
        ctx.lineWidth = 1;
        for (let i = 0; i < projectedNodes.length; i++) {
            for (let j = i + 1; j < projectedNodes.length; j++) {
                const nodeA = projectedNodes[i];
                const nodeB = projectedNodes[j];
                const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);

                if (dist < 35) {
                    const alpha = 1 - (dist / 35);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.4})`;
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (let i = 0; i < projectedNodes.length; i++) {
            const node = projectedNodes[i];
            const size = Math.max(0.5, 3 * node.scale);
            const alpha = Math.max(0.1, 1 - (node.z + 100) / 200);

            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            // Mix neon green and cyan based on depth
            if (node.z > 0) {
                ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
                ctx.shadowColor = 'rgba(57, 255, 20, 0.5)';
            } else {
                ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
                ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
            }
            ctx.shadowBlur = 8;
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    render();
});
