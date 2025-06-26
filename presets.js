// Educational scenarios for simulating gravity and orbits
const presets = {
    // Earth and Sun (realistic proportions)
    earthSun: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 20000, 40, '#FFD700', 0, 0, 'star'), // Sun
            new Body(cx + 300, cy, 150, 12, '#4FC3F7', 0, 4.5, 'planet'), // Earth
        ];
    },

    // Earth and Moon (system with tides)
    earthMoon: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 15000, 35, '#FFD700', 0, 0, 'star'), // Sun
            new Body(cx + 200, cy, 120, 15, '#4FC3F7', 0, 4.0, 'planet'), // Earth
            new Body(cx + 250, cy, 20, 6, '#9E9E9E', 0, 5.5, 'moon'), // Moon
        ];
    },

    // Solar system (simplified)
    solarSystem: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 20000, 40, '#FFD700', 0, 0, 'star'), // Sun
            new Body(cx + 150, cy, 80, 8, '#FF9800', 0, 5.2, 'planet'), // Mercury
            new Body(cx + 250, cy, 120, 10, '#4CAF50', 0, 4.8, 'planet'), // Venus
            new Body(cx + 350, cy, 150, 12, '#4FC3F7', 0, 4.2, 'planet'), // Earth
            new Body(cx + 450, cy, 100, 10, '#FF5722', 0, 3.8, 'planet'), // Mars
            new Body(cx + 600, cy, 300, 18, '#FF9800', 0, 3.2, 'planet'), // Jupiter
        ];
    },

    // Binary star system
    binaryStar: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx - 100, cy, 12000, 30, '#FFD700', 0, 0, 'star'), // Star 1
            new Body(cx + 100, cy, 10000, 25, '#FF6B35', 0, 0, 'star'), // Star 2
            new Body(cx, cy - 150, 80, 10, '#4FC3F7', 3.5, 0, 'planet'), // Planet
        ];
    },

    // Space station
    spaceStation: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 15000, 35, '#FFD700', 0, 0, 'star'), // Star
            new Body(cx + 300, cy, 120, 15, '#4FC3F7', 0, 4.0, 'planet'), // Planet
            new Body(cx + 350, cy, 8, 4, '#9C27B0', 0, 6.0, 'moon'), // Satellite 1
            new Body(cx + 400, cy, 8, 4, '#FF5722', 0, 5.5, 'moon'), // Satellite 2
            new Body(cx + 450, cy, 8, 4, '#8BC34A', 0, 5.0, 'moon'), // Satellite 3
        ];
    },

    // Chaotic system (for studying instability)
    chaotic: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bodies = [];
        // Central star
        bodies.push(new Body(cx, cy, 25000, 45, '#FFD700', 0, 0, 'star'));
        // Set of planets with random parameters
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const distance = 150 + Math.random() * 200;
            const x = cx + Math.cos(angle) * distance;
            const y = cy + Math.sin(angle) * distance;
            const speed = 2 + Math.random() * 4;
            const vx = -Math.sin(angle) * speed;
            const vy = Math.cos(angle) * speed;
            const colors = ['#4FC3F7', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
            const color = colors[i % colors.length];
            bodies.push(new Body(x, y, 60 + Math.random() * 120, 8 + Math.random() * 8, color, vx, vy, 'planet'));
        }
        return bodies;
    },

    // Stable orbital system (for studying equilibrium)
    stableOrbits: () => {
        return [
            new Body(500, 350, 25000, 45, '#FFD700', 0, 0, 'star'), // Central star
            new Body(650, 350, 180, 12, '#4FC3F7', 0, 6.0, 'planet'), // Inner planet
            new Body(800, 350, 220, 15, '#4CAF50', 0, 5.2, 'planet'), // Middle planet
            new Body(950, 350, 200, 14, '#FF9800', 0, 4.5, 'planet'), // Outer planet
        ];
    },

    // System with rings (like Saturn's)
    ringedSystem: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bodies = [];
        
        // Central star
        bodies.push(new Body(cx, cy, 20000, 40, '#FFD700', 0, 0, 'star'));
        
        // Planet with rings (simulating multiple satellites)
        bodies.push(new Body(cx + 250, cy, 350, 22, '#4CAF50', 0, 4.5, 'planet'));
        
        // Rings (set of small objects)
        for (let i = 0; i < 25; i++) {
            const angle = (i * Math.PI * 2) / 25;
            const distance = 25 + Math.random() * 20;
            const x = cx + 250 + Math.cos(angle) * distance;
            const y = cy + Math.sin(angle) * distance;
            const speed = 6 + Math.random() * 2;
            const vx = -Math.sin(angle) * speed;
            const vy = Math.cos(angle) * speed;
            
            bodies.push(new Body(x, y, 3, 2, '#9E9E9E', vx, vy, 'moon'));
        }
        
        return bodies;
    },

    // Mass experiment
    massExperiment: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 15000, 35, '#FFD700', 0, 0, 'star'), // Star
            new Body(cx + 200, cy, 50, 8, '#4FC3F7', 0, 4.5, 'planet'), // Light planet
            new Body(cx + 300, cy, 200, 15, '#FF9800', 0, 4.0, 'planet'), // Heavy planet
            new Body(cx + 400, cy, 100, 12, '#9C27B0', 0, 3.5, 'planet'), // Middle planet
        ];
    },

    // Distance experiment
    distanceExperiment: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 20000, 40, '#FFD700', 0, 0, 'star'), // Star
            new Body(cx + 100, cy, 100, 10, '#4FC3F7', 0, 5.5, 'planet'), // Near planet
            new Body(cx + 300, cy, 100, 10, '#4CAF50', 0, 4.0, 'planet'), // Middle planet
            new Body(cx + 500, cy, 100, 10, '#FF9800', 0, 3.0, 'planet'), // Far planet
        ];
    },

    // System with eccentric orbits
    eccentricOrbits: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return [
            new Body(cx, cy, 18000, 38, '#FFD700', 0, 0, 'star'), // Star
            new Body(cx - 100, cy, 120, 12, '#4FC3F7', 0, 6.0, 'planet'), // Eccentric orbit 1
            new Body(cx + 100, cy, 120, 12, '#4CAF50', 0, 4.5, 'planet'), // Eccentric orbit 2
            new Body(cx + 200, cy - 100, 120, 12, '#FF9800', 3.0, 4.0, 'planet'), // Inclined orbit
        ];
    },

    // Asteroid belt system
    asteroidBelt: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bodies = [];
        bodies.push(new Body(cx, cy, 20000, 40, '#FFD700', 0, 0, 'star'));
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = 400 + Math.random() * 80;
            const x = cx + Math.cos(angle) * distance;
            const y = cy + Math.sin(angle) * distance;
            const speed = 2.5 + Math.random() * 1.5;
            const vx = -Math.sin(angle) * speed;
            const vy = Math.cos(angle) * speed;
            bodies.push(new Body(x, y, 2 + Math.random() * 3, 2 + Math.random() * 2, '#B0BEC5', vx, vy, 'asteroid'));
        }
        bodies.push(new Body(cx + 250, cy, 120, 14, '#4FC3F7', 0, 4.2, 'planet'));
        return bodies;
    },

    // Star cluster
    starCluster: () => {
        const bodies = [];
        for (let i = 0; i < 7; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const dist = 200 + Math.random() * 120;
            const cx = canvas.width / 2 + Math.cos(angle) * dist;
            const cy = canvas.height / 2 + Math.sin(angle) * dist;
            bodies.push(new Body(cx, cy, 8000 + Math.random() * 8000, 20 + Math.random() * 15, '#FFD700', 0, 0, 'star'));
        }
        for (let i = 0; i < 10; i++) {
            const star = bodies[Math.floor(Math.random() * bodies.length)];
            const angle = Math.random() * 2 * Math.PI;
            const distance = 60 + Math.random() * 120;
            const x = star.x + Math.cos(angle) * distance;
            const y = star.y + Math.sin(angle) * distance;
            const speed = 2 + Math.random() * 2;
            const vx = -Math.sin(angle) * speed;
            const vy = Math.cos(angle) * speed;
            const colors = ['#4FC3F7', '#4CAF50', '#FF9800', '#9C27B0'];
            const color = colors[i % colors.length];
            bodies.push(new Body(x, y, 30 + Math.random() * 60, 6 + Math.random() * 6, color, vx, vy, 'planet'));
        }
        return bodies;
    },

    // Comet flyby
    comet: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bodies = [];
        bodies.push(new Body(cx, cy, 20000, 40, '#FFD700', 0, 0, 'star'));
        bodies.push(new Body(cx + 300, cy, 120, 14, '#4FC3F7', 0, 4.2, 'planet'));
        bodies.push(new Body(cx - 600, cy - 400, 8, 4, '#B0E0FF', 7, 5, 'comet'));
        return bodies;
    },

    // Chaotic many-body system
    chaosMany: () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bodies = [];
        bodies.push(new Body(cx, cy, 25000, 45, '#FFD700', 0, 0, 'star'));
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = 120 + Math.random() * 500;
            const x = cx + Math.cos(angle) * distance;
            const y = cy + Math.sin(angle) * distance;
            const speed = 1 + Math.random() * 5;
            const vx = -Math.sin(angle) * speed;
            const vy = Math.cos(angle) * speed;
            const colors = ['#4FC3F7', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
            const color = colors[i % colors.length];
            bodies.push(new Body(x, y, 10 + Math.random() * 100, 4 + Math.random() * 10, color, vx, vy, 'planet'));
        }
        return bodies;
    },
};

