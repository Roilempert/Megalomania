// EXPORT THE MAIN INIT FUNCTION
export function initGodMode() {
    
    // 1. Performance Observer
    const physicsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const container = entry.target.querySelector('.article-content');
            if (!container) return;

            if (entry.isIntersecting) {
                if (container.resumeEffect) container.resumeEffect();
            } else {
                if (!container.isGlobalEffect && container.pauseEffect) {
                    container.pauseEffect();
                }
            }
        });
    }, { threshold: 0.1 });

    const indexEntries = document.querySelectorAll('.index-entry');

    indexEntries.forEach((entry, index) => {
    const textContainer = entry.querySelector('.article-content');
    
    if (textContainer) {
        // Updated indices to match your HTML structure exactly:
        if (index === 0) initGarlicBreadHybrid(textContainer);      // Garlic Bread
        else if (index === 1) initAdultFilmsRope(textContainer);    // Adult Films
        else if (index === 2) initNatureWreckingBall(textContainer); // Nature
        else if (index === 3) initArtEffect(textContainer);         // Art
        else if (index === 4) initHotDogEffect(textContainer);       // Hot Dog
        else if (index === 5) initCigaretteSmoke(textContainer);    // Cigarettes
        else if (index === 6) initDogsEffect(textContainer);        // Dogs (Moved to index 6)
        else if (index === 7) initWifeEffect(textContainer);        // My Wife
        else if (index === 8) initStickyTrap(textContainer);        // Toilet Paper
            // Start observing for pause/resume
            physicsObserver.observe(entry);

            // Enable "Effect Active" state on click
            entry.addEventListener('click', (e) => {
                if (entry.dataset.isDragging === "true") return;
                if (!entry.classList.contains('effect-active')) {
                    entry.classList.add('effect-active');
                }
            });
        }
    });
}

// =========================================================
// HELPERS (Text Splitting)
// =========================================================
function splitTextByChar(element) {
    if (element.classList && (
        element.classList.contains('text-image1') || 
        element.classList.contains('text-image2') || 
        element.classList.contains('text-image3') || 
        element.classList.contains('nature-earth-image')
    )) return; 

    const childNodes = Array.from(element.childNodes);
    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent.replace(/\s+/g, ' '); 
            if (text.trim() === "" && text !== ' ') return;
            const fragment = document.createDocumentFragment();
            const words = text.split(' ');
            words.forEach((word, index) => {
                if (word === "") return;
                const wordWrapper = document.createElement('span');
                wordWrapper.className = 'word-wrapper';
                wordWrapper.style.display = 'inline-block';
                wordWrapper.style.whiteSpace = 'nowrap'; 
                wordWrapper.style.pointerEvents = 'none';
                word.split('').forEach(char => {
                    const span = document.createElement('span');
                    span.className = 'char-particle'; 
                    span.innerText = char;
                    span.style.pointerEvents = 'auto';
                    wordWrapper.appendChild(span);
                });
                fragment.appendChild(wordWrapper);
                if (index < words.length - 1) fragment.appendChild(document.createTextNode(' '));
            });
            node.replaceWith(fragment);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR' && node.tagName !== 'IMG') {
            splitTextByChar(node);
        }
    });
}

function splitTextByWord(element) {
    if (element.classList && (
        element.classList.contains('text-image1') || 
        element.classList.contains('text-image2') || 
        element.classList.contains('text-image3')
    )) return;

    const childNodes = Array.from(element.childNodes);
    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent.replace(/\s+/g, ' ');
            if (text.trim() === "") return;
            const fragment = document.createDocumentFragment();
            const words = text.split(' ');
            words.forEach((word, i) => {
                if (word === "") return;
                const span = document.createElement('span');
                span.className = 'word-particle'; 
                span.innerText = word; 
                fragment.appendChild(span);
                if (i < words.length - 1) fragment.appendChild(document.createTextNode(' '));
            });
            node.replaceWith(fragment);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR' && node.tagName !== 'IMG') {
            splitTextByWord(node);
        }
    });
}

