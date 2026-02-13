import { init3DTitles } from './titles3d.js';
import { initGodMode } from './godmode.js';

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // 0. CAMERA INITIALIZATION
    // =========================================================
    let globalCameraStream = null;
    
    async function initCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                globalCameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                console.log('Camera permission granted and stream active');
                window.globalCameraStream = globalCameraStream;
            } catch (err) {
                console.log('Camera permission denied:', err);
            }
        }
    }
    
    initCamera();
    
    // =========================================================
    // 1. THE TRIGGER (PHASE MANAGER)
    // =========================================================
    const triggerPhrase = document.getElementById('god-trigger'); 
    let chaosEnabled = false;

    function setSmallShift() {
        const randomDist = Math.floor(Math.random() * 15 + 10); 
        const direction = Math.random() > 0.5 ? 1 : -1;
        document.body.style.setProperty('--random-shift', (randomDist * direction) + 'vw');
    }

    if (triggerPhrase) {
        triggerPhrase.addEventListener('click', () => {
            if (chaosEnabled) return;
            chaosEnabled = true;

            const overlay = document.getElementById('transition-overlay');

            setTimeout(() => {
                setSmallShift();
                document.body.classList.add('is-shifting');
                if (overlay) overlay.classList.add('mode-flash');

                setTimeout(() => {
                    setSmallShift();
                }, 500);

                setTimeout(() => {
                    if (overlay) {
                        overlay.classList.remove('mode-flash');
                        overlay.classList.add('mode-loading');
                    }
                    document.body.classList.remove('is-shifting');

                    setTimeout(() => {
                        if (overlay) {
                            overlay.classList.remove('mode-loading');
                            overlay.style.display = 'none'; 
                        }

                        document.body.classList.remove('phase-static');
                        document.body.classList.add('phase-active');
                        
                        initGodMode();
                        init3DTitles();
                    }, 1000); 

                }, 1000);
            }, 500);
        });
    }

    // =========================================================
    // 2. OBSERVERS
    // =========================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.15 });

    const contentRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-revealed');
        });
    }, { threshold: 0.1, rootMargin: '-50px' });

    const indexEntries = document.querySelectorAll('.index-entry');

    indexEntries.forEach((entry) => {
        const textContainer = entry.querySelector('.article-content');
        const answerReveal = entry.querySelector('.answer-reveal');
        
        if (textContainer) revealObserver.observe(textContainer);
        if (answerReveal) contentRevealObserver.observe(answerReveal);
    });

    // =========================================================
    // 3. HOME BUTTON NAVIGATION & FINALE TRIGGER
    // =========================================================
    const homeButton = document.querySelector('.site-header .subtitle:first-child');

    if (homeButton) {
        homeButton.addEventListener('click', (e) => {
            if (document.body.classList.contains('phase-active')) {
                // In God Mode: Trigger the Collapse
                initFinaleCollapse(e); 
            } else {
                // In Initial State: Scroll to Top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Initialize Animations
    initTypingAnimation();
    initCutoutHoverEffect();
    initCutoutHoverEffect2();
    initCutoutHoverEffect3();
    initTypingReplacement();
});

// =========================================================
// 4. TYPING ANIMATION
// =========================================================
function initTypingAnimation() {
    const leadText = document.querySelector('.lead-text');
    if (!leadText) return;
    
    const rect = leadText.getBoundingClientRect();
    if (rect.height > 0) {
        leadText.style.height = rect.height + 'px';
        leadText.style.display = 'block'; 
    }
    
    const rawHTML = leadText.innerHTML.trim();
    const segments = rawHTML.split(/(<[^>]*>)/g).filter(s => s !== "");
    leadText.innerHTML = "";
    leadText.style.visibility = "hidden";

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    leadText.style.visibility = "visible";
                    leadText.classList.add('typing-active');
                    observer.disconnect(); 
                    typeSegments(leadText, segments, 0);
                }, 1000);
            }
        });
    }, { threshold: 0.25 }); 
    observer.observe(leadText);
}

function typeSegments(element, segments, index) {
    if (index >= segments.length) {
        setTimeout(() => { element.classList.add('typing-done'); }, 2000);
        return;
    }
    const segment = segments[index];
    if (segment.startsWith('<')) {
        element.innerHTML += segment;
        typeSegments(element, segments, index + 1);
    } else {
        let charIndex = 0;
        function typeChar() {
            if (charIndex < segment.length) {
                element.innerHTML += segment.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, 30); 
            } else {
                typeSegments(element, segments, index + 1);
            }
        }
        typeChar();
    }
}

