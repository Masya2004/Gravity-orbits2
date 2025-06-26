// main3d.js
// Современная 3D-визуализация для гравитационной симуляции
let threeInitialized = false;
let scene, camera, renderer, controls;
let threeMeshes = [];
let threeContainer = null;
let orbitLines = [];
let orbitPaths = [];

function ensureThreeContainer() {
    threeContainer = document.getElementById('threeContainer');
    if (!threeContainer) {
        const view3d = document.getElementById('view3d');
        if (!view3d) return null;
        threeContainer = document.createElement('div');
        threeContainer.id = 'threeContainer';
        threeContainer.style.width = '100%';
        threeContainer.style.height = '100%';
        view3d.appendChild(threeContainer);
    }
    return threeContainer;
}

function init3D() {
    if (threeInitialized) return;
    const container = ensureThreeContainer();
    if (!container) return;
    threeInitialized = true;
    container.innerHTML = '';
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 1, 5000);
    camera.position.set(0, 0, 1200);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x0a0a0f);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 200;
    controls.maxDistance = 4000;
    controls.target.set(800, 400, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.PointLight(0xffffff, 1.2, 0);
    light.position.set(0, 0, 0);
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 0, 1);
    scene.add(dirLight);
    addStarfield();
    window.addEventListener('resize', resize3D, false);
    animate3D();
}

function addStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const positions = [];
    for (let i = 0; i < starCount; i++) {
        const r = 2000 + Math.random() * 3000;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 10, sizeAttenuation: true });
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.name = 'starfield';
    scene.add(stars);
}

function clearThreeMeshes() {
    for (const mesh of threeMeshes) scene.remove(mesh);
    threeMeshes = [];
}

function sync3DObjects() {
    if (!window.objects || !threeInitialized) return;
    if (threeMeshes.length !== window.objects.length) {
        clearThreeMeshes();
        for (const obj of window.objects) {
            const geometry = new THREE.SphereGeometry(obj.radius, 48, 48);
            let color = (typeof obj.color === 'string' && obj.color[0] === '#') ? parseInt(obj.color.slice(1), 16) : obj.color;
            let matParams = { color: color, shininess: 80, transparent: true, opacity: 0.95 };
            if (obj.type === 'star') matParams.emissive = color;
            const material = new THREE.MeshPhongMaterial(matParams);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(obj.x, obj.y, 0);
            scene.add(mesh);
            threeMeshes.push(mesh);
        }
    }
}

function resetOrbitPaths() {
    orbitPaths = window.objects ? window.objects.map(obj => [new THREE.Vector3(obj.x, obj.y, 0)]) : [];
}

function updateOrbitPaths() {
    if (!window.objects) return;
    for (let i = 0; i < window.objects.length; i++) {
        if (!orbitPaths[i]) orbitPaths[i] = [];
        orbitPaths[i].push(new THREE.Vector3(window.objects[i].x, window.objects[i].y, 0));
        // Увеличиваем длину траектории до 80000 точек (можно изменить)
        if (orbitPaths[i].length > 80000) orbitPaths[i].shift();
    }
}

function clearOrbitLines() {
    for (const line of orbitLines) scene.remove(line);
    orbitLines = [];
}

function drawOrbitLines() {
    clearOrbitLines();
    for (let i = 0; i < orbitPaths.length; i++) {
        if (orbitPaths[i].length < 2) continue;
        const geometry = new THREE.BufferGeometry().setFromPoints(orbitPaths[i]);
        // Яркий белый цвет линии
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        orbitLines.push(line);
    }
}

function update3DPositions() {
    if (!window.objects || !threeInitialized) return;
    for (let i = 0; i < threeMeshes.length; i++) {
        const obj = window.objects[i];
        if (!obj) continue;
        threeMeshes[i].position.set(obj.x, obj.y, 0);
    }
    updateOrbitPaths();
    drawOrbitLines();
}

function animate3D() {
    if (!threeInitialized) return;
    requestAnimationFrame(animate3D);
    controls.update();
    renderer.render(scene, camera);
}

function resize3D() {
    if (!threeInitialized) return;
    const container = ensureThreeContainer();
    if (!container) return;
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function reset3DScene() {
    if (!threeInitialized) return;
    clearThreeMeshes();
    // Удаляем все кроме звёздного поля и света
    scene.children = scene.children.filter(obj => obj.name === 'starfield' || obj.type.includes('Light'));
    clearOrbitLines();
    resetOrbitPaths();
}

// Экспортируем функции в window
window.init3D = init3D;
window.sync3DObjects = sync3DObjects;
window.update3DPositions = update3DPositions;
window.reset3DScene = reset3DScene; 