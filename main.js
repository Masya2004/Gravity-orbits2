// Constants and settings
let G = 0.2; // Gravitational constant
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Simulation state
let objects = [];
let running = true;
let time = 0;
let lastTime = 0;
let fps = 60;
let showTrails = true;
let showGrid = false;
let showVectors = false;
let showInfo = true;
let timeScale = 1;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let selectedObject = null;
let trails = [];

// Educational variables
let currentMode = 'intro';
let currentQuizQuestion = null;
let energyHistory = [];
let distanceHistory = [];

// Visual effects
let particles = [];
let glowIntensity = 0;

// Heavenly body class
class Body {
    constructor(x, y, mass, radius, color, vx = 0, vy = 0, type = 'planet') {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.selected = false;
        this.trail = [];
        this.maxTrailLength = 2000;
        this.id = Math.random().toString(36).substr(2, 9);
        this.initialMass = mass;
        this.initialRadius = radius;
        this.glowPhase = Math.random() * Math.PI * 2;
        this.rotationAngle = 0;
        this.pulseScale = 1;
    }

    draw(ctx) {
        // Draws a fading trail
        if (showTrails && this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.6;
                ctx.strokeStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                ctx.lineWidth = 3 * (i / this.trail.length);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.trail[i].x, this.trail[i].y);
            }
        }

        // External glow
        const glowRadius = this.radius * 2;
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowRadius
        );
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(0.5, this.color + '20');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main body with improved effects
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.pulseScale, 0, 2 * Math.PI);
        
        // Gradient for stars
        if (this.type === 'star') {
            const starGradient = ctx.createRadialGradient(
                this.x - this.radius/3, this.y - this.radius/3, 0,
                this.x, this.y, this.radius * this.pulseScale
            );
            starGradient.addColorStop(0, '#fff');
            starGradient.addColorStop(0.2, '#fff8');
            starGradient.addColorStop(0.4, this.color);
            starGradient.addColorStop(0.7, '#ff8c00');
            starGradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = starGradient;
        } else {
            // Gradient for planets
            const planetGradient = ctx.createRadialGradient(
                this.x - this.radius/2, this.y - this.radius/2, 0,
                this.x, this.y, this.radius * this.pulseScale
            );
            planetGradient.addColorStop(0, this.color + 'ff');
            planetGradient.addColorStop(0.7, this.color + 'cc');
            planetGradient.addColorStop(1, this.color + '88');
            ctx.fillStyle = planetGradient;
        }
        
        ctx.fill();

        // Outline for selected objects
        if (this.selected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Pulsating outline
            const pulseAlpha = 0.5 + 0.5 * Math.sin(time * 5);
            ctx.strokeStyle = '#00d4ff' + Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Additional effects for stars
        if (this.type === 'star') {
            // Corona with animation
            const coronaRadius = this.radius * 1.8 * (1 + 0.2 * Math.sin(time * 2 + this.glowPhase));
            ctx.beginPath();
            ctx.arc(this.x, this.y, coronaRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = this.color + '30';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Rays with rotation
            this.rotationAngle += 0.02;
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI) / 6 + this.rotationAngle;
                const rayLength = this.radius + 15 + 5 * Math.sin(time * 3 + i);
                const x1 = this.x + Math.cos(angle) * this.radius;
                const y1 = this.y + Math.sin(angle) * this.radius;
                const x2 = this.x + Math.cos(angle) * rayLength;
                const y2 = this.y + Math.sin(angle) * rayLength;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = this.color + '80';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Central glow
            const coreGlow = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * 0.5
            );
            coreGlow.addColorStop(0, '#fff');
            coreGlow.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, 2 * Math.PI);
            ctx.fillStyle = coreGlow;
            ctx.fill();
        }

        // Pulse effect for all objects
        this.pulseScale = 1 + 0.05 * Math.sin(time * 2 + this.glowPhase);
    }

    updateTrail() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    // Calculates kinetic energy
    getKineticEnergy() {
        const velocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        return 0.5 * this.mass * velocity * velocity;
    }

    // Calculates potential energy relative to the central star
    getPotentialEnergy() {
        let totalPotential = 0;
        for (let other of objects) {
            if (other !== this && other.type === 'star') {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    totalPotential -= G * this.mass * other.mass / distance;
                }
            }
        }
        return totalPotential;
    }
}

