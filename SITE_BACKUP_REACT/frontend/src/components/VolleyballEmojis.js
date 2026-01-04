import { useEffect } from 'react';

export default function VolleyballEmojis() {
  useEffect(() => {
    const container = document.getElementById('volleyball-emojis');
    if (!container) return;

    const emojis = [];
    const emojiCount = 8;

    for (let i = 0; i < emojiCount; i++) {
      const emoji = document.createElement('div');
      emoji.innerHTML = '🏐';
      emoji.style.position = 'absolute';
      emoji.style.fontSize = `${Math.random() * 40 + 30}px`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.opacity = '0.2';
      emoji.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
      emoji.style.animationDelay = `${Math.random() * 5}s`;
      emojis.push(emoji);
      container.appendChild(emoji);
    }

    return () => {
      emojis.forEach(emoji => emoji.remove());
    };
  }, []);

  return <div id="volleyball-emojis" className="fixed inset-0 pointer-events-none z-0" />;
}
