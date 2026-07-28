/* ==========================================================================
   AETHERIS - Three.js 3D Rendering & Camera System
   ========================================================================== */

import { BOARD_WIDTH, BOARD_HEIGHT, SHAPES } from './game.js';

export class GraphicsEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');

        // Scene & Camera setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.targetCenter = new THREE.Vector3(BOARD_WIDTH / 2 - 0.5, BOARD_HEIGHT / 2 - 1, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.copy(this.targetCenter);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.maxPolarAngle = Math.PI - 0.05;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 65;

        // Visual Objects Containers
        this.boardGroup = new THREE.Group();
        this.scene.add(this.boardGroup);

        this.activePieceGroup = new THREE.Group();
        this.ghostPieceGroup = new THREE.Group();
        this.boardGroup.add(this.activePieceGroup);
        this.boardGroup.add(this.ghostPieceGroup);

        // Grid mesh matrix for locked blocks
        this.meshGrid = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

        // Shared Geometry
        this.cubeGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);

        // Camera Shake State
        this.shakeIntensity = 0;

        // Particle System
        this.particles = [];

        // Build Environment
        this.setupCamera();
        this.setupLights();
        this.setupStarfield();
        this.setupSciFiBoardFrame();
        this.setupTouchGestures();
    }

    setupCamera() {
        this.resetCamera();
    }

    resetCamera() {
        this.camera.position.set(this.targetCenter.x + 12, this.targetCenter.y + 8, 24);
        this.controls.target.copy(this.targetCenter);
        this.controls.update();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x1a2035, 1.8);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(20, 30, 20);
        this.scene.add(dirLight);

        const pointLight1 = new THREE.PointLight(0x00f0ff, 2.5, 40);
        pointLight1.position.set(-8, 12, 12);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00a0, 2.5, 40);
        pointLight2.position.set(18, 12, 12);
        this.scene.add(pointLight2);
    }

    setupStarfield() {
        const starCount = 800;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            const radius = 120 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            starPos[i] = radius * Math.sin(phi) * Math.cos(theta);
            starPos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPos[i + 2] = radius * Math.cos(phi);
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const starfield = new THREE.Points(starGeo, starMat);
        this.scene.add(starfield);
    }

    setupSciFiBoardFrame() {
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x111625,
            metalness: 0.85,
            roughness: 0.2
        });

        const neonMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff
        });

        // Left & Right Pillars
        const pillarGeo = new THREE.BoxGeometry(0.8, BOARD_HEIGHT + 1, 0.8);
        const leftPillar = new THREE.Mesh(pillarGeo, metalMat);
        leftPillar.position.set(-1, BOARD_HEIGHT / 2 - 0.5, 0);
        this.boardGroup.add(leftPillar);

        const rightPillar = new THREE.Mesh(pillarGeo, metalMat);
        rightPillar.position.set(BOARD_WIDTH, BOARD_HEIGHT / 2 - 0.5, 0);
        this.boardGroup.add(rightPillar);

        // Top Beam & Bottom Platform
        const beamGeo = new THREE.BoxGeometry(BOARD_WIDTH + 2.4, 0.8, 0.8);
        const topBeam = new THREE.Mesh(beamGeo, metalMat);
        topBeam.position.set(BOARD_WIDTH / 2 - 0.5, BOARD_HEIGHT, 0);
        this.boardGroup.add(topBeam);

        const bottomPlatform = new THREE.Mesh(beamGeo, metalMat);
        bottomPlatform.position.set(BOARD_WIDTH / 2 - 0.5, -1, 0);
        this.boardGroup.add(bottomPlatform);

        // Neon Strip Accents
        const stripGeo = new THREE.BoxGeometry(0.1, BOARD_HEIGHT, 0.1);
        const leftStrip = new THREE.Mesh(stripGeo, neonMat);
        leftStrip.position.set(-0.5, BOARD_HEIGHT / 2 - 0.5, 0.42);
        this.boardGroup.add(leftStrip);

        const rightStrip = new THREE.Mesh(stripGeo, neonMat);
        rightStrip.position.set(BOARD_WIDTH - 0.5, BOARD_HEIGHT / 2 - 0.5, 0.42);
        this.boardGroup.add(rightStrip);

        // Grid Backing Lines
        const gridHelper = new THREE.GridHelper(BOARD_WIDTH, BOARD_WIDTH, 0x00f0ff, 0x111833);
        gridHelper.rotation.x = Math.PI / 2;
        gridHelper.position.set(BOARD_WIDTH / 2 - 0.5, BOARD_HEIGHT / 2 - 0.5, -0.51);
        this.boardGroup.add(gridHelper);

        // Floor Grid Reflection
        const floorGrid = new THREE.GridHelper(60, 60, 0x00f0ff, 0x111833);
        floorGrid.position.set(BOARD_WIDTH / 2 - 0.5, -2, 0);
        this.boardGroup.add(floorGrid);
    }

    createSolidMaterial(colorHex, emissiveHex, isGhost = false) {
        if (isGhost) {
            return new THREE.MeshBasicMaterial({
                color: colorHex,
                wireframe: true,
                transparent: true,
                opacity: 0.35
            });
        }
        return new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: emissiveHex,
            emissiveIntensity: 0.35,
            roughness: 0.25,
            metalness: 0.4
        });
    }

    setupTouchGestures() {
        let lastTapTime = 0;
        this.renderer.domElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const now = performance.now();
                if (now - lastTapTime < 300) {
                    this.resetCamera();
                }
                lastTapTime = now;
            }
        }, { passive: true });
    }

    syncActivePiece(activePiece, board) {
        // Clear active piece group children
        while (this.activePieceGroup.children.length > 0) {
            this.activePieceGroup.remove(this.activePieceGroup.children[0]);
        }
        while (this.ghostPieceGroup.children.length > 0) {
            this.ghostPieceGroup.remove(this.ghostPieceGroup.children[0]);
        }

        if (!activePiece) return;

        const mat = this.createSolidMaterial(SHAPES[activePiece.key].color, SHAPES[activePiece.key].emissive);
        const ghostMat = this.createSolidMaterial(SHAPES[activePiece.key].color, SHAPES[activePiece.key].emissive, true);

        const shape = activePiece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    // Active Cube
                    const mesh = new THREE.Mesh(this.cubeGeo, mat);
                    mesh.position.set(c, -r, 0);
                    this.activePieceGroup.add(mesh);

                    // Ghost Cube
                    const ghostMesh = new THREE.Mesh(this.cubeGeo, ghostMat);
                    ghostMesh.position.set(c, -r, 0);
                    this.ghostPieceGroup.add(ghostMesh);
                }
            }
        }

        this.activePieceGroup.position.set(activePiece.x, activePiece.y, 0);
        const ghostY = activePiece.getGhostY(board);
        this.ghostPieceGroup.position.set(activePiece.x, ghostY, 0);
    }

    syncBoardState(board) {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                const key = board.grid[r][c];
                if (key !== null && !this.meshGrid[r][c]) {
                    const mat = this.createSolidMaterial(SHAPES[key].color, SHAPES[key].emissive);
                    const mesh = new THREE.Mesh(this.cubeGeo, mat);
                    mesh.position.set(c, r, 0);
                    this.boardGroup.add(mesh);
                    this.meshGrid[r][c] = mesh;
                } else if (key === null && this.meshGrid[r][c]) {
                    this.boardGroup.remove(this.meshGrid[r][c]);
                    this.meshGrid[r][c].geometry.dispose();
                    this.meshGrid[r][c].material.dispose();
                    this.meshGrid[r][c] = null;
                }
            }
        }
    }

    resetBoardState() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                if (this.meshGrid[r][c]) {
                    this.boardGroup.remove(this.meshGrid[r][c]);
                    this.meshGrid[r][c].geometry.dispose();
                    this.meshGrid[r][c].material.dispose();
                    this.meshGrid[r][c] = null;
                }
            }
        }
    }

    triggerImpact() {
        this.shakeIntensity = 0.45;
    }

    triggerLineClearFX(linesCount) {
        this.shakeIntensity = 0.25 * linesCount;
        
        // Spawn line clear explosion particles
        for (let i = 0; i < 25; i++) {
            const pGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
            const pMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true });
            const mesh = new THREE.Mesh(pGeo, pMat);
            mesh.position.set(
                (Math.random() - 0.5) * BOARD_WIDTH,
                Math.random() * BOARD_HEIGHT,
                (Math.random() - 0.5) * 4
            );
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life: 1.0 });
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(delta) {
        this.controls.update();

        // Update Camera Shake Offset
        if (this.shakeIntensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 2.5);
        }

        // Update Particle System
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta * 2.0;
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.material.opacity = Math.max(0, p.life);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
