import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { TextureLoader } from 'three';

// =========================================================
// 1. CONFIGURATION
// =========================================================
const SETTINGS = {
    paths: {
        // Paths updated to assets/...
        model: 'assets/models/Connect.gltf',
        hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr',
        handImage: 'assets/images/hand.png',
        sound: 'assets/sounds/angelsound.mp3'
    },

    correction: {
        rotateX: 0, 
        rotateY: 0, 
        rotateZ: 0 
    },

    // --- ENTRANCE (THE ELEVATOR) ---
    entrance: {
        slideX: 0.0,       
        slideY: -15.0,     
        slideZ: 0.0,      
        startScale: 0.0,   
    },

    animation: {
        startDelay: 500,       
        direction: 'center-out', 
        writingSpeed: 20,      
        moveSpeed: 0.04,       
        rotateSpeed: 0.008,      
    },

    text: {
        scale: 0.9,
        position: { x: 0, y: 0.6, z: 0 },
        letterSpacing: 1.01,
        randomOffset: 0.0, 

        breathing: {
            enabled: true,
            speed: 0.002,   
            range: 0.15     
        },

        // INTERACTION (Deep Push)
        interaction: {
            enabled: true,
            axis: 'z',         
            pushDepth: -3.0,   
            pushSpeed: 2.0,    
            recoverySpeed: 0.05 
        },

        hoverEnabled: true,
        sensitivity: { x: 0.03, y: 0.03 }, 
        maxRotation: 0.3, 
        hoverOffset: 0.0,  
        hoverNoise: 0.0    
    },

    hands: {
        baseSize: 9,
        depth: -12,
        verticalPos: -5,
        separation: 28,
        
        // --- NEW: HANDS BREATHING ---
        breathing: {
            enabled: true,
            speed: 0.0015,  // Slightly slower than text for organic feel
            range: 0.25     // Gentle float amount
        },

        sensitivity: { x: 0.01, y: 0.02 }, 
        friction: 0.01
    },

    material: {
        color: 0xffffff,
        opacity: 1.0,
        thickness: 1.5,
        roughness: 0.0,
        metalness: 0.1,
        ior: 2.3
    }
};

// =========================================================
// 2. SCENE SETUP
// =========================================================
const container = document.getElementById('glass-canvas-container');
const scene = new THREE.Scene();

const angelSound = new Audio(SETTINGS.paths.sound);
angelSound.volume = 0.5; 
let hasAudioStarted = false; 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 15; 

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); 
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; 

container.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = { x: 0, y: 0 }; 
const rayMouse = new THREE.Vector2(-999, -999); 

// =========================================================
// 3. MATERIAL
// =========================================================
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: SETTINGS.material.color,        
    emissive: 0x000000,
    transmission: 0,      
    opacity: SETTINGS.material.opacity,           
    thickness: SETTINGS.material.thickness,         
    roughness: SETTINGS.material.roughness,         
    metalness: SETTINGS.material.metalness,         
    ior: SETTINGS.material.ior,               
    envMapIntensity: 2.5,   
    specularIntensity: 1.0, 
    clearcoat: 1.0,         
    side: THREE.DoubleSide
});

// =========================================================
// 4. LOAD HANDS
// =========================================================
const handsGroup = new THREE.Group();
scene.add(handsGroup); 

new TextureLoader().load(SETTINGS.paths.handImage, (texture) => {
    const aspect = texture.image.width / texture.image.height;
    const geometry = new THREE.PlaneGeometry(SETTINGS.hands.baseSize * aspect, SETTINGS.hands.baseSize);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true, 
        alphaTest: 0.5, 
        side: THREE.DoubleSide 
    });
    
    const leftHand = new THREE.Mesh(geometry, material);
    leftHand.position.set(SETTINGS.hands.separation / 2, SETTINGS.hands.verticalPos, SETTINGS.hands.depth); 
    leftHand.rotation.z = THREE.MathUtils.degToRad(240); 
    handsGroup.add(leftHand); 

    const rightHand = new THREE.Mesh(geometry, material);
    rightHand.position.set(-(SETTINGS.hands.separation / 2), SETTINGS.hands.verticalPos, SETTINGS.hands.depth);
    rightHand.rotation.z = THREE.MathUtils.degToRad(120); 
    rightHand.scale.x = -1; 
    handsGroup.add(rightHand); 
});

