const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Circuit Line Animation
const experienceSection = document.getElementById('experience');
const timelineContainer = experienceSection?.querySelector('.timeline');
const progressBar = document.getElementById('progress-bar');
let timelineTrackHeight = 0;
let timelineAnimationFrame = 0;

function syncTimelineGeometry() {
    if (!timelineContainer) return;

    const dots = timelineContainer.querySelectorAll('.timeline-dot, .timeline-dot-current');
    if (dots.length === 0) return;

    const containerRect = timelineContainer.getBoundingClientRect();
    const firstDotRect = dots[0].getBoundingClientRect();
    const lastDotRect = dots[dots.length - 1].getBoundingClientRect();

    const trackTop = firstDotRect.top - containerRect.top + firstDotRect.height / 2;
    const trackBottom = lastDotRect.top - containerRect.top + lastDotRect.height / 2;

    timelineTrackHeight = Math.max(0, trackBottom - trackTop);
    timelineContainer.style.setProperty('--timeline-track-top', `${trackTop}px`);
    timelineContainer.style.setProperty('--timeline-track-height', `${timelineTrackHeight}px`);
}

function updateTimelineProgress() {
    if (!experienceSection || !progressBar) return;

    const rect = experienceSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top >= windowHeight) {
        progressBar.style.height = '0px';
        return;
    }

    if (rect.bottom <= 0) {
        progressBar.style.height = `${timelineTrackHeight}px`;
        return;
    }

    const percentage = Math.max(0, Math.min(1, (windowHeight - rect.top) / rect.height));
    progressBar.style.height = `${timelineTrackHeight * percentage}px`;
}

function requestTimelineUpdate() {
    if (timelineAnimationFrame) return;

    timelineAnimationFrame = window.requestAnimationFrame(() => {
        timelineAnimationFrame = 0;
        syncTimelineGeometry();
        updateTimelineProgress();
    });
}

if (experienceSection && timelineContainer && progressBar) {
    syncTimelineGeometry();
    updateTimelineProgress();

    window.addEventListener('scroll', requestTimelineUpdate, { passive: true });
    window.addEventListener('resize', requestTimelineUpdate);
    window.addEventListener('load', requestTimelineUpdate);
}

// 2. Reveal Elements
const revealElements = document.querySelectorAll('.reveal');
if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    revealElements.forEach((el) => el.classList.add('active'));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach((el) => observer.observe(el));
}

// 3. Typewriter
const text = '> initializing_neural_architect...';
const typeElement = document.getElementById('typewriter');
let i = 0;
function type() {
    if (typeElement && i < text.length) {
        typeElement.textContent += text.charAt(i);
        i++;
        setTimeout(type, 50);
    }
}
if (typeElement && prefersReducedMotion) {
    typeElement.textContent = text;
} else if (typeElement) {
    setTimeout(type, 500);
}

// 4. SNN Background
const canvas = document.getElementById('snn-canvas');
const ctx = canvas instanceof HTMLCanvasElement ? canvas.getContext('2d') : null;
let width, height;
let neurons = [];
let animationFrameId = null;

if (!canvas || !ctx) {
    // Canvas is optional; skip the ambient background if unsupported.
} else if (!prefersReducedMotion) {
    window.addEventListener('resize', () => { resize(); init(); });
} else {
    canvas.style.display = 'none';
}

function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Neuron {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
        this.pulse = 0;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
        this.isCyan = Math.random() > 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        this.pulse += this.pulseSpeed;
        if (this.pulse > 1) this.pulse = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const isCyan = this.isCyan;
        const alpha = 0.2 + (this.pulse > 0.9 ? (this.pulse - 0.9) * 10 : 0);
        ctx.fillStyle = isCyan
            ? `rgba(34, 211, 238, ${alpha})`
            : `rgba(168, 85, 247, ${alpha})`;
        ctx.fill();
    }
}

function init() {
    neurons = [];
    for (let idx = 0; idx < 70; idx++) neurons.push(new Neuron());
}

function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (let idx = 0; idx < neurons.length; idx++) {
        neurons[idx].update();
        neurons[idx].draw();
        for (let j = idx; j < neurons.length; j++) {
            let dx = neurons[idx].x - neurons[j].x;
            let dy = neurons[idx].y - neurons[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                let alpha = (1 - dist / 150) * 0.1;
                if (neurons[idx].pulse > 0.9 || neurons[j].pulse > 0.9) {
                    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha + 0.3})`;
                } else {
                    ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;
                }
                ctx.moveTo(neurons[idx].x, neurons[idx].y);
                ctx.lineTo(neurons[j].x, neurons[j].y);
                ctx.stroke();
            }
        }
    }
    animationFrameId = requestAnimationFrame(animate);
}

if (canvas && ctx && !prefersReducedMotion) {
    resize();
    init();
    animate();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            return;
        }
        if (!document.hidden && !animationFrameId) {
            animate();
        }
    });
}

// 5. Flip Cards (tap to flip on mobile)
function setFlipCardState(card, isFlipped) {
    card.classList.toggle('flipped', isFlipped);
    card.setAttribute('aria-pressed', String(isFlipped));
    const front = card.querySelector('.flip-card-front');
    const back = card.querySelector('.flip-card-back');
    if (front && back) {
        front.setAttribute('aria-hidden', String(isFlipped));
        back.setAttribute('aria-hidden', String(!isFlipped));
    }
}

document.querySelectorAll('.flip-card').forEach((card) => {
    setFlipCardState(card, false);
    card.addEventListener('click', () => {
        setFlipCardState(card, !card.classList.contains('flipped'));
    });
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setFlipCardState(card, !card.classList.contains('flipped'));
        }
    });
});

// 6. Mobile Menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');

function setMobileMenuState(isOpen) {
    if (!mobileMenu || !mobileMenuBtn || !menuIcon || !closeIcon) return;
    mobileMenu.classList.toggle('hidden', !isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    menuIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
}

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        setMobileMenuState(mobileMenu.classList.contains('hidden'));
    });
}

document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
        setMobileMenuState(false);
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setMobileMenuState(false);
    }
});

document.addEventListener('click', (event) => {
    const target = event.target;
    if (
        mobileMenu &&
        mobileMenuBtn &&
        !mobileMenu.classList.contains('hidden') &&
        target instanceof Node &&
        !mobileMenu.contains(target) &&
        !mobileMenuBtn.contains(target)
    ) {
        setMobileMenuState(false);
    }
});
