// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// --- Initialization & Loader ---
window.addEventListener("load", () => {
    const tl = gsap.timeline();

    // Loader progress bar animation
    tl.to(".loader-progress", {
        width: "100%",
        duration: 1.5,
        ease: "power2.inOut"
    })
        .to(".loader-overlay", {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
                document.body.classList.remove("loading");
                initThemeToggle();
                initHeroAnimations();
                initScrollAnimations();
            }
        }, "+=0.2");
});

// --- Theme Toggle ---
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');

            if (isLight) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }

            window.dispatchEvent(new Event('themeChanged'));
        });
    }
}

// --- Hero Animations ---
function initHeroAnimations() {
    const tl = gsap.timeline();

    // Animate large text lines
    const textLines = document.querySelectorAll(".hero-text-wrapper .reveal-text");
    tl.from(textLines, {
        y: 150,
        opacity: 0,
        rotationZ: 3,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out"
    })
        // Animate subtitle
        .from(".hero-subtitle", {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.6")
        // Animate scroll prompt
        .from(".scroll-prompt", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.8");
}

// --- Scroll Animations ---
function initScrollAnimations() {
    // Navbar behavior
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Fade up general items
    const fadeUpItems = document.querySelectorAll(".fade-up");
    fadeUpItems.forEach((item) => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%", // reveals when top of element hits 85% of viewport
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Split text reveal for headings
    const revealHeadings = document.querySelectorAll(".section-heading.text-reveal");
    revealHeadings.forEach((heading) => {
        // Simple faux-splittext (GSAP splitText is premium, we use a simple opacity reveal)
        gsap.to(heading, {
            scrollTrigger: {
                trigger: heading,
                start: "top 85%",
            },
            opacity: 1,
            duration: 1.5,
            ease: "power3.out"
        });
    });

    // Bento Box parallax hover effect
    const bentoItems = document.querySelectorAll('.bento-item');
    bentoItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Adjust background gradient based on mouse position to create a glare effect
            const isLight = document.body.classList.contains('light-theme');
            const glareColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
            const bgColor = isLight ? 'rgba(255,255,255,1)' : 'rgba(10,10,10,1)';
            item.style.background = `radial-gradient(circle at ${x}px ${y}px, ${glareColor} 0%, ${bgColor} 50%)`;
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = '';
        });
    });
}

// --- Three.js "Spline-style" Background ---
const initThreeJS = () => {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 25;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // GEOMETRY - Futuristic Abstract Mesh (Icosahedron / Torus Knot)
    const geometry = new THREE.TorusKnotGeometry(9, 2.5, 200, 32);

    // MATERIAL - High Tech Wireframe
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x222222,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // MESH
    const points = new THREE.Points(geometry, material);
    const wireframe = new THREE.Mesh(geometry, wireframeMat);

    const group = new THREE.Group();
    group.add(points);
    group.add(wireframe);
    scene.add(group);

    // Position it nicely
    group.position.x = 8;
    group.position.y = 0;

    // Theme listener for 3D object
    window.addEventListener('themeChanged', () => {
        const isLight = document.body.classList.contains('light-theme');
        if (isLight) {
            material.color.setHex(0xaaaaaa);
            wireframeMat.color.setHex(0xcccccc);
            material.blending = THREE.NormalBlending;
        } else {
            material.color.setHex(0xffffff);
            wireframeMat.color.setHex(0x222222);
            material.blending = THREE.AdditiveBlending;
        }
    });

    // MOUSE INTERACTION
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Auto rotation
        group.rotation.y = elapsedTime * 0.1;
        group.rotation.x = elapsedTime * 0.05;

        // Mouse interaction smoothing
        targetX = mouseX * 2;
        targetY = mouseY * 2;

        group.rotation.y += 0.05 * (targetX - group.rotation.y);
        group.rotation.x += 0.05 * (targetY - group.rotation.x);

        // Add slow float
        group.position.y = Math.sin(elapsedTime * 0.5) * 1.5;

        // Render
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // RESIZE HANDLER
    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
};

initThreeJS();