// =========================================================
// EFFECT 1: GARLIC BREAD (Falling Letters)
// =========================================================
function initGarlicBreadHybrid(container) {
    const Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, 
          Runner = Matter.Runner, Constraint = Matter.Constraint, Events = Matter.Events;

    const engine = Engine.create();
    const world = engine.world;
    let ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight+50, window.innerWidth, 100, { isStatic: true });
    World.add(world, ground);
    const runner = Runner.create();
    Runner.run(runner, engine);

    splitTextByChar(container);
    const domNodes = container.querySelectorAll('.char-particle');
    const visualState = new Map();
    domNodes.forEach(node => visualState.set(node, { x: 0, y: 0, vx: 0, vy: 0 }));

    let mouse = { x: 0, y: 0, vx: 0, vy: 0 }, lastMouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX; mouse.y = e.clientY;
        mouse.vx = e.clientX - lastMouse.x; mouse.vy = e.clientY - lastMouse.y;
        lastMouse.x = e.clientX; lastMouse.y = e.clientY;
    });

    let animationFrameId;
    let isRunning = true;

    function updateVisuals() {
        if (!isRunning) return;
        if (!container.closest('.index-entry').classList.contains('effect-active')) {
            animationFrameId = requestAnimationFrame(updateVisuals);
            return; 
        }

        const radius = 60, magnetStrength = 0.35, springStiffness = 0.12, friction = 0.85, rippleForce = 0.15;
        const mouseSpeed = Math.sqrt(mouse.vx*mouse.vx + mouse.vy*mouse.vy);
        
        domNodes.forEach(span => {
            if (span.classList.contains('is-falling')) return;
            const state = visualState.get(span);
            const rect = span.getBoundingClientRect();
            const pX = rect.left + rect.width/2, pY = rect.top + rect.height/2;
            const dx = mouse.x - pX, dy = mouse.y - pY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < radius) {
                const proximity = (radius - dist) / radius;
                if (mouseSpeed > 8) { state.vx += mouse.vx * rippleForce * proximity; state.vy += mouse.vy * rippleForce * proximity; } 
                else { state.vx += dx * magnetStrength * proximity; state.vy += dy * magnetStrength * proximity; }
            }
            state.vx += -state.x * springStiffness; state.vy += -state.y * springStiffness;
            state.vx *= friction; state.vy *= friction;
            state.x += state.vx; state.y += state.vy;
            
            if (Math.abs(state.x) < 0.1 && Math.abs(state.y) < 0.1) {
                if (state.x !== 0) { state.x = 0; state.y = 0; span.style.transform = 'none'; }
            } else {
                span.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
            }
        });
        animationFrameId = requestAnimationFrame(updateVisuals);
    }
    updateVisuals();

    domNodes.forEach(span => {
        span.addEventListener('mousedown', (e) => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            e.preventDefault();
            e.stopPropagation(); 
            container.isGlobalEffect = true;

            if (span.classList.contains('is-falling')) return;
            const rect = span.getBoundingClientRect();
            const placeholder = document.createElement('span');
            placeholder.className = 'char-placeholder'; placeholder.innerText = span.innerText;
            span.parentNode.insertBefore(placeholder, span);
            span.classList.add('is-falling');
            
            span.style.left = '0px'; span.style.top = '0px'; 
            span.style.width = rect.width + 'px'; span.style.height = rect.height + 'px'; span.style.transform = 'none';
            span.style.zIndex = '9999999'; // High Z-Index fix

            const body = Bodies.rectangle(rect.left + rect.width/2, rect.top + rect.height/2, rect.width, rect.height, { restitution: 0.5, friction: 0.1 });
            World.add(world, body);
            
            Events.on(engine, 'afterUpdate', () => {
                span.style.transform = `translate3d(${body.position.x - span.offsetWidth/2}px, ${body.position.y - span.offsetHeight/2}px, 0) rotate(${body.angle}rad)`;
            });
            
            const mouseConstraint = Constraint.create({ pointA: { x: mouse.x, y: mouse.y }, bodyB: body, stiffness: 0.1, render: { visible: false } });
            World.add(world, mouseConstraint);
            const onUp = () => { document.removeEventListener('mouseup', onUp); World.remove(world, mouseConstraint); };
            document.addEventListener('mouseup', onUp);
        });
    });

    container.pauseEffect = () => { isRunning = false; Runner.stop(runner); cancelAnimationFrame(animationFrameId); };
    container.resumeEffect = () => { if(!isRunning){ isRunning = true; Runner.run(runner, engine); updateVisuals(); }};
}