// Particle class for visual effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02;
        this.color = color;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;
    }

    draw(ctx) {
        const alpha = this.life;
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Simulation functions
function reset() {
    objects = [
        new Body(500, 350, 10000, 30, '#FFD700', 0, 0, 'star'), // Sun
        new Body(700, 350, 100, 15, '#4FC3F7', 0, 3.5, 'planet'), // Earth
        new Body(800, 350, 50, 8, '#9C27B0', 0, 4.2, 'moon') // Moon
    ];
    time = 0;
    energyHistory = [];
    distanceHistory = [];
    particles = [];
    updateInfo();
}

function clear() {
    objects = [];
    time = 0;
    energyHistory = [];
    distanceHistory = [];
    particles = [];
    updateInfo();
}

function update() {
    if (!running) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    time += deltaTime * timeScale;
    
    // Updates FPS
    fps = Math.round(1 / deltaTime);
    
    // Updates glow intensity
    glowIntensity = 0.5 + 0.5 * Math.sin(time * 0.5);
    
    // Calculates gravitational forces
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        let ax = 0, ay = 0;
        
        for (let j = 0; j < objects.length; j++) {
            if (i === j) continue;
            let other = objects[j];
            
            let dx = other.x - obj.x;
            let dy = other.y - obj.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            // Minimum distance to prevent collisions
            let minDistance = obj.radius + other.radius;
            if (distance < minDistance) distance = minDistance;
            
            // Gravitational force
            let force = G * other.mass / (distance * distance);
            ax += force * dx / distance;
            ay += force * dy / distance;
        }
        
        // Updates velocity
        obj.vx += ax * deltaTime * 60 * timeScale;
        obj.vy += ay * deltaTime * 60 * timeScale;
    }
    
    // Updates positions
    for (let obj of objects) {
        if (!obj.selected) {
            obj.x += obj.vx * deltaTime * 60 * timeScale;
            obj.y += obj.vy * deltaTime * 60 * timeScale;
            obj.updateTrail();
            
            // Adds particles for stars
            if (obj.type === 'star' && Math.random() < 0.1) {
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(
                        obj.x + (Math.random() - 0.5) * obj.radius,
                        obj.y + (Math.random() - 0.5) * obj.radius,
                        obj.color
                    ));
                }
            }
        }
    }
    
    // Updates particles
    particles = particles.filter(particle => {
        particle.update();
        return !particle.isDead();
    });
    
    // Updates data history
    updateDataHistory();
    updateInfo();
}

function updateDataHistory() {
    // Calculates total system energy
    let totalEnergy = 0;
    for (let obj of objects) {
        totalEnergy += obj.getKineticEnergy() + obj.getPotentialEnergy();
    }
    
    energyHistory.push(totalEnergy);
    if (energyHistory.length > 100) energyHistory.shift();
    
    // Calculates average distance from the center
    if (objects.length > 1) {
        let centerX = 0, centerY = 0;
        for (let obj of objects) {
            centerX += obj.x;
            centerY += obj.y;
        }
        centerX /= objects.length;
        centerY /= objects.length;
        
        let avgDistance = 0;
        for (let obj of objects) {
            const dx = obj.x - centerX;
            const dy = obj.y - centerY;
            avgDistance += Math.sqrt(dx * dx + dy * dy);
        }
        avgDistance /= objects.length;
        
        distanceHistory.push(avgDistance);
        if (distanceHistory.length > 100) distanceHistory.shift();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draws star field with improved effects
    drawStarfield();
    // Draws grid (поверх звёздного фона)
    if (showGrid) {
        drawGrid();
    }
    // Draws particles
    for (let particle of particles) {
        particle.draw(ctx);
    }
    // Draws objects
    for (let obj of objects) {
        obj.draw(ctx);
    }
    // Draws force vectors
    if (showVectors) {
        drawForceVectors();
    }
    // Draws information about the selected object
    if (selectedObject && showInfo) {
        drawObjectInfo(selectedObject);
    }
    // Draws graphs
    drawGraphs();
}

function drawGrid() {
    ctx.strokeStyle = '#ffffff15';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// --- Статичный звёздный фон ---
let starfield = [];
function generateStarfield() {
    const STAR_COUNT = 300;
    starfield = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        starfield.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: (i % 7 === 0) ? 2 : 1 + (i % 3 === 0 ? 0.5 : 0),
            color: (i % 13 === 0) ? '#b5d0ff' : (i % 29 === 0) ? '#ffeebb' : '#fff',
            alpha: 0.18 + 0.5 * Math.random()
        });
    }
}
// Генерируем звёзды при запуске и при изменении размера canvas
if (typeof generateStarfield === 'function') generateStarfield();
const oldResizeCanvas = resizeCanvas;
resizeCanvas = function() {
    const rect = document.querySelector('.simulation-area').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    generateStarfield();
};

function drawStarfield() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (let i = 0; i < starfield.length; i++) {
        const s = starfield[i];
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function drawForceVectors() {
    for (let obj of objects) {
        if (obj.type === 'star') continue;
        
        let totalFx = 0, totalFy = 0;
        
        for (let other of objects) {
            if (other === obj) continue;
            
            const dx = other.x - obj.x;
            const dy = other.y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const force = G * obj.mass * other.mass / (distance * distance);
                totalFx += force * dx / distance;
                totalFy += force * dy / distance;
            }
        }
        
        // Normalizes vector for display
        const magnitude = Math.sqrt(totalFx * totalFx + totalFy * totalFy);
        if (magnitude > 0) {
            const scale = 25 / magnitude;
            const endX = obj.x + totalFx * scale;
            const endY = obj.y + totalFy * scale;
            
            // Gradient for vector
            const vectorGradient = ctx.createLinearGradient(obj.x, obj.y, endX, endY);
            vectorGradient.addColorStop(0, '#ff0000');
            vectorGradient.addColorStop(1, '#ff6666');
            
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = vectorGradient;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Arrow
            const angle = Math.atan2(endY - obj.y, endX - obj.x);
            const arrowLength = 10;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI/6), 
                      endY - arrowLength * Math.sin(angle - Math.PI/6));
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowLength * Math.cos(angle + Math.PI/6), 
                      endY - arrowLength * Math.sin(angle + Math.PI/6));
            ctx.stroke();
        }
    }
}

function drawObjectInfo(obj) {
    const info = [
        `Type: ${obj.type === 'star' ? 'Star' : obj.type === 'planet' ? 'Planet' : 'Moon'}`,
        `Mass: ${obj.mass.toFixed(0)}`,
        `Speed: ${Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy).toFixed(2)}`,
        `Position: (${obj.x.toFixed(0)}, ${obj.y.toFixed(0)})`,
        `Kinetic energy: ${obj.getKineticEnergy().toFixed(1)}`,
        `Potential energy: ${obj.getPotentialEnergy().toFixed(1)}`
    ];
    
    // Background with gradient
    const bgGradient = ctx.createLinearGradient(10, 10, 270, 150);
    bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 25, 40, 0.9)');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(10, 10, 260, info.length * 20 + 20);
    
    // Outline
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 260, info.length * 20 + 20);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Rajdhani';
    info.forEach((text, i) => {
        ctx.fillText(text, 20, 30 + i * 20);
    });
}

function drawGraphs() {
    const energyCanvas = document.getElementById('energyGraph');
    const distanceCanvas = document.getElementById('distanceGraph');
    
    if (energyCanvas && energyHistory.length > 1) {
        const energyCtx = energyCanvas.getContext('2d');
        energyCtx.clearRect(0, 0, energyCanvas.width, energyCanvas.height);
        
        // Graph background
        const bgGradient = energyCtx.createLinearGradient(0, 0, 0, energyCanvas.height);
        bgGradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
        bgGradient.addColorStop(1, 'rgba(0, 212, 255, 0.05)');
        energyCtx.fillStyle = bgGradient;
        energyCtx.fillRect(0, 0, energyCanvas.width, energyCanvas.height);
        
        // Graph line
        energyCtx.strokeStyle = '#00d4ff';
        energyCtx.lineWidth = 3;
        energyCtx.beginPath();
        
        const maxEnergy = Math.max(...energyHistory);
        const minEnergy = Math.min(...energyHistory);
        const range = maxEnergy - minEnergy || 1;
        
        energyHistory.forEach((energy, i) => {
            const x = (i / (energyHistory.length - 1)) * energyCanvas.width;
            const y = energyCanvas.height - ((energy - minEnergy) / range) * energyCanvas.height;
            
            if (i === 0) {
                energyCtx.moveTo(x, y);
            } else {
                energyCtx.lineTo(x, y);
            }
        });
        
        energyCtx.stroke();
        
        // Labels
        energyCtx.fillStyle = '#fff';
        energyCtx.font = '12px Rajdhani';
        energyCtx.fillText('System energy', 10, 20);
    }
    
    if (distanceCanvas && distanceHistory.length > 1) {
        const distanceCtx = distanceCanvas.getContext('2d');
        distanceCtx.clearRect(0, 0, distanceCanvas.width, distanceCanvas.height);
        
        // Graph background
        const bgGradient = distanceCtx.createLinearGradient(0, 0, 0, distanceCanvas.height);
        bgGradient.addColorStop(0, 'rgba(231, 76, 60, 0.1)');
        bgGradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');
        distanceCtx.fillStyle = bgGradient;
        distanceCtx.fillRect(0, 0, distanceCanvas.width, distanceCanvas.height);
        
        // Graph line
        distanceCtx.strokeStyle = '#e74c3c';
        distanceCtx.lineWidth = 3;
        distanceCtx.beginPath();
        
        const maxDist = Math.max(...distanceHistory);
        const minDist = Math.min(...distanceHistory);
        const range = maxDist - minDist || 1;
        
        distanceHistory.forEach((distance, i) => {
            const x = (i / (distanceHistory.length - 1)) * distanceCanvas.width;
            const y = distanceCanvas.height - ((distance - minDist) / range) * distanceCanvas.height;
            
            if (i === 0) {
                distanceCtx.moveTo(x, y);
            } else {
                distanceCtx.lineTo(x, y);
            }
        });
        
        distanceCtx.stroke();
        
        // Labels
        distanceCtx.fillStyle = '#fff';
        distanceCtx.font = '12px Rajdhani';
        distanceCtx.fillText('Average distance', 10, 20);
    }
}