// =========================================================
// 5. CUTOUT HOVER EFFECTS
// =========================================================
function initCutoutHoverEffect() {
    const container = document.querySelector('.lead-paragraph');
    if (!container) return;

    const HOVER_CONFIG = {
        basePath: 'assets/images/cutouts/',
        totalImages: 11,
        throttleDelay: 80,    
        minSize: 100,         
        maxSize: 100,         
        minScale: 2.5,        
        maxScale: 2.5,
        initialScale: 0,         
        endScaleMultiplier: 1, 
        minRotationStart: -10,   
        maxRotationStart: -10,
        minRotationEnd: -10,     
        maxRotationEnd: -10,      
        startShiftX: 0,       
        startShiftY: 0,       
        scatter: 40,          
        travelX: 0,           
        travelY: 0,
        driftX: 0,           
        driftY: 0,           
        popInDuration: 0.4,   
        stayDuration: 500,    
        moveDuration: 1.5,    
        fadeDuration: 0.1,    
        entryEase: 'cubic-bezier(0.175, 0.885, 0.32, 1.27)', 
        exitEase: 'ease-in'
    };
    createHoverListener(container, HOVER_CONFIG);
}

function initCutoutHoverEffect2() {
    const container = document.querySelector('.lead-paragraph2'); 
    if (!container) return;
    createHoverListener(container, {
        basePath: 'assets/images/cutouts2/', 
        fileSuffix: '_co2', 
        totalImages: 4,      
        throttleDelay: 100, 
        minSize: 100,
        maxSize: 100,
        minScale: 3,
        maxScale: 3,
        initialScale: 0, 
        endScaleMultiplier: 1.2, 
        minRotationStart: -10, 
        maxRotationStart: 10,
        popInDuration: 0.1, 
        stayDuration: 400, 
        moveDuration: 0.8, 
        fadeDuration: 0.2,    
        entryEase: 'cubic-bezier(0.175, 1.185, 0.82, 1.27)', 
        exitEase: 'ease-in',
        disableInGodMode: true
    });
}

function initCutoutHoverEffect3() {
    const container = document.querySelector('.lead-paragraph3'); 
    if (!container) return;
    createHoverListener(container, {
        basePath: 'assets/images/cutouts3/', 
        fileSuffix: '_co3', 
        totalImages: 8,                      
        throttleDelay: 60, 
        minSize: 100,
        maxSize: 100,
        minScale: 3,
        maxScale: 3,
        initialScale: 0, 
        endScaleMultiplier: 0.2, 
        minRotationStart: -10, 
        maxRotationStart: 10,
        popInDuration: 0.1, 
        stayDuration: 400, 
        moveDuration: 0.8, 
        fadeDuration: 0.2,    
        entryEase: 'cubic-bezier(0.175, 0.885, 0.32, 1.27)', 
        exitEase: 'ease-in',
        disableInGodMode: true
    });
}

function createHoverListener(container, config) {
    let lastSpawnTime = 0;
    container.addEventListener('mousemove', (e) => {
        if (config.disableInGodMode && document.body.classList.contains('phase-active')) return;

        const now = Date.now();
        if (now - lastSpawnTime < config.throttleDelay) return;
        lastSpawnTime = now;

        const img = document.createElement('img');
        const randomNum = Math.floor(Math.random() * config.totalImages) + 1;
        const suffix = config.fileSuffix || '_co'; 
        img.src = `${config.basePath}${randomNum}${suffix}.png`;
        
        const size = Math.floor(config.minSize + Math.random() * (config.maxSize - config.minSize));
        const startRot = config.minRotationStart + Math.random() * (config.maxRotationStart - config.minRotationStart);

        img.style.cssText = `
            position: fixed; 
            left: ${e.clientX}px; 
            top: ${e.clientY}px;
            width: ${size}px; 
            height: auto;
            z-index: 99999;
            pointer-events: none; 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(0) rotate(${startRot}deg);
            transition: transform ${config.popInDuration}s ${config.entryEase};
        `;

        document.body.appendChild(img);

        requestAnimationFrame(() => {
            img.style.transform = `translate(-50%, -50%) scale(${config.minScale || 1}) rotate(${startRot}deg)`;
        });

        setTimeout(() => {
            img.style.transition = `transform ${config.moveDuration}s, opacity ${config.fadeDuration}s`;
            img.style.opacity = '0'; 
            img.style.transform = `translate(-50%, -50%) scale(${(config.minScale || 1) * config.endScaleMultiplier}) rotate(${startRot + 20}deg)`; 
            setTimeout(() => img.remove(), config.moveDuration * 1000); 
        }, config.stayDuration); 
    });
}

