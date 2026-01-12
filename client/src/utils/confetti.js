import confetti from 'canvas-confetti';

export const triggerSuccessAnimation = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        // Left side
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#10B981', '#059669', '#34D399', '#FFD700'] // Greens and Gold
        });

        // Right side
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#10B981', '#059669', '#34D399', '#FFD700']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};