// =========================================================
// 5. LOAD MODEL
// =========================================================
new RGBELoader().load(SETTINGS.paths.hdri, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

const loader = new GLTFLoader();
let letterMeshes = []; 

loader.load(SETTINGS.paths.model, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    model.traverse((child) => {
        if (child.isMesh) {
            child.material = glassMaterial;
            
            if (child.geometry) {
                child.geometry.translate(-center.x, -center.y, -center.z);
            }

            child.position.x *= SETTINGS.text.letterSpacing;
            child.position.x += (Math.random() - 0.5) * SETTINGS.text.randomOffset;
            child.position.y += (Math.random() - 0.5) * SETTINGS.text.randomOffset;
            child.position.z += (Math.random() - 0.5) * SETTINGS.text.randomOffset;

            // CAPTURE HOME STATE
            const homePos = child.position.clone();
            const homeRot = child.rotation.clone(); 
            
            homeRot.x += THREE.MathUtils.degToRad(SETTINGS.correction.rotateX);
            homeRot.y += THREE.MathUtils.degToRad(SETTINGS.correction.rotateY);
            homeRot.z += THREE.MathUtils.degToRad(SETTINGS.correction.rotateZ);

            const homeScale = new THREE.Vector3(1, 1, 1);

            child.userData = {
                homePos: homePos,
                homeRot: homeRot,
                homeScale: homeScale,
                noise: Math.random(),
                currentOffset: 0.0, 
                isHovered: false
            };

            // --- ELEVATOR LOGIC ---
            child.position.set(
                homePos.x + SETTINGS.entrance.slideX, 
                homePos.y + SETTINGS.entrance.slideY, 
                homePos.z + SETTINGS.entrance.slideZ
            );
            
            child.scale.setScalar(SETTINGS.entrance.startScale);

            letterMeshes.push(child);
        }
    });

    // --- SORTING: CENTER-OUT ---
    letterMeshes.sort((a, b) => {
        const homeX_A = a.userData.homePos.x;
        const homeX_B = b.userData.homePos.x;
        return Math.abs(homeX_A) - Math.abs(homeX_B);
    });

    model.scale.set(SETTINGS.text.scale, SETTINGS.text.scale, SETTINGS.text.scale); 
    model.position.set(SETTINGS.text.position.x, SETTINGS.text.position.y, SETTINGS.text.position.z); 
    scene.add(model);

    // =========================================================
    // 6. EVENT LISTENERS
    // =========================================================
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX - windowHalfX) / 100;
        mouse.y = (event.clientY - windowHalfY) / 100;
        rayMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        rayMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('click', () => {
        if (!hasAudioStarted) {
            angelSound.play().catch(() => {});
            hasAudioStarted = true;
        }
    });

    // =========================================================
    // 7. PERFORMANCE OPTIMIZATION (Visibility Check)
    // =========================================================
    let isRendering = true;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isRendering) {
                    isRendering = true;
                    animate(); // Restart loop
                }
            } else {
                isRendering = false; // Stop loop
            }
        });
    }, { threshold: 0 }); // Trigger as soon as it leaves

    observer.observe(container);

    // =========================================================
    // 8. ANIMATION LOOP
    // =========================================================
    
    let startTime = null;

    function animate(time) {
        // --- 1. STOP IF OFF SCREEN ---
        if (!isRendering) return;

        requestAnimationFrame(animate);

        // Standard time handling
        if (!time) time = performance.now();
        if (!startTime) startTime = time;
        const elapsed = time - startTime;

        if (elapsed > SETTINGS.animation.startDelay) {
            
            if (!hasAudioStarted) {
                const playPromise = angelSound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {});
                }
                hasAudioStarted = true;
            }

            if (SETTINGS.text.interaction.enabled) {
                letterMeshes.forEach(mesh => { mesh.userData.isHovered = false; });
                raycaster.setFromCamera(rayMouse, camera);
                const intersects = raycaster.intersectObjects(letterMeshes);
                if (intersects.length > 0) {
                    intersects[0].object.userData.isHovered = true;
                }
            }

            const animationTime = elapsed - SETTINGS.animation.startDelay;
            const indexToReveal = Math.floor(animationTime / SETTINGS.animation.writingSpeed);

            letterMeshes.forEach((mesh, index) => {
                if (index <= indexToReveal) {
                    const data = mesh.userData;

                    // --- HOVER ---
                    let targetOffset = 0;
                    let speed = SETTINGS.text.interaction.recoverySpeed;

                    if (data.isHovered) {
                        targetOffset = SETTINGS.text.interaction.pushDepth;
                        speed = SETTINGS.text.interaction.pushSpeed;
                    }
                    data.currentOffset += (targetOffset - data.currentOffset) * speed;

                    const axis = SETTINGS.text.interaction.axis.toLowerCase();
                    const pushX = (axis === 'x') ? data.currentOffset : 0;
                    const pushY = (axis === 'y') ? data.currentOffset : 0;
                    const pushZ = (axis === 'z') ? data.currentOffset : 0;

                    // --- BREATHING (TEXT) ---
                    let breathY = 0;
                    if (SETTINGS.text.breathing.enabled) {
                        breathY = Math.sin(elapsed * SETTINGS.text.breathing.speed + index) * SETTINGS.text.breathing.range;
                    }

                    // --- APPLY POSITION ---
                    const targetX = data.homePos.x + pushX;
                    const targetY = data.homePos.y + breathY + pushY;
                    const targetZ = data.homePos.z + pushZ;

                    mesh.position.x += (targetX - mesh.position.x) * SETTINGS.animation.moveSpeed;
                    mesh.position.y += (targetY - mesh.position.y) * SETTINGS.animation.moveSpeed;
                    mesh.position.z += (targetZ - mesh.position.z) * SETTINGS.animation.moveSpeed;
                    
                    // --- SCALE ---
                    mesh.scale.x += (data.homeScale.x - mesh.scale.x) * SETTINGS.animation.moveSpeed;
                    mesh.scale.y += (data.homeScale.y - mesh.scale.y) * SETTINGS.animation.moveSpeed;
                    mesh.scale.z += (data.homeScale.z - mesh.scale.z) * SETTINGS.animation.moveSpeed;

                    // --- ROTATION ---
                    let targetRotX = data.homeRot.x; 
                    let targetRotY = data.homeRot.y;
                    
                    if (SETTINGS.text.hoverEnabled) {
                        const wave = index * SETTINGS.text.hoverOffset;
                        const noise = data.noise * SETTINGS.text.hoverNoise;
                        
                        const mouseX = (mouse.y * SETTINGS.text.sensitivity.x) + wave + noise;
                        const mouseY = (mouse.x * SETTINGS.text.sensitivity.y) + wave + noise;
                        
                        targetRotX += THREE.MathUtils.clamp(mouseX, -SETTINGS.text.maxRotation, SETTINGS.text.maxRotation);
                        targetRotY += THREE.MathUtils.clamp(mouseY, -SETTINGS.text.maxRotation, SETTINGS.text.maxRotation);
                    }

                    mesh.rotation.x += (targetRotX - mesh.rotation.x) * SETTINGS.animation.rotateSpeed;
                    mesh.rotation.y += (targetRotY - mesh.rotation.y) * SETTINGS.animation.rotateSpeed;
                }
            });
        }

        if (model) {
            let groupTargetX = mouse.y * (SETTINGS.text.sensitivity.x * 0.5);
            let groupTargetY = mouse.x * (SETTINGS.text.sensitivity.y * 0.5);
            model.rotation.x += 0.05 * (groupTargetX - model.rotation.x);
            model.rotation.y += 0.05 * (groupTargetY - model.rotation.y);
        }

        if (handsGroup) {
            // MOUSE INTERACTION
            const hx = mouse.y * SETTINGS.hands.sensitivity.x;
            const hy = mouse.x * SETTINGS.hands.sensitivity.y;
            handsGroup.rotation.x += SETTINGS.hands.friction * (hx - handsGroup.rotation.x);
            handsGroup.rotation.y += SETTINGS.hands.friction * (hy - handsGroup.rotation.y);

            // BREATHING (HANDS)
            if (SETTINGS.hands.breathing.enabled) {
                const handsBreathY = Math.sin(elapsed * SETTINGS.hands.breathing.speed) * SETTINGS.hands.breathing.range;
                handsGroup.position.y = handsBreathY; 
            }
        }

        renderer.render(scene, camera);
    }
    animate();

}, undefined, function (error) {
    console.error('Model Error:', error);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});