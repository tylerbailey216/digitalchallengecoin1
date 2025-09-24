const card = document.getElementById('card');
let isFlipped = false;
let startX = 0;
let startY = 0;
let currentRotation = 0;
let velocity = 0;
let lastTime = 0;
let animationId = null;
let isDragging = false;
let tiltX = 0;
let tiltY = 0;

function flipCard() {
    isFlipped = !isFlipped;
    card.classList.toggle('flipped');
    console.log('Card flipped:', isFlipped);
}

function rotateCard(rotation) {
    currentRotation = rotation;
    updateCardTransform();
}

function updateCardTransform() {
    card.style.transform = `rotateY(${currentRotation}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
}

function animate() {
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    if (Math.abs(velocity) > 0.01) {
        currentRotation += velocity * deltaTime * 0.05; // Slower rotation for weight
        velocity *= 0.9; // Higher friction for weight
        updateCardTransform();
        animationId = requestAnimationFrame(animate);
    } else {
        velocity = 0;
        animationId = null;
    }
}

// Touch events
card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lastTime = Date.now();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    card.classList.add('rotating');
});

card.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate tilt based on touch position
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const maxTilt = 10; // Reduced sensitivity
    tiltY = (deltaX / (rect.width / 2)) * maxTilt;
    tiltX = -(deltaY / (rect.height / 2)) * maxTilt;

    const deltaDragX = touchX - startX;
    const deltaDragY = touchY - startY;
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    if (Math.abs(deltaDragX) > Math.abs(deltaDragY) && Math.abs(deltaDragX) > 20) { // Increased threshold
        // Horizontal swipe for rotation
        velocity = deltaDragX / deltaTime;
        currentRotation += deltaDragX * 0.2; // Reduced rotation speed
    }
    updateCardTransform();
});

card.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    card.classList.remove('rotating');

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Tap: flip card
        flipCard();
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe: start inertia animation
        if (!animationId) {
            animate();
        }
    }
});

// Mouse events for desktop
card.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    lastTime = Date.now();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    card.classList.add('rotating');
    e.preventDefault();
});

card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate tilt based on mouse position
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const maxTilt = 15; // degrees
    tiltY = (deltaX / (rect.width / 2)) * maxTilt;
    tiltX = -(deltaY / (rect.height / 2)) * maxTilt;

    if (!isDragging) {
        updateCardTransform();
    } else {
        const deltaDragX = e.clientX - startX;
        const deltaDragY = e.clientY - startY;
        const now = Date.now();
        const deltaTime = now - lastTime;
        lastTime = now;

        if (Math.abs(deltaDragX) > Math.abs(deltaDragY)) {
            // Horizontal drag for rotation
            velocity = deltaDragX / deltaTime;
            currentRotation += deltaDragX * 0.5;
            updateCardTransform();
        }
    }
});

card.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    card.classList.remove('rotating');

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Click: flip card
        flipCard();
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal drag: start inertia animation
        if (!animationId) {
            animate();
        }
    }
});

card.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        card.classList.remove('rotating');
        if (!animationId) {
            animate();
        }
    }
    // Reset tilt when mouse leaves
    tiltX = 0;
    tiltY = 0;
    updateCardTransform();
});

// Prevent context menu on right click
card.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Control buttons
document.getElementById('flipBtn').addEventListener('click', () => {
    console.log('Flip button clicked');
    flipCard();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    console.log('Reset button clicked');
    currentRotation = 0;
    tiltX = 0;
    tiltY = 0;
    updateCardTransform();
    if (isFlipped) flipCard(); // Reset to front if flipped
});

document.getElementById('rotateLeftBtn').addEventListener('click', () => {
    console.log('Rotate left button clicked');
    currentRotation -= 90;
    updateCardTransform();
});

document.getElementById('rotateRightBtn').addEventListener('click', () => {
    console.log('Rotate right button clicked');
    currentRotation += 90;
    updateCardTransform();
});