// =========================================================
// 6. TYPING REPLACEMENT (EDIT MODE)
// =========================================================
function initTypingReplacement() {
    const leadText = document.querySelector('.lead-paragraph .lead-text');
    if (!leadText) return;

    leadText.addEventListener('click', () => {
        if (!document.body.classList.contains('phase-active')) return;

        leadText.contentEditable = true;
        leadText.focus();
        leadText.classList.remove('typing-active');
        leadText.classList.remove('typing-done');
        
        const range = document.createRange();
        range.selectNodeContents(leadText);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });

    leadText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!document.body.classList.contains('phase-active')) return;
            const newWord = leadText.innerText.trim();
            if (!newWord) return;
            leadText.contentEditable = false;
            leadText.blur();
            replaceGlobalText(newWord);
        }
    });
}

function replaceGlobalText(word) {
    const targets = document.querySelectorAll('.generaltext, .entry-title, .author-name, .subtitle, .hp-visual-element, .hp-bottom-textcontainer p');
    targets.forEach(el => {
        if (el.classList.contains('lead-text')) return;
        walkAndReplace(el, word);
    });
}

function walkAndReplace(node, word) {
    if (node.nodeType === 3) {
        const text = node.nodeValue.trim();
        if (text.length > 0) {
            const count = text.split(/\s+/).length;
            node.nodeValue = Array(count).fill(word).join(' ');
        }
    } else if (node.nodeType === 1) {
        if (node.tagName !== 'IMG' && !node.classList.contains('lead-text')) {
             node.childNodes.forEach(child => walkAndReplace(child, word));
        }
    }
}

// =========================================================
// 7. FINALE COLLAPSE (HARDWARE ACCELERATED)
// =========================================================
function initFinaleCollapse(event) {
    const allText = document.querySelectorAll('.generaltext, .entry-title, .lead-text, .author-name, .hp-visual-element, .quote-text, .subtitle');
    
    event.preventDefault();
    
    const stage = document.createElement('div');
    stage.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999999; pointer-events:none;";
    document.body.appendChild(stage);
    
    const shards = [];

    allText.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight + 500 || rect.bottom < -500) return;

        const words = el.innerText.split(/\s+/);
        const style = window.getComputedStyle(el);
        
        words.forEach((word, i) => {
            if (shards.length > 800) return; 

            const shard = document.createElement('span');
            shard.textContent = word;
            shard.style.cssText = `
                position: absolute; left: ${rect.left + (i * 15)}px; top: ${rect.top}px;
                font-family: ${style.fontFamily}; font-size: ${parseFloat(style.fontSize) * 1.5}px;
                font-weight: bold; color: ${style.color}; white-space: nowrap; will-change: transform;
            `;
            stage.appendChild(shard);
            
            const angle = Math.random() * Math.PI * 2;
            const force = 15 + Math.random() * 35;
            
            shards.push({
                el: shard, x: rect.left + (i * 15), y: rect.top,
                vx: Math.cos(angle) * force, vy: Math.sin(angle) * force - 10,
                rotation: 0, vRot: (Math.random() - 0.5) * 25
            });
        });

        el.style.opacity = '0';
    });

    let frame = 0;
    const GRAVITY = 0.6; 
    const FRICTION = 0.98; 

    function animate() {
        shards.forEach(s => {
            s.vy += GRAVITY;
            s.vx *= FRICTION;
            s.x += s.vx;
            s.y += s.vy;
            s.rotation += s.vRot;

            s.el.style.transform = `translate3d(${s.x - s.el.offsetLeft}px, ${s.y - s.el.offsetTop}px, 0) rotate(${s.rotation}deg)`;
            if (frame > 40) s.el.style.opacity = Math.max(0, 1 - (frame - 40) / 60);
        });

        frame++;
        if (frame < 120) requestAnimationFrame(animate);
        else renderWhiteout();
    }

    function renderWhiteout() {
        stage.remove();
        document.querySelectorAll('main, header, section, canvas, #uncanny-overlay, #glass-canvas-container').forEach(el => {
            el.style.display = 'none';
        });

        const finalScreen = document.createElement('div');
        finalScreen.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:#faf9f5; z-index:10000000; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 2s ease-in;";
        
        const msg = document.createElement('p');
        msg.textContent = "Well, we can't take God's place";
        msg.style.cssText = `
            font-family: "LibreBaskerville", serif;
            font-size: 2rem;
            color: #000;
            text-align: center;
        `;
        
        finalScreen.appendChild(msg);
        document.body.appendChild(finalScreen);
        requestAnimationFrame(() => finalScreen.style.opacity = "1");
    }
    animate();
}