// Educational questions for the quiz
const quizQuestions = [
    {
        question: "What will happen if you increase the mass of the central star?",
        options: [
            { text: "Orbits will become faster", correct: true },
            { text: "Orbits will become slower", correct: false },
            { text: "Nothing will change", correct: false }
        ],
        explanation: "According to the law of universal gravitation, the gravitational force is directly proportional to mass. More mass = more force = faster orbits."
    },
    {
        question: "How does distance affect gravitational force?",
        options: [
            { text: "Force increases with distance", correct: false },
            { text: "Force decreases with the square of distance", correct: true },
            { text: "Distance does not affect force", correct: false }
        ],
        explanation: "The law of universal gravitation: F = G × (m₁ × m₂) / r². Force is inversely proportional to the square of distance."
    },
    {
        question: "What is orbital speed?",
        options: [
            { text: "Speed of planet rotation around its axis", correct: false },
            { text: "Speed of planet movement along its orbit", correct: true },
            { text: "Speed of light in space", correct: false }
        ],
        explanation: "Orbital speed is the speed at which a celestial body moves along its orbit around another body."
    },
    {
        question: "Why don't planets fall into the star?",
        options: [
            { text: "Due to centrifugal force", correct: false },
            { text: "Due to balance between gravity and inertia", correct: true },
            { text: "Due to magnetic field", correct: false }
        ],
        explanation: "Planets move along orbits due to the balance between gravitational attraction and inertial motion."
    },
    {
        question: "What will happen to the orbit if you increase the speed of the planet?",
        options: [
            { text: "Orbit will become more elongated", correct: true },
            { text: "Orbit will become more circular", correct: false },
            { text: "Planet will fall into the star", correct: false }
        ],
        explanation: "When the speed of a planet increases, it may move to a more elongated (elliptical) orbit or even leave the system."
    }
];

