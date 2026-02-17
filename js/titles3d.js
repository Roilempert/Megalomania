import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Helper function to create rounded rectangle geometry
function createRoundedRectangle(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    
    // Draw rounded rectangle path
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    
    return new THREE.ShapeGeometry(shape);
}

const CONFIG = {
    fontPath: 'assets/fonts/Neue Montreal_Bold.json', 
    zIndex: '30', 
    textSize: 80,         
    textThickness: 8,      
    curveSegments: 8, 
    bevelEnabled: true,
    bevelThickness: 0.3,   
    bevelSize: 0.2,        
    bevelSegments: 1, 
    color: 0x282828,       // Match entry title color (#282828)
    roughness: 0.7,        // Less shiny, more matte
    metalness: 0.1,        // Less metallic
    backgroundColor: 0xcdcdcd,  // Grey background box color
    backgroundPadding: 15,      // Padding around text (matches CSS 10px-15px)
    backgroundBorderRadius: 5,  // Rounded corners
    mouseSensitivity: 0.0005, 
    rotationSpeed: 0.15,
    ambientIntensity: 0.7,    
    directLightIntensity: 0.6,
    lightPosition: { x: 200, y: 200, z: 500 }
};

export function init3DTitles() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = CONFIG.zIndex; 
    container.style.pointerEvents = 'none'; 
    container.style.opacity = '0';
    container.style.transition = 'opacity 2s ease-in';
    document.body.appendChild(container);

    // Fade In
    setTimeout(() => container.style.opacity = '1', 100);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1); 
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, CONFIG.ambientIntensity);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, CONFIG.directLightIntensity);
    dirLight.position.set(CONFIG.lightPosition.x, CONFIG.lightPosition.y, CONFIG.lightPosition.z);
    scene.add(dirLight);

    const titleElements = document.querySelectorAll('.entry-title');
    const meshes = [];
    const mouse = new THREE.Vector2();
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let isVisible = false;

    function getPixelScale() {
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
        return height / window.innerHeight;
    }

    function syncCamera() {
        const pixelScale = getPixelScale();
        camera.position.y = -window.scrollY * pixelScale;
        
        if (window.scrollY < window.innerHeight * 0.5) {
            isVisible = false;
            container.style.display = 'none'; 
        } else {
            isVisible = true;
            container.style.display = 'block';
        }
    }

    function updateLayout() {
        const pixelScale = getPixelScale();
        const startY = (window.innerHeight * pixelScale) / 2; 

        meshes.forEach(item => {
            const rect = item.domElement.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            const centerX = rect.left + rect.width / 2;
            const centerYOffset = rect.height / 2;

            const x = (centerX - window.innerWidth / 2) * pixelScale;
            item.originalY = startY - ((absoluteTop + centerYOffset) * pixelScale);

            item.mesh.position.x = x;
            item.mesh.position.y = item.originalY;

            const computedStyle = window.getComputedStyle(item.domElement);
            const fontSize = parseFloat(computedStyle.fontSize);
            const scaleFactor = (fontSize / CONFIG.textSize) * pixelScale;
            item.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        });
        syncCamera();
    }

    const loader = new FontLoader();
    loader.load(CONFIG.fontPath, function (font) {
        titleElements.forEach((el) => {
            const text = el.innerText;
            const geometry = new TextGeometry(text, {
                font: font,
                size: CONFIG.textSize,
                height: CONFIG.textThickness,
                curveSegments: CONFIG.curveSegments,
                bevelEnabled: CONFIG.bevelEnabled,
                bevelThickness: CONFIG.bevelThickness,
                bevelSize: CONFIG.bevelSize,
                bevelOffset: 0,
                bevelSegments: CONFIG.bevelSegments
            });
            geometry.center(); 
            
            // Text Material - Matte finish to match CSS
            const material = new THREE.MeshStandardMaterial({ 
                color: CONFIG.color,
                roughness: CONFIG.roughness,
                metalness: CONFIG.metalness
            });
            const mesh = new THREE.Mesh(geometry, material);
            
            // --- ADD BACKGROUND BOX ---
            // Calculate bounding box of text
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            const textWidth = bbox.max.x - bbox.min.x;
            const textHeight = bbox.max.y - bbox.min.y;
            
            // Create background plane (slightly larger than text)
            const bgWidth = textWidth + CONFIG.backgroundPadding * 2;
            const bgHeight = textHeight + CONFIG.backgroundPadding * 2;
            
            // Use rounded rectangle instead of flat plane
            const bgGeometry = createRoundedRectangle(bgWidth, bgHeight, CONFIG.backgroundBorderRadius);
            const bgMaterial = new THREE.MeshStandardMaterial({ 
                color: CONFIG.backgroundColor,
                roughness: 0.9,
                metalness: 0.0
            });
            const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
            
            // Position background behind text
            bgMesh.position.z = -CONFIG.textThickness / 2 - 2; // Slightly behind
            
            // Create a group to hold both background and text
            const titleGroup = new THREE.Group();
            titleGroup.add(bgMesh);
            titleGroup.add(mesh);
            
            scene.add(titleGroup);
            meshes.push({ mesh: titleGroup, domElement: el, originalY: 0 });
        });
        updateLayout();
    });

    window.addEventListener('scroll', syncCamera, { passive: true });
    document.addEventListener('mousemove', (e) => {
        if (!isVisible) return; 
        mouse.x = (e.clientX - windowHalfX) * CONFIG.mouseSensitivity; 
        mouse.y = (e.clientY - windowHalfY) * CONFIG.mouseSensitivity;
    });
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectiosnMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateLayout();
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        const pixelScale = getPixelScale();
        camera.position.y = -window.scrollY * pixelScale;
        const screenHeight3D = window.innerHeight * pixelScale;
        meshes.forEach(item => {
            const dist = Math.abs(item.mesh.position.y - camera.position.y);
            if (dist > screenHeight3D / 2 + 200) item.mesh.visible = false;
            else {
                item.mesh.visible = true;
                // Apply rotation to the entire group (text + background together)
                item.mesh.rotation.x += (mouse.y - item.mesh.rotation.x) * CONFIG.rotationSpeed;
                item.mesh.rotation.y += (mouse.x - item.mesh.rotation.y) * CONFIG.rotationSpeed;
            }
        });
        renderer.render(scene, camera);
    }
    animate();
}