function updateInfo() {
    document.getElementById('objectCount').textContent = objects.length;
    document.getElementById('timeDisplay').textContent = time.toFixed(1);
    document.getElementById('fpsDisplay').textContent = fps;
    
    // Calculates total system energy
    let totalEnergy = 0;
    for (let obj of objects) {
        totalEnergy += obj.getKineticEnergy() + obj.getPotentialEnergy();
    }
    document.getElementById('energyDisplay').textContent = totalEnergy.toFixed(1);
    
    // Updates information about the selected object
    if (selectedObject) {
        const detailsDiv = document.getElementById('objectDetails');
        detailsDiv.innerHTML = `
            <p><strong>Type:</strong> ${selectedObject.type === 'star' ? 'Star' : selectedObject.type === 'planet' ? 'Planet' : 'Moon'}</p>
            <p><strong>Mass:</strong> ${selectedObject.mass.toFixed(0)}</p>
            <p><strong>Speed:</strong> ${Math.sqrt(selectedObject.vx*selectedObject.vx + selectedObject.vy*selectedObject.vy).toFixed(2)}</p>
            <p><strong>Kinetic energy:</strong> ${selectedObject.getKineticEnergy().toFixed(1)}</p>
        `;
        document.getElementById('selectedObjectInfo').style.display = 'block';
    } else {
        document.getElementById('selectedObjectInfo').style.display = 'none';
    }
}

function addObject(type) {
    let mass, radius, color, vx, vy;
    // Поиск самой массивной звезды
    let star = null;
    let maxMass = -Infinity;
    for (let obj of objects) {
        if (obj.type === 'star' && obj.mass > maxMass) {
            star = obj;
            maxMass = obj.mass;
        }
    }
    let x, y;
    if (star) {
        // Добавляем справа от звезды на расстоянии 100px + радиус звезды
        const angle = Math.random() * 2 * Math.PI;
        const distance = star.radius + 100;
        x = star.x + Math.cos(angle) * distance;
        y = star.y + Math.sin(angle) * distance;
    } else {
        // Если звезды нет, добавляем в центр
        x = canvas.width / 2;
        y = canvas.height / 2;
    }
    switch (type) {
        case 'star':
            mass = 5000 + Math.random() * 10000;
            radius = 20 + Math.random() * 20;
            color = '#FFD700';
            vx = 0;
            vy = 0;
            break;
        case 'planet':
            mass = 50 + Math.random() * 200;
            radius = 8 + Math.random() * 12;
            color = ['#4FC3F7', '#4CAF50', '#FF9800', '#9C27B0'][Math.floor(Math.random() * 4)];
            vx = (Math.random() - 0.5) * 4;
            vy = (Math.random() - 0.5) * 4;
            break;
        case 'moon':
            mass = 10 + Math.random() * 30;
            radius = 4 + Math.random() * 6;
            color = '#9E9E9E';
            vx = (Math.random() - 0.5) * 6;
            vy = (Math.random() - 0.5) * 6;
            break;
        case 'asteroid':
            mass = 2 + Math.random() * 3;
            radius = 2 + Math.random() * 2;
            color = '#B0BEC5';
            vx = (Math.random() - 0.5) * 8;
            vy = (Math.random() - 0.5) * 8;
            break;
        case 'comet':
            mass = 5 + Math.random() * 10;
            radius = 3 + Math.random() * 3;
            color = '#B0E0FF';
            vx = (Math.random() - 0.5) * 12;
            vy = (Math.random() - 0.5) * 12;
            break;
    }
    objects.push(new Body(x, y, mass, radius, color, vx, vy, type));
    updateInfo();
}

