import React from 'react';

// Render floating leaf SVGs as animated background decoration
const leafEmojis = ['🌿', '🍃', '🌱', '🍀', '🌾'];

const FloatingLeaves = () => {
    const leaves = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: leafEmojis[i % leafEmojis.length],
        left: `${5 + (i * 8) % 92}%`,
        animDelay: `${(i * 1.3) % 10}s`,
        animDuration: `${12 + (i * 2.3) % 10}s`,
        size: `${1.4 + (i * 0.3) % 1.4}rem`,
        opacity: 0.2 + (i * 0.05) % 0.3
    }));

    return (
        <div style={styles.container} aria-hidden="true">
            {leaves.map(leaf => (
                <span
                    key={leaf.id}
                    style={{
                        ...styles.leaf,
                        left: leaf.left,
                        fontSize: leaf.size,
                        opacity: leaf.opacity,
                        animationDelay: leaf.animDelay,
                        animationDuration: leaf.animDuration
                    }}
                >
                    {leaf.emoji}
                </span>
            ))}
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
    },
    leaf: {
        position: 'absolute',
        top: '-60px',
        animation: 'floatDown linear infinite',
        userSelect: 'none'
    }
};

// Inject the keyframe animation into <head>
const style = document.createElement('style');
style.textContent = `
  @keyframes floatDown {
    0%   { transform: translateY(-60px) rotate(0deg);   opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
  }
  .app-wrapper {
    position: relative;
    min-height: 100vh;
  }
  .main-content {
    position: relative;
    z-index: 1;
  }
`;
document.head.appendChild(style);

export default FloatingLeaves;
