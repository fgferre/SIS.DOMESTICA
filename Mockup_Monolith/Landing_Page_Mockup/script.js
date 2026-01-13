// Initialize Intersection Observer for Scroll Reveal Animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.reveal-hidden');
    hiddenElements.forEach(el => observer.observe(el));
});

// Simple utility to add parallax effect to floating elements
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX * -0.01);
    const moveY = (e.clientY * -0.01);
    
    const floatingElements = document.querySelectorAll('.parallax-element');
    floatingElements.forEach((el, index) => {
        const speed = (index + 1) * 0.5;
        el.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
    });
});