// Functions for learning modes
function switchMode(mode) {
    currentMode = mode;
    
    // Updates active button
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'Mode').classList.add('active');
    
    // Shows corresponding panel
    document.querySelectorAll('.education-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(mode + 'Panel').classList.add('active');
    
    if (mode === 'quiz') {
        loadNewQuizQuestion();
    }
}

function loadNewQuizQuestion() {
    if (typeof getRandomQuizQuestion === 'function') {
        currentQuizQuestion = getRandomQuizQuestion();
        const questionDiv = document.getElementById('quizQuestion');
        
        questionDiv.innerHTML = `
            <p><strong>Question:</strong> ${currentQuizQuestion.question}</p>
            <div class="quiz-options">
                ${currentQuizQuestion.options.map((option, index) => 
                    `<button class="quiz-option" data-index="${index}">${option.text}</button>`
                ).join('')}
            </div>
        `;
        
        // Adds event listeners for answer options
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', handleQuizAnswer);
        });
    }
}

function handleQuizAnswer(event) {
    const selectedIndex = parseInt(event.target.dataset.index);
    const isCorrect = currentQuizQuestion.options[selectedIndex].correct;
    
    // Removes old classes
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('correct', 'incorrect');
    });
    
    // Adds corresponding class
    event.target.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Shows explanation
    setTimeout(() => {
        const questionDiv = document.getElementById('quizQuestion');
        questionDiv.innerHTML += `
            <div class="explanation" style="margin-top: 10px; padding: 10px; background: rgba(0, 212, 255, 0.1); border-radius: 5px;">
                <strong>Explanation:</strong> ${currentQuizQuestion.explanation}
            </div>
        `;
    }, 1000);
}

// Main loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Event handlers
document.getElementById('playPauseBtn').onclick = function() {
    running = !running;
    this.textContent = running ? '⏸️ Pause' : '▶️ Start';
};

document.getElementById('resetBtn').onclick = reset;
document.getElementById('clearBtn').onclick = clear;

document.getElementById('addStarBtn').onclick = () => addObject('star');
document.getElementById('addPlanetBtn').onclick = () => addObject('planet');
document.getElementById('addMoonBtn').onclick = () => addObject('moon');
document.getElementById('addAsteroidBtn').onclick = () => addObject('asteroid');
document.getElementById('addCometBtn').onclick = () => addObject('comet');

// Learning mode handlers
document.getElementById('introMode').onclick = () => switchMode('intro');
document.getElementById('labMode').onclick = () => switchMode('lab');
document.getElementById('quizMode').onclick = () => switchMode('quiz');

// Educational scenarios handlers
document.getElementById('earthSunBtn').onclick = () => applyPreset('earthSun');
document.getElementById('earthMoonBtn').onclick = () => applyPreset('earthMoon');
document.getElementById('solarSystemBtn').onclick = () => applyPreset('solarSystem');
document.getElementById('binaryStarBtn').onclick = () => applyPreset('binaryStar');
document.getElementById('spaceStationBtn').onclick = () => applyPreset('spaceStation');
document.getElementById('chaoticBtn').onclick = () => applyPreset('chaotic');
document.getElementById('asteroidBeltBtn').onclick = () => applyPreset('asteroidBelt');
document.getElementById('starClusterBtn').onclick = () => applyPreset('starCluster');
document.getElementById('cometBtn').onclick = () => applyPreset('comet');
document.getElementById('chaosManyBtn').onclick = () => applyPreset('chaosMany');

// Settings handlers
document.getElementById('gravitySlider').oninput = function() {
    G = parseFloat(this.value);
    document.getElementById('gravityValue').textContent = G.toFixed(2);
};

document.getElementById('timeScaleSlider').oninput = function() {
    timeScale = parseFloat(this.value);
    document.getElementById('timeScaleValue').textContent = timeScale.toFixed(1) + 'x';
};

