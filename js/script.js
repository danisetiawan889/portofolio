/**
 * ═══════════════════════════════════════════════════════
 * Dani Setiawan — Portfolio Script
 * Handles: Loading, Particles, Cursor, Navigation,
 *          Typewriter, Scroll Reveal, Skills Animation,
 *          Project Filters, and Form Handling
 * ═══════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ─── DOM REFERENCES ─────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ─── LOADING SCREEN ─────────────────────────────
    const loader = $('#loader');

    window.addEventListener('load', () => {
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            initRevealAnimations();
        }, 1800);
    });

    // ─── PARTICLE BACKGROUND ────────────────────────
    const canvas = $('#particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += 0.02;

            // Mouse interaction — gentle attraction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x += dx * 0.002;
                this.y += dy * 0.002;
                this.opacity = Math.min(this.opacity + 0.01, 0.8);
            }

            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            const pulseFactor = Math.sin(this.pulse) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * pulseFactor, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 220, 255, ${this.opacity * pulseFactor})`;
            ctx.fill();
        }
    }

    function initParticles() {
        resizeCanvas();
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
        particles = Array.from({ length: count }, () => new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 220, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        // Reinitialize particles if count needs adjusting
        const targetCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
        while (particles.length < targetCount) particles.push(new Particle());
        while (particles.length > targetCount) particles.pop();
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    initParticles();
    animateParticles();

    // ─── CUSTOM CURSOR ──────────────────────────────
    const cursorDot = $('#cursor-dot');
    const cursorOutline = $('#cursor-outline');
    let cursorVisible = true;

    if (cursorDot && cursorOutline) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
            cursorOutline.style.left = `${e.clientX}px`;
            cursorOutline.style.top = `${e.clientY}px`;

            if (!cursorVisible) {
                cursorDot.style.opacity = '1';
                cursorOutline.style.opacity = '1';
                cursorVisible = true;
            }
        });

        document.addEventListener('mouseout', () => {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
            cursorVisible = false;
        });

        // Hover effects on interactive elements
        const interactives = 'a, button, input, textarea, .project-card, .tool-card, .info-card, .contact-card, .filter-btn';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactives)) {
                cursorOutline.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactives)) {
                cursorOutline.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            }
        });

        // Hide custom cursor on touch devices
        if ('ontouchstart' in window) {
            cursorDot.style.display = 'none';
            cursorOutline.style.display = 'none';
        }
    }

    // ─── NAVBAR ─────────────────────────────────────
    const navbar = $('#navbar');
    const navLinks = $$('.nav-link');
    const hamburger = $('#hamburger');
    const navLinksContainer = $('#nav-links');
    const sections = $$('section[id]');

    // Scroll: add/remove transparent state
    function handleNavScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Active section highlighting
    function highlightActiveSection() {
        const scrollPos = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        handleNavScroll();
        highlightActiveSection();
    });

    // Mobile hamburger toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close mobile nav on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── TYPEWRITER EFFECT ──────────────────────────
    const typewriterEl = $('#typewriter');
    const titles = [
        'Front-End Developer',
        'UI/UX Designer',
        'Creative Problem Solver',
        'Web Enthusiast'
    ];
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeWrite() {
        const currentTitle = titles[titleIndex];

        if (isDeleting) {
            typewriterEl.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typewriterEl.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typeSpeed = 400; // Pause before next word
        }

        setTimeout(typeWrite, typeSpeed);
    }

    typeWrite();

    // ─── SCROLL REVEAL ANIMATIONS ───────────────────
    function initRevealAnimations() {
        const reveals = $$('[data-reveal]');

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Don't unobserve — we want re-animation if user scrolls back and forth? 
                    // Actually for performance, let's unobserve once revealed:
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
    }

    // ─── SKILL BARS ANIMATION ───────────────────────
    const skillBars = $$('.skill-progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const progress = bar.getAttribute('data-progress');
                bar.style.width = `${progress}%`;
                skillObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ─── PROJECT FILTER ─────────────────────────────
    const filterBtns = $$('.filter-btn');
    const projectCards = $$('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.classList.add('show');
                } else {
                    card.classList.remove('show');
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ─── PROJECT DETAIL MODAL ───────────────────────
    const modalOverlay = $('#project-modal-overlay');
    const modal = $('#project-modal');
    const modalClose = $('#project-modal-close');
    const modalImage = $('#project-modal-image');
    const modalCategory = $('#project-modal-category');
    const modalTitle = $('#project-modal-title');
    const modalDesc = $('#project-modal-desc');
    const modalTech = $('#project-modal-tech');
    const modalDemo = $('#project-modal-demo');
    const modalSource = $('#project-modal-source');

    // Image background map for modal
    const imageClassMap = {
        '': 'linear-gradient(135deg, #0d1b2a, #1b2838)',
        'placeholder-2': 'linear-gradient(135deg, #0a1628, #0f2035)',
        'placeholder-3': 'linear-gradient(135deg, #061a18, #0f2018)',
        'placeholder-4': 'linear-gradient(135deg, #1a0f18, #250f1a)',
        'placeholder-5': 'linear-gradient(135deg, #1a1a0f, #2e1f0f)',
        'placeholder-6': 'linear-gradient(135deg, #0d1b2a, #1b2838)',
    };

    function openProjectModal(card) {
        const title = card.getAttribute('data-title');
        const desc = card.getAttribute('data-desc');
        const techStr = card.getAttribute('data-tech');
        const demo = card.getAttribute('data-demo');
        const source = card.getAttribute('data-source');
        const category = card.getAttribute('data-category');
        const imgClass = card.getAttribute('data-image-class');

        // Populate modal
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalCategory.textContent = category;

        // Set image background — check if the card uses a real image
        const placeholder = card.querySelector('.project-image-placeholder');
        const computedStyle = window.getComputedStyle(placeholder);
        const bgImage = computedStyle.backgroundImage;

        if (bgImage && bgImage !== 'none') {
            modalImage.style.background = bgImage;
            modalImage.style.backgroundSize = 'cover';
            modalImage.style.backgroundPosition = 'center';
        } else {
            modalImage.style.background = imageClassMap[imgClass] || imageClassMap[''];
        }

        // Populate tech tags
        modalTech.innerHTML = '';
        if (techStr) {
            techStr.split(',').forEach(tech => {
                const span = document.createElement('span');
                span.textContent = tech.trim();
                modalTech.appendChild(span);
            });
        }

        // Set links
        modalDemo.href = demo || '#';
        modalSource.href = source || '#';

        // Show modal
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');

        // Re-init lucide icons in modal
        if (window.lucide) lucide.createIcons();
    }

    function closeProjectModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    // Click on project card to open modal
    projectCards.forEach(card => {
        card.style.cursor = 'none';
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking on an actual link inside
            if (e.target.closest('a')) return;
            openProjectModal(card);
        });
    });

    // Close modal events
    if (modalClose) {
        modalClose.addEventListener('click', closeProjectModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeProjectModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeProjectModal();
        }
    });

    // ─── CONTACT FORM (sends a real email via FormSubmit) ──
    const contactForm = $('#contact-form');
    const formStatus = $('#form-status');

    // Destination email — messages submitted through the form arrive here.
    // NOTE: the very first submission triggers a one-time confirmation email
    // from FormSubmit to this address; it must be confirmed once before
    // further messages get delivered.
    const CONTACT_EMAIL = 'setiawandanni22@gmail.com';
    const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

    function setFormStatus(message, type) {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.classList.remove('success', 'error');
        if (type) formStatus.classList.add(type);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.btn-submit');
            const originalContent = submitBtn.innerHTML;

            // Basic honeypot check (anti-spam field, should stay empty)
            const honey = this.querySelector('[name="_honey"]');
            if (honey && honey.value) {
                return; // silently drop likely bot submissions
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader" class="btn-icon"></i> Sending...';
            setFormStatus('', null);
            if (window.lucide) lucide.createIcons();

            try {
                const formData = new FormData(this);
                const response = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Request failed with status ' + response.status);
                }

                submitBtn.innerHTML = '<i data-lucide="check-circle" class="btn-icon"></i> Message Sent!';
                submitBtn.classList.add('btn-success');
                setFormStatus('Thanks! Your message has been sent — I\'ll get back to you soon.', 'success');
                this.reset();
            } catch (err) {
                submitBtn.innerHTML = '<i data-lucide="alert-circle" class="btn-icon"></i> Failed to Send';
                setFormStatus('Something went wrong sending your message. Please try emailing me directly at ' + CONTACT_EMAIL + '.', 'error');
            }

            if (window.lucide) lucide.createIcons();

            // Reset button after a few seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.classList.remove('btn-success');
                submitBtn.disabled = false;
                if (window.lucide) lucide.createIcons();
            }, 3500);
        });
    }

    // ─── SCROLL INDICATOR FADE ──────────────────────
    const scrollIndicator = $('#scroll-indicator');

    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }

    // ─── TILT EFFECT ON PROFILE IMAGE ───────────────
    const imageWrapper = $('.image-wrapper');

    if (imageWrapper && !('ontouchstart' in window)) {
        imageWrapper.addEventListener('mousemove', (e) => {
            const rect = imageWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            imageWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        imageWrapper.addEventListener('mouseleave', () => {
            imageWrapper.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }

})();