// =========================================================
// EFFECT 2: ADULT FILMS (Rope)
// =========================================================
function initAdultFilmsRope(container) {
    const Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Body = Matter.Body,
          Runner = Matter.Runner, Events = Matter.Events, Constraint = Matter.Constraint;

    const engine = Engine.create({ positionIterations: 6 });
    const world = engine.world;
    let ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight+50, window.innerWidth, 100, { isStatic: true });
    World.add(world, ground);
    const runner = Runner.create();
    Runner.run(runner, engine);

    splitTextByWord(container); 
    const allWords = Array.from(container.querySelectorAll('.word-particle'));
    let mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function getLines() {
        const lines = []; let currentLine = []; let currentY = -1;
        allWords.forEach(word => {
            if (word.classList.contains('is-rope')) return;
            const y = word.offsetTop;
            if (currentY === -1 || Math.abs(y - currentY) > 10) {
                if (currentLine.length > 0) lines.push(currentLine); currentLine = []; currentY = y;
            }
            currentLine.push(word);
        });
        if (currentLine.length > 0) lines.push(currentLine); return lines;
    }

    allWords.forEach(word => {
        word.addEventListener('mousedown', (e) => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            e.preventDefault();
            container.isGlobalEffect = true;

            if (word.classList.contains('is-rope')) return;

            const lines = getLines();
            const targetLine = lines.find(line => line.includes(word));
            if (!targetLine) return;

            const lineGroup = Body.nextGroup(true); 
            let previousBody = null;
            let prevRect = null;

            targetLine.forEach((w, i) => {
                const rect = w.getBoundingClientRect(); 
                const placeholder = document.createElement('span');
                placeholder.className = 'word-placeholder'; placeholder.innerText = w.innerText; placeholder.style.width = rect.width + 'px';
                w.parentNode.insertBefore(placeholder, w);
                
                w.classList.add('is-rope'); 
                w.style.left = '0px'; w.style.top = '0px';
                w.style.width = rect.width + 'px'; w.style.height = rect.height + 'px';
                w.style.zIndex = '9999999'; // High Z-Index fix

                const body = Bodies.rectangle(rect.left + rect.width/2, rect.top + rect.height/2, rect.width, rect.height, { 
                    friction: 0.8, restitution: 0.0, density: 0.01, frictionAir: 0.05, collisionFilter: { group: lineGroup } 
                });
                World.add(world, body);
                Events.on(engine, 'afterUpdate', () => {
                    w.style.transform = `translate3d(${body.position.x - w.offsetWidth/2}px, ${body.position.y - w.offsetHeight/2}px, 0) rotate(${body.angle}rad)`;
                });
                if (previousBody) {
                    const link = Constraint.create({ 
                        bodyA: previousBody, pointA: { x: prevRect.width/2, y: 0 }, 
                        bodyB: body, pointB: { x: -rect.width/2, y: 0 }, 
                        stiffness: 0.9, damping: 0.5, length: 0, render: { visible: false } 
                    });
                    World.add(world, link);
                }
                previousBody = body;
                prevRect = rect;
                if (w === word) {
                    const mouseConstraint = Constraint.create({ pointA: { x: mouse.x, y: mouse.y }, bodyB: body, stiffness: 0.2, render: { visible: false } });
                    World.add(world, mouseConstraint);
                    const onMove = (mv) => { mouseConstraint.pointA = { x: mv.clientX, y: mv.clientY }; };
                    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); World.remove(world, mouseConstraint); };
                    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                }
            });
        });
    });

    let isRunning = true;
    container.pauseEffect = () => { isRunning = false; Runner.stop(runner); };
    container.resumeEffect = () => { isRunning = true; Runner.run(runner, engine); };
}