// Function to apply preset
function applyPreset(presetName) {
    if (presets[presetName]) {
        objects = presets[presetName]();
        time = 0;
        updateInfo();
        
        // Remove selection from all objects
        objects.forEach(obj => obj.selected = false);
        selectedObject = null;
        
        // Show educational information
        showEducationalInfo(presetName);
    }
}

// Function to show educational information
function showEducationalInfo(presetName) {
    const info = {
        earthSun: "Study the interaction between Earth and Sun. Pay attention to the stability of the orbit.",
        earthMoon: "Observe the Earth-Moon system. The Moon affects tides and high tides on Earth.",
        solarSystem: "Simplified model of the Solar System. Planets move at different speeds.",
        binaryStar: "Binary star system. Two stars rotate around the common center of mass.",
        spaceStation: "Model of a space station with multiple satellites.",
        chaotic: "Chaotic system shows instability in gravitational systems.",
        stableOrbits: "Stable system with well-balanced orbits.",
        ringedSystem: "System with rings, like Saturn's. Rings consist of multiple particles.",
        massExperiment: "Mass experiment. Observe the effect of mass on orbits.",
        distanceExperiment: "Distance experiment. Study the effect of distance on orbital speed.",
        eccentricOrbits: "System with eccentric orbits. Shows variety of orbital forms.",
        asteroidBelt: "Asteroid belt system. Contains numerous small celestial bodies.",
        starCluster: "Star cluster system. Contains multiple stars and planets.",
        comet: "Comet flyby. Observe the interaction between a comet and a planet.",
        chaosMany: "Chaotic many-body system. Shows instability in gravitational systems."
    };
    
    if (info[presetName]) {
        // You can add a pop-up or update information panel
        console.log("Educational information:", info[presetName]);
    }
}

// Function to get a random quiz question
function getRandomQuizQuestion() {
    return quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { presets, applyPreset, quizQuestions, getRandomQuizQuestion };
} 