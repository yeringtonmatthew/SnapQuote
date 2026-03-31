'use client';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ec4899', '#818cf8', '#34d399', '#fbbf24', '#f472b6'];
const PARTICLE_COUNT = 30;

export function triggerConfetti() {
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(container);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement('div');
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = 6 + Math.random() * 6;
    const isCircle = Math.random() > 0.5;

    // Random spread from center
    const angle = Math.random() * Math.PI * 2;
    const velocity = 300 + Math.random() * 400;
    const tx = Math.cos(angle) * velocity;
    const ty = -200 - Math.random() * 500; // upward initial burst
    const rotation = Math.random() * 720 - 360;
    const duration = 1200 + Math.random() * 800;
    const delay = Math.random() * 150;

    particle.style.cssText = `
      position:absolute;
      left:50%;top:50%;
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:${isCircle ? '50%' : '2px'};
      opacity:1;
      transform:translate(-50%,-50%);
      animation:confetti-burst ${duration}ms ${delay}ms cubic-bezier(.15,.8,.3,1) forwards;
      --tx:${tx}px;
      --ty:${ty}px;
      --r:${rotation}deg;
    `;

    container.appendChild(particle);
  }

  // Clean up after all animations finish
  setTimeout(() => {
    container.remove();
  }, 2500);
}