// =========================================================
// EFFECT 3: NATURE (Wrecking Ball)
// =========================================================
function initNatureWreckingBall(container) {
    const Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Body = Matter.Body, Runner = Matter.Runner, Events = Matter.Events;
    const engine = Engine.create();
    engine.world.gravity.y = 1; 
    const runner = Runner.create();
    Runner.run(runner, engine);

    const wallThickness = 200; 
    let floor = Bodies.rectangle(window.innerWidth/2, window.innerHeight + wallThickness/2, window.innerWidth, wallThickness, { isStatic: true });
    let leftWall = Bodies.rectangle(0 - wallThickness/2, window.innerHeight/2, wallThickness, window.innerHeight * 2, { isStatic: true });
    let rightWall = Bodies.rectangle(window.innerWidth + wallThickness/2, window.innerHeight/2, wallThickness, window.innerHeight * 2, { isStatic: true });
    World.add(engine.world, [floor, leftWall, rightWall]);
    
    window.addEventListener('resize', () => {
        Body.setPosition(floor, { x: window.innerWidth/2, y: window.innerHeight + wallThickness/2 });
        Body.setPosition(rightWall, { x: window.innerWidth + wallThickness/2, y: window.innerHeight/2 });
    });

    const image = container.querySelector('.nature-earth-image');
    let ballBody = null;
    let particles = [];
    
    if (image) {
        const rect = image.getBoundingClientRect();
        const radius = rect.width / 2;
        ballBody = Bodies.circle(rect.left + radius, rect.top + radius, radius, { 
            isStatic: true, restitution: 0.6, friction: 0.5, density: 0.05, mass: 10
        });
        World.add(engine.world, ballBody);
        
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder'; 
        placeholder.style.width = rect.width + 'px'; 
        placeholder.style.height = rect.height + 'px';
        
        let isDragging = false, hasActivated = false;
        let mouseX = 0, mouseY = 0, lastX = rect.left + radius, lastY = rect.top + radius, velX = 0, velY = 0;
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        
        image.addEventListener('mousedown', (e) => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            e.preventDefault();
            isDragging = true;
            mouseX = e.clientX; mouseY = e.clientY;
            
            if (!hasActivated) {
                hasActivated = true;
                container.isGlobalEffect = true; 

                splitTextByChar(container);
                const domNodes = Array.from(container.querySelectorAll('.char-particle'));
                particles = domNodes.map(node => {
                    const r = node.getBoundingClientRect();
                    return {
                        element: node, centerX: r.left + r.width / 2, centerY: r.top + r.height / 2,
                        width: r.width, height: r.height, isBroken: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, 
                        floorLimit: window.innerHeight - (Math.random() * 60) 
                    };
                });

                image.parentNode.insertBefore(placeholder, image);
                image.classList.add('is-wrecking-ball');
                image.style.left = '0px'; image.style.top = '0px';
                image.style.width = rect.width + 'px'; image.style.height = rect.height + 'px';
                Body.setStatic(ballBody, false);
            }
        });
        document.addEventListener('mouseup', () => { isDragging = false; });
        
        let isRunning = true;
        Events.on(engine, 'beforeUpdate', () => {
            if (!isRunning) return;
            if (ballBody) {
                if (isDragging) {
                    const clampX = Math.max(radius, Math.min(window.innerWidth - radius, mouseX));
                    const clampY = Math.max(radius, Math.min(window.innerHeight - radius, mouseY));
                    Body.setPosition(ballBody, { x: clampX, y: clampY });
                    Body.setVelocity(ballBody, { x: 0, y: 0 }); Body.setAngularVelocity(ballBody, 0);
                }
                velX = ballBody.position.x - lastX; velY = ballBody.position.y - lastY;
                lastX = ballBody.position.x; lastY = ballBody.position.y;
            }
            if (hasActivated && ballBody) {
                const ballX = ballBody.position.x, ballY = ballBody.position.y, rSq = (radius * 1.05) ** 2;
                particles.forEach(p => {
                    let pAbsX = p.centerX + p.x, pAbsY = p.centerY + p.y;
                    const dx = pAbsX - ballX, dy = pAbsY - ballY, distSq = dx*dx + dy*dy;
                    if (distSq < rSq) {
                        if (!p.isBroken) {
                            p.isBroken = true;
                            const ghost = p.element.cloneNode(true);
                            ghost.style.visibility = 'hidden'; ghost.style.pointerEvents = 'none';
                            p.element.parentNode.insertBefore(ghost, p.element);
                            p.element.style.position = 'fixed'; 
                            p.element.style.margin = 0; p.element.style.pointerEvents = 'none'; p.element.style.zIndex = 5;
                            p.element.style.left = '0px'; p.element.style.top = '0px';
                        }
                        const dist = Math.sqrt(distSq), overlap = radius - dist;
                        if (overlap > 0 && dist > 0) {
                            p.x += (dx/dist) * overlap; p.y += (dy/dist) * overlap;
                            p.vx += velX * 0.3; p.vy += velY * 0.3;
                        }
                    }
                    if (p.isBroken) {
                        p.vy += 0.8; p.vx *= 0.98;
                        p.x += p.vx; p.y += p.vy; p.rot += p.vx * 2;
                        let currentBottom = p.centerY + p.y + (p.height/2);
                        if (currentBottom > p.floorLimit) {
                            p.y -= (currentBottom - p.floorLimit);
                            p.vy *= -0.5; p.vx *= 0.6; p.rot *= 0.5;
                            if (Math.abs(p.vy) < 1) p.vy = 0;
                        }
                        p.element.style.transform = `translate(${p.centerX - p.width/2 + p.x}px, ${p.centerY - p.height/2 + p.y}px) rotate(${p.rot}deg)`;
                    }
                });
            }
        });
        Events.on(engine, 'afterUpdate', () => {
            if (!isRunning) return;
            if (!ballBody.isStatic) {
                image.style.transform = `translate3d(${ballBody.position.x - image.offsetWidth/2}px, ${ballBody.position.y - image.offsetHeight/2}px, 0) rotate(${ballBody.angle}rad)`;
            }
        });
        container.pauseEffect = () => { isRunning = false; Runner.stop(runner); };
        container.resumeEffect = () => { isRunning = true; Runner.run(runner, engine); };
    }
}
// =========================================================
// EFFECT 4: ART (Spectacular 3D Liquid Spectrum)
// =========================================================
function initArtEffect(container) {
    splitTextByChar(container);
    const spans = container.querySelectorAll('.char-particle');
    let mouse = { x: -1000, y: -1000 };
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    
    // --- COLOR PALETTE: Deep Blues, Magentas, and Gold ---
    const palette = [
        { h: 220, s: 80, l: 60 }, // Deep Blue
        { h: 280, s: 70, l: 50 }, // Purple
        { h: 330, s: 90, l: 60 }, // Hot Pink
        { h: 45, s: 90, l: 50 }   // Gold
    ];

    const letters = [];
    spans.forEach((span, i) => {
        span.style.display = 'inline-block'; 
        span.style.transformOrigin = 'center center';
        span.style.position = 'relative'; 
        span.style.willChange = 'transform, color, filter'; 
        
        // Randomly assign a "hero" status to some letters for extra size
        const isGiant = Math.random() > 0.92; 
        const baseColor = palette[i % palette.length];

        letters.push({
            element: span, 
            index: i, 
            noiseOffset: Math.random() * 100, 
            sensitivity: 0.7 + Math.random() * 0.6,
            maxScale: isGiant ? 6.0 : 3.2, 
            maxZ: isGiant ? 200 : 100, // Move toward camera
            scale: 1, 
            z: 0,
            angle: 0, 
            color: { ...baseColor },
            targetColor: { ...baseColor }
        });
    });

    let animationId;
    let isRunning = true;

    function animate() {
        if (!isRunning) return;
        const entry = container.closest('.index-entry');
        const isActive = entry && entry.classList.contains('effect-active');
        const time = Date.now() / 1000;
        
        letters.forEach((letter) => {
            if (!isActive) {
                letter.targetScale = 1; 
                letter.targetZ = 0;
                letter.targetAngle = 0;
                // Reset to original palette color
                const base = palette[letter.index % palette.length];
                letter.targetColor = { ...base };
            } else {
                const rect = letter.element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2; 
                const centerY = rect.top + rect.height / 2;
                const dx = mouse.x - centerX; 
                const dy = mouse.y - centerY; 
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const radius = 220 * letter.sensitivity;

                if (dist < radius) {
                    let intensity = 1 - (dist / radius); 
                    intensity = Math.pow(intensity, 1.5); // Snappier falloff
                    
                    const noise = Math.sin(time * 2 + letter.noiseOffset);
                    
                    letter.targetScale = 1 + (intensity * (letter.maxScale - 1));
                    letter.targetZ = intensity * letter.maxZ;
                    letter.targetAngle = (dx / radius) * 35 + (noise * 10);
                    
                    // CYCLING GRADIENT EFFECT
                    const hueShift = (time * 50 + letter.index * 5) % 360;
                    letter.targetColor = { h: hueShift, s: 90, l: 70 };
                    
                    letter.element.style.zIndex = Math.floor(100 + intensity * 1000);
                    letter.element.style.filter = `blur(${Math.max(0, (1-intensity) * 2)}px) brightness(${1 + intensity})`;
                } else {
                    letter.targetScale = 1; 
                    letter.targetZ = 0;
                    letter.targetAngle = 0;
                    const base = palette[letter.index % palette.length];
                    letter.targetColor = { ...base };
                    letter.element.style.zIndex = 10;
                    letter.element.style.filter = 'none';
                }
            }

            // --- SMOOTH LERPING ---
            const ease = 0.12; 
            letter.scale += (letter.targetScale - letter.scale) * ease;
            letter.z += (letter.targetZ - letter.z) * ease;
            letter.angle += (letter.targetAngle - letter.angle) * ease;
            
            // Color Lerp
            letter.color.h += (letter.targetColor.h - letter.color.h) * ease;
            letter.color.s += (letter.targetColor.s - letter.color.s) * ease;
            letter.color.l += (letter.targetColor.l - letter.color.l) * ease;

            // Apply 3D Transform
            letter.element.style.transform = `
                translate3d(0, 0, ${letter.z}px) 
                scale(${letter.scale}) 
                rotate(${letter.angle}deg)
            `;
            letter.element.style.color = `hsl(${letter.color.h}, ${letter.color.s}%, ${letter.color.l}%)`;
        });
        animationId = requestAnimationFrame(animate);
    }
    animate();

    container.pauseEffect = () => { isRunning = false; cancelAnimationFrame(animationId); };
    container.resumeEffect = () => { if(!isRunning){ isRunning = true; animate(); }};
}

