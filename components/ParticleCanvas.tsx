import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'star' | 'dust' | 'glow';
}

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const colors = {
    star: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
    dust: ['#8a7e58', '#6b7280', '#4b5563'],
    glow: ['#f59e0b', '#3b82f6', '#8b5cf6'],
  };

  const createParticle = useCallback((type: Particle['type'], x?: number, y?: number): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;

    const colorSet = colors[type];
    const color = colorSet[Math.floor(Math.random() * colorSet.length)];

    switch (type) {
      case 'star':
        return {
          x: x ?? Math.random() * canvas.width,
          y: y ?? Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.1 - Math.random() * 0.3,
          size: 0.5 + Math.random() * 1.5,
          opacity: 0.3 + Math.random() * 0.7,
          color,
          life: 0,
          maxLife: 300 + Math.random() * 400,
          type,
        };
      case 'dust':
        return {
          x: x ?? Math.random() * canvas.width,
          y: y ?? Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: 1 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.2,
          color,
          life: 0,
          maxLife: 500 + Math.random() * 300,
          type,
        };
      case 'glow':
        return {
          x: x ?? Math.random() * canvas.width,
          y: y ?? Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random() * 1,
          size: 2 + Math.random() * 4,
          opacity: 0.4 + Math.random() * 0.4,
          color,
          life: 0,
          maxLife: 100 + Math.random() * 100,
          type,
        };
    }
  }, []);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles: Particle[] = [];
    // Initial stars
    for (let i = 0; i < 40; i++) {
      particles.push(createParticle('star'));
    }
    // Initial dust
    for (let i = 0; i < 20; i++) {
      particles.push(createParticle('dust'));
    }
    particlesRef.current = particles;
  }, [createParticle]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = mouseRef.current;
    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      // Remove dead particles
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        // Replace with new star or dust
        if (p.type !== 'glow') {
          particles.push(createParticle(p.type));
        }
        continue;
      }

      // Mouse interaction: gentle repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = (150 - dist) / 150 * 0.3;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Friction
      p.vx *= 0.99;
      p.vy *= 0.99;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      // Fade in/out
      const lifeRatio = p.life / p.maxLife;
      let alpha = p.opacity;
      if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
      if (lifeRatio > 0.8) alpha *= (1 - lifeRatio) / 0.2;

      // Twinkle for stars
      if (p.type === 'star') {
        alpha *= 0.7 + Math.sin(p.life * 0.05) * 0.3;
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'glow') {
        // Glow particles get radial gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw mouse glow
    if (mouse.x > 0 && mouse.y > 0) {
      ctx.save();
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.03)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [createParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Occasionally spawn glow particles near mouse
      if (Math.random() < 0.15) {
        particlesRef.current.push(
          createParticle('glow', e.clientX + (Math.random() - 0.5) * 30, e.clientY + (Math.random() - 0.5) * 30)
        );
      }
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    init();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [init, animate]);

  // Scroll-based effect: spawn particles on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;

      if (delta > 5) {
        const count = Math.min(Math.floor(delta / 10), 5);
        for (let i = 0; i < count; i++) {
          particlesRef.current.push(
            createParticle('glow', Math.random() * window.innerWidth, Math.random() * window.innerHeight)
          );
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleCanvas;