document.getElementById('trailToggle').onchange = function() {
    showTrails = this.checked;
};

document.getElementById('gridToggle').onchange = function() {
    showGrid = this.checked;
};

document.getElementById('vectorsToggle').onchange = function() {
    showVectors = this.checked;
};

document.getElementById('infoToggle').onchange = function() {
    showInfo = this.checked;
};

// Restores drag and wheel processing for canvas to the previous state
canvas.onmousedown = function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Checks if we clicked on an object
    for (let obj of objects) {
        const dx = x - obj.x;
        const dy = y - obj.y;
        if (dx * dx + dy * dy < obj.radius * obj.radius) {
            selectedObject = obj;
            obj.selected = true;
            return;
        }
    }
    isDragging = true;
    dragStartX = x;
    dragStartY = y;
    selectedObject = null;
    objects.forEach(obj => obj.selected = false);
};

canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (isDragging) {
        offsetX += x - dragStartX;
        offsetY += y - dragStartY;
        dragStartX = x;
        dragStartY = y;
    }
};

canvas.onmouseup = function() {
    isDragging = false;
};

canvas.onwheel = function(e) {
    e.preventDefault();
    // I'm leaving only zoom with the mouse, if it was before changes, or completely removing if it wasn't.
};

// Tabs logic for horizontal interface
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
}

// Education mode tabs logic
function setupEducationTabs() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const panels = document.querySelectorAll('.education-panel');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modeBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const mode = this.id.replace('Mode','');
            document.getElementById(mode+'Panel').classList.add('active');
            if (mode === 'quiz') loadNewQuizQuestion();
        });
    });
}

function resizeCanvas() {
    const rect = document.querySelector('.simulation-area').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    generateStarfield();
}

window.addEventListener('resize', () => {
    resizeCanvas();
});

window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    setupTabs();
    setupEducationTabs();
});

// Initialization
reset();
switchMode('intro');
loop();

// --- Контекстное меню ---
const contextMenu = document.getElementById('contextMenu');
const contextTabs = contextMenu.querySelectorAll('.context-tab');
const contextContents = contextMenu.querySelectorAll('.context-content');

canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    // Активируем первую вкладку
    contextTabs.forEach(tab => tab.classList.remove('active'));
    contextTabs[0].classList.add('active');
    contextContents.forEach((c, i) => c.style.display = i === 0 ? 'block' : 'none');
});

document.addEventListener('mousedown', function(e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
    }
});

contextTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        contextTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        contextContents.forEach(c => c.style.display = 'none');
        document.getElementById('context' + this.dataset.tab.charAt(0).toUpperCase() + this.dataset.tab.slice(1)).style.display = 'block';
    });
});

contextMenu.querySelectorAll('.context-action').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.dataset.action;
        contextMenu.style.display = 'none';
        // Действия для Add Objects
        if (action === 'addStar') addObject('star');
        if (action === 'addPlanet') addObject('planet');
        if (action === 'addMoon') addObject('moon');
        if (action === 'addAsteroid') addObject('asteroid');
        if (action === 'addComet') addObject('comet');
        // Действия для Scenarios
        if (['earthSun','earthMoon','solarSystem','binaryStar','spaceStation','chaotic','asteroidBelt','starCluster','comet','chaosMany'].includes(action)) applyPreset(action);
        // Действия для Settings
        if (action === 'toggleTrails') { showTrails = !showTrails; document.getElementById('trailToggle').checked = showTrails; }
        if (action === 'toggleGrid') { showGrid = !showGrid; document.getElementById('gridToggle').checked = showGrid; }
        if (action === 'toggleVectors') { showVectors = !showVectors; document.getElementById('vectorsToggle').checked = showVectors; }
        if (action === 'toggleInfo') { showInfo = !showInfo; document.getElementById('infoToggle').checked = showInfo; }
        if (action === 'reset') reset();
        if (action === 'clear') clear();
    });
});

// --- Логика для help-btn и help-text ---
const helpBtn = document.getElementById('helpBtn');
const helpText = document.getElementById('helpText');
helpBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    helpText.style.display = (helpText.style.display === 'none' || helpText.style.display === '') ? 'block' : 'none';
});
document.addEventListener('mousedown', function(e) {
    if (helpText.style.display === 'block' && !helpText.contains(e.target) && e.target !== helpBtn) {
        helpText.style.display = 'none';
    }
});