// =========================================================
// EFFECT 5: CIGARETTE SMOKE (Motion Only / Drag Only)
// =========================================================
function initCigaretteSmoke(container) {
    // 1. Prepare the text
    splitTextByChar(container);
    const chars = Array.from(container.querySelectorAll('.char-particle'));
    
    // 2. Physics State Map
    const physicsState = new Map();
    chars.forEach(char => {
        // FORCE VISIBILITY & STYLING
        char.style.position = 'relative';
        char.style.display = 'inline-block';
        // Ensure it sits above overlays
        char.style.zIndex = '10000000'; 
        char.style.willChange = 'transform';
        char.style.transformOrigin = 'center bottom'; 
        
        physicsState.set(char, { 
            x: 0, y: 0,  
            vx: 0, vy: 0 
        });
    });

    // 3. Mouse Interaction State
    let mouse = { x: -500, y: -500, lastX: -500, lastY: -500, isDown: false };

    const onMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    const onDown = () => { mouse.isDown = true; };
    const onUp = () => { mouse.isDown = false; };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    let isRunning = true;

    function animate() {
        if (!isRunning) return;
        
        // Only run if God Mode is active
        if (!document.body.classList.contains('phase-active')) {
            requestAnimationFrame(animate);
            return;
        }

        // Calculate Mouse Velocity (Wind Speed)
        let dragVx = (mouse.x - mouse.lastX);
        let dragVy = (mouse.y - mouse.lastY);
        
        // Clamp velocity to prevent crazy explosions
        dragVx = Math.max(-60, Math.min(60, dragVx));
        dragVy = Math.max(-60, Math.min(60, dragVy));

        chars.forEach((char) => {
            const state = physicsState.get(char);
            
            // --- 1. INTERACTION (Only happens when dragging) ---
            if (mouse.isDown) {
                const rect = char.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const dx = mouse.x - centerX;
                const dy = mouse.y - centerY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Interaction Radius
                const radius = 200; 
                
                if (dist < radius) {
                    // Calculate force (stronger closer to mouse)
                    const force = (1 - dist / radius);
                    
                    // Apply Drag Force (Wind)
                    state.vx += dragVx * force * 0.5;
                    state.vy += dragVy * force * 0.5;
                    
                    // Add slight "Displacement" (Push away from cursor path)
                    state.vx -= (dx / dist) * force * 2;
                    state.vy -= (dy / dist) * force * 2;
                }
            }

            // --- 2. PHYSICS UPDATE ---
            // Apply velocity
            state.x += state.vx;
            state.y += state.vy;

            // Friction (Air resistance)
            state.vx *= 0.9; 
            state.vy *= 0.9;

            // Elasticity (Return to home)
            state.x *= 0.94;
            state.y *= 0.94;

            // --- 3. APPLY TRANSFORM ---
            const speed = Math.abs(state.vx) + Math.abs(state.vy);
            const blurAmount = Math.min(6, speed * 0.15);
            
            char.style.transform = `translate(${state.x}px, ${state.y}px)`;
            
            // Only apply blur if moving significantly
            if (blurAmount > 0.5) {
                char.style.filter = `blur(${blurAmount}px)`;
            } else {
                char.style.filter = 'none';
            }
        });

        // Update mouse delta
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;

        requestAnimationFrame(animate);
    }
    
    animate();

    container.pauseEffect = () => { isRunning = false; };
    container.resumeEffect = () => { if(!isRunning){ isRunning = true; animate(); }};
}

