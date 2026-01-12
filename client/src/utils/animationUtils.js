/**
 * Animates an image flying from a source element to a destination element.
 * @param {string} sourceId - The ID of the source element (e.g., product image).
 * @param {string} targetId - The ID of the target element (e.g., cart icon).
 */
export const flyToCart = (sourceId, targetId) => {
    const source = document.getElementById(sourceId);
    // Try desktop target first, then mobile
    const target = document.getElementById(targetId) || document.getElementById('cart-icon-mobile') || document.getElementById('cart-icon-desktop');

    if (!source || !target) return;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Clone the source image
    const clone = source.cloneNode(true);

    // Style the clone to match source exactly but fixed position
    clone.style.position = 'fixed';
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none'; // Ensure it doesn't block clicks
    clone.style.borderRadius = '12px'; // Match typical rounded corners
    clone.style.opacity = '0.8';

    document.body.appendChild(clone);

    // Calculate translation
    const deltaX = targetRect.left + (targetRect.width / 2) - (sourceRect.left + (sourceRect.width / 2));
    const deltaY = targetRect.top + (targetRect.height / 2) - (sourceRect.top + (sourceRect.height / 2));

    // Animate
    const animation = clone.animate([
        {
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.8
        },
        {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(0.1)`,
            opacity: 0.5,
            offset: 0.8 // Reach target mostly by 80%
        },
        {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(0)`,
            opacity: 0
        }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.2, 1, 0.3, 1)' // Ease out usually feels best
    });

    animation.onfinish = () => {
        clone.remove();
        // Optional: Bump effect on cart
        target.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], {
            duration: 200
        });
    };
};
