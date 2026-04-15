const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Circuit Line Animation
window.addEventListener('scroll', () => {
    const timeline = document.getElementById('experience');
    const progressBar = document.getElementById('progress-bar');
    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
        let percentage = (windowHeight - rect.top) / rect.height * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        progressBar.style.height = `${percentage}%`;
    }
});

// 2. Reveal Elements
const revealElements = document.querySelectorAll('.reveal');
if (prefersReducedMotion) {
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
    if (i < text.length) {
        typeElement.textContent += text.charAt(i);
        i++;
        setTimeout(type, 50);
    }
}
if (prefersReducedMotion) {
    typeElement.textContent = text;
} else {
    setTimeout(type, 500);
}

// 4. SNN Background
const canvas = document.getElementById('snn-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let neurons = [];
let animationFrameId = null;

if (!prefersReducedMotion) {
    window.addEventListener('resize', () => { resize(); init(); });
} else {
    canvas.style.display = 'none';
}

function resize() {
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

if (!prefersReducedMotion) {
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
    mobileMenu.classList.toggle('hidden', !isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    menuIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
}

mobileMenuBtn.addEventListener('click', () => {
    setMobileMenuState(mobileMenu.classList.contains('hidden'));
});

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
    if (!mobileMenu.classList.contains('hidden') && target instanceof Node && !mobileMenu.contains(target) && !mobileMenuBtn.contains(target)) {
        setMobileMenuState(false);
    }
});