// =========================================================
// EFFECT: VIOLENT REPULSION (Toilet Paper)
// =========================================================
function initStickyTrap(container) {
    // NO PHYSICS ENGINE - Just visual state like garlic bread
    
    splitTextByWord(container);
    const domNodes = container.querySelectorAll('.word-particle');
    const visualState = new Map();
    
    // Initialize visual state for each word
    domNodes.forEach(node => visualState.set(node, { x: 0, y: 0, vx: 0, vy: 0 }));

    // Mouse tracking
    let mouse = { x: 0, y: 0, vx: 0, vy: 0 };
    let lastMouse = { x: 0, y: 0 };
    
    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX; 
        mouse.y = e.clientY;
        mouse.vx = e.clientX - lastMouse.x; 
        mouse.vy = e.clientY - lastMouse.y;
        lastMouse.x = e.clientX; 
        lastMouse.y = e.clientY;
    });

    let animationFrameId;
    let isRunning = true;

    function updateVisuals() {
        if (!isRunning) return;
        if (!container.closest('.index-entry').classList.contains('effect-active')) {
            animationFrameId = requestAnimationFrame(updateVisuals);
            return; 
        }

        // Physics parameters - VIOLENT VERSION
        const repulsionRadius = 200;      // Larger affected area
        const repulsionStrength = 3.5;    // MUCH STRONGER (was 0.8)
        const springStiffness = 0.05;     // Slower return for dramatic effect
        const friction = 0.94;            // Less friction = more flying
        const rippleForce = 1.5;          // MASSIVE push when cursor moves fast (was 0.25)
        
        const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        
        domNodes.forEach(span => {
            const state = visualState.get(span);
            const rect = span.getBoundingClientRect();
            const pX = rect.left + rect.width / 2;
            const pY = rect.top + rect.height / 2;
            
            // Calculate direction FROM cursor TO word (repulsion)
            const dx = pX - mouse.x;
            const dy = pY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // VIOLENT REPULSION: Launch words into the air
            if (dist < repulsionRadius && dist > 0) {
                const proximity = (repulsionRadius - dist) / repulsionRadius;
                const normalizedDx = dx / dist;
                const normalizedDy = dy / dist;
                
                if (mouseSpeed > 5) {
                    // Fast cursor = EXPLOSIVE launch
                    const explosionForce = rippleForce * proximity * proximity;
                    state.vx += normalizedDx * explosionForce;
                    state.vy += normalizedDy * explosionForce;
                } else {
                    // Even slow cursor = strong repulsion
                    const pushForce = repulsionStrength * proximity * proximity;
                    state.vx += normalizedDx * pushForce;
                    state.vy += normalizedDy * pushForce;
                }
            }
            
            // SPRING: Pull back to home position
            state.vx += -state.x * springStiffness;
            state.vy += -state.y * springStiffness;
            
            // FRICTION: Less damping = more flying
            state.vx *= friction;
            state.vy *= friction;
            
            // UPDATE POSITION
            state.x += state.vx;
            state.y += state.vy;
            
            // Snap to home if very close
            if (Math.abs(state.x) < 0.1 && Math.abs(state.y) < 0.1) {
                if (state.x !== 0) {
                    state.x = 0;
                    state.y = 0;
                    span.style.transform = 'none';
                }
            } else {
                span.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
            }
        });
        
        animationFrameId = requestAnimationFrame(updateVisuals);
    }
    updateVisuals();

    container.pauseEffect = () => { 
        isRunning = false; 
        cancelAnimationFrame(animationFrameId); 
    };
    
    container.resumeEffect = () => { 
        if (!isRunning) { 
            isRunning = true; 
            updateVisuals(); 
        }
    };
}

// =========================================================
// EFFECT: WIFE (Collecting & Shake to Release)
// =========================================================
function initWifeEffect(container) {
    splitTextByWord(container);
    const words = Array.from(container.querySelectorAll('.word-particle'));
    
    // Track which words are attached to cursor
    const attachedWords = new Set();
    let mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vx: 0, vy: 0 };
    
    // Store original positions for each word
    words.forEach(word => {
        const rect = word.getBoundingClientRect();
        word.dataset.originalX = rect.left + rect.width / 2;
        word.dataset.originalY = rect.top + rect.height / 2;
        word.style.cursor = 'pointer';
        word.style.transition = 'transform 0.1s ease-out';
    });
    
    // Track mouse position and velocity
    document.addEventListener('mousemove', (e) => {
        if (!document.body.classList.contains('phase-active')) return;
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.vx = mouse.x - mouse.prevX;
        mouse.vy = mouse.y - mouse.prevY;
    });
    
    // Click on word to attach/detach it from cursor
    words.forEach(word => {
        word.addEventListener('click', (e) => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            
            e.stopPropagation(); // Prevent triggering article click
            
            if (attachedWords.has(word)) {
                // Already attached - detach it
                attachedWords.delete(word);
                word.style.transition = 'transform 0.3s ease-out';
            } else {
                // Attach word to cursor
                attachedWords.add(word);
                
                // Convert to fixed positioning
                const rect = word.getBoundingClientRect();
                word.style.position = 'fixed';
                word.style.left = '0';
                word.style.top = '0';
                word.style.width = rect.width + 'px';
                word.style.height = rect.height + 'px';
                word.style.zIndex = '10000';
                word.style.transition = 'none';
                
                // Store offset from cursor
                word.dataset.offsetX = rect.left + rect.width / 2 - mouse.x;
                word.dataset.offsetY = rect.top + rect.height / 2 - mouse.y;
            }
        });
    });
    
    // Animation loop
    let isRunning = true;
    let animationFrameId;
    const SHAKE_THRESHOLD = 15; // Pixels per frame to trigger release
    
    function updatePositions() {
        if (!isRunning) return;
        if (!container.closest('.index-entry').classList.contains('effect-active')) {
            animationFrameId = requestAnimationFrame(updatePositions);
            return;
        }
        
        // Calculate shake intensity
        const shakeSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        
        // If shaking rapidly, release all words with velocity
        if (shakeSpeed > SHAKE_THRESHOLD && attachedWords.size > 0) {
            attachedWords.forEach(word => {
                // Give the word initial velocity based on shake
                word.dataset.flyVx = mouse.vx * 1.5;
                word.dataset.flyVy = mouse.vy * 1.5;
                word.dataset.isFlying = 'true';
                word.style.transition = 'none';
            });
            attachedWords.clear();
        }
        
        // Update positions of attached words (follow cursor)
        attachedWords.forEach(word => {
            const offsetX = parseFloat(word.dataset.offsetX);
            const offsetY = parseFloat(word.dataset.offsetY);
            
            const targetX = mouse.x + offsetX;
            const targetY = mouse.y + offsetY;
            
            word.style.transform = `translate(${targetX - word.offsetWidth / 2}px, ${targetY - word.offsetHeight / 2}px)`;
        });
        
        // Update flying words
        words.forEach(word => {
            if (word.dataset.isFlying === 'true') {
                let vx = parseFloat(word.dataset.flyVx) || 0;
                let vy = parseFloat(word.dataset.flyVy) || 0;
                
                // Get current position
                const transform = word.style.transform;
                let currentX = 0, currentY = 0;
                if (transform && transform !== 'none') {
                    const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
                    if (match) {
                        currentX = parseFloat(match[1]);
                        currentY = parseFloat(match[2]);
                    }
                }
                
                // Apply velocity
                currentX += vx;
                currentY += vy;
                
                // Friction and gravity
                vx *= 0.96;
                vy *= 0.96;
                vy += 0.5; // Gravity
                
                // Update position
                word.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${vx * 2}deg)`;
                
                // Store velocity
                word.dataset.flyVx = vx;
                word.dataset.flyVy = vy;
                
                // Stop flying if velocity is very low
                if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
                    word.dataset.isFlying = 'false';
                }
            }
        });
        
        animationFrameId = requestAnimationFrame(updatePositions);
    }
    updatePositions();
    
    container.pauseEffect = () => { 
        isRunning = false; 
        cancelAnimationFrame(animationFrameId); 
    };
    
    container.resumeEffect = () => { 
        if (!isRunning) { 
            isRunning = true; 
            updatePositions(); 
        }
    };
}

// =========================================================
// EFFECT: DOGS (Camera Background Photos)
// =========================================================
export function initDogsEffect(container) {
    const dogImages = container.querySelectorAll('img');
    if (dogImages.length === 0) return;
    
    let videoElement = null;
    let canvasElement = null;
    
    dogImages.forEach((img) => {
        img.style.cursor = 'pointer';
        img.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.27), filter 0.3s ease';

        img.addEventListener('mouseenter', () => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            img.style.transform = 'scale(1.08) rotate(1deg)';
            img.style.filter = 'brightness(1.1) contrast(1.1)';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1) rotate(0deg)';
            img.style.filter = 'none';
        });

        img.addEventListener('click', async (e) => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            e.stopPropagation();
            
            img.style.transform = 'scale(0.95)';
            setTimeout(() => img.style.transform = 'scale(1.08)', 100);
            
            await capturePhoto();
        });
    });
    
    async function capturePhoto() {
        try {
            let stream = window.globalCameraStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                window.globalCameraStream = stream;
            }
            
            if (!videoElement) {
                videoElement = document.createElement('video');
                videoElement.srcObject = stream;
                videoElement.autoplay = true;
                videoElement.style.display = 'none';
                document.body.appendChild(videoElement);
                canvasElement = document.createElement('canvas');
                await new Promise(res => videoElement.onloadedmetadata = res);
            }
            
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            const ctx = canvasElement.getContext('2d');
            ctx.drawImage(videoElement, 0, 0);
            
            const imageData = canvasElement.toDataURL('image/jpeg', 0.9);
            addPhotoToBackground(imageData);
            flashScreen();
            
        } catch (error) {
            console.error('Camera capture failed:', error);
        }
    }
    
    function addPhotoToBackground(imageData) {
        // Apply to html and body
        const targets = [document.body, document.documentElement];
        targets.forEach(el => {
            el.style.setProperty('background-image', `url(${imageData})`, 'important');
            el.style.setProperty('background-size', 'cover', 'important');
            el.style.setProperty('background-position', 'center', 'important');
            el.style.setProperty('background-attachment', 'fixed', 'important');
        });

        // Make the main index persistent transparent
        const mainIndex = document.getElementById('main-index');
        if (mainIndex) {
            mainIndex.style.setProperty('background-color', 'transparent', 'important');
            // Add a class to keep it transparent even if other effects trigger
            mainIndex.classList.add('is-transparent'); 
        }
    }
    
    function flashScreen() {
        const flash = document.createElement('div');
        flash.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:999999; pointer-events:none; opacity:1; transition:opacity 0.15s;";
        document.body.appendChild(flash);
        requestAnimationFrame(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 150);
        });
    }

    container.pauseEffect = () => {
        // DO NOT reset the background-image here.
        // We only stop the video stream if needed.
        if (videoElement) {
            // Optional: You can stop the stream to save CPU, 
            // but keep the background image on the body.
        }
    };

    container.resumeEffect = () => {
        // If we have a background image already, ensure the container stays transparent
        if (document.body.style.backgroundImage) {
            const mainIndex = document.getElementById('main-index');
            if (mainIndex) mainIndex.style.setProperty('background-color', 'transparent', 'important');
        }
    };
}

// =========================================================
// EFFECT: HOT DOG (Glizzy Fountain + Emoji Morph)
// =========================================================
function initHotDogEffect(container) {
    const Engine = Matter.Engine, 
          World = Matter.World, 
          Bodies = Matter.Bodies, 
          Runner = Matter.Runner, 
          Body = Matter.Body;

    // 1. Setup local physics engine for this section
    const engine = Engine.create();
    const world = engine.world;
    const runner = Runner.create();
    
    // 2. Add physical boundaries (floor and walls)
    const ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });
    World.add(world, [ground, leftWall, rightWall]);

    // --- TEXT MORPH LOGIC ---
    splitTextByChar(container); 
    const chars = container.querySelectorAll('.char-particle');

    chars.forEach(char => {
        char.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.27)';
        
        char.addEventListener('mouseenter', () => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            
            if (!char.dataset.originalText) char.dataset.originalText = char.innerText;

            char.innerText = '🌭';
            char.style.transform = 'scale(1.5) rotate(10deg)';

            setTimeout(() => {
                char.innerText = char.dataset.originalText;
                char.style.transform = 'scale(1) rotate(0deg)';
            }, 7000);
        });
    });

    // --- GLIZZY FOUNTAIN LOGIC ---
    const hotDogImg = container.querySelector('img');
    const glizzies = [];

    if (hotDogImg) {
        hotDogImg.style.cursor = 'pointer';
        hotDogImg.addEventListener('click', (e) => {
            if (!container.closest('.index-entry').classList.contains('effect-active')) return;
            
            // Burst 25 emojis per click
            for (let i = 0; i < 25; i++) {
                createGlizzy(e.clientX, e.clientY);
            }
        });
    }

    function createGlizzy(x, y) {
        const glizzy = document.createElement('div');
        glizzy.innerText = '🌭';
        glizzy.style.cssText = `
            position: fixed; left: 0; top: 0; font-size: 50px;
            user-select: none; pointer-events: none; z-index: 10000;
            will-change: transform;
        `;
        document.body.appendChild(glizzy);

        // Create a rectangular physical body for the emoji
        const body = Bodies.rectangle(x, y, 40, 20, {
            restitution: 0.8, // Bouncy
            friction: 0.1,
            angle: Math.random() * Math.PI
        });

        // Apply a violent upward and outward "burst" force
        const forceMagnitude = 0.06 * body.mass;
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * forceMagnitude,
            y: (Math.random() * -forceMagnitude * 3) // Strong upward push
        });

        World.add(world, body);
        glizzies.push({ element: glizzy, body: body });
    }

    let animationId;
    function update() {
        Engine.update(engine);
        
        glizzies.forEach((g, index) => {
            const { position, angle } = g.body;
            // Use translate3d for smooth GPU movement
            g.element.style.transform = `translate3d(${position.x - 25}px, ${position.y - 25}px, 0) rotate(${angle}rad)`;
            
            // Cleanup emojis that fall off the screen
            if (position.y > window.innerHeight + 100) {
                g.element.remove();
                World.remove(world, g.body);
                glizzies.splice(index, 1);
            }
        });

        animationId = requestAnimationFrame(update);
    }

    container.pauseEffect = () => {
        Runner.stop(runner);
        cancelAnimationFrame(animationId);
        glizzies.forEach(g => g.element.remove());
    };

    container.resumeEffect = () => {
        Runner.run(runner, engine);
        update();
    };
}