/* ─── Cosmic Background ──────────────────────────────────────────────────
 *  Animated deep-space background: nebula gradients, starfield,
 *  drifting particles, and hex grid overlay.
 *  Pure visual — no interactivity, pointer-events: none.
 * ────────────────────────────────────────────────────────────────────────── */

import { useMemo } from 'react';

/** Generate random particle data for the cosmic dust effect */
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    dx: `${(Math.random() - 0.5) * 150}px`,
    dy: `${(Math.random() - 0.5) * 150}px`,
    duration: `${15 + Math.random() * 25}s`,
    delay: `${Math.random() * -20}s`,
    size: 1 + Math.random() * 2,
    hue: Math.random() > 0.7
      ? `rgba(0, 240, 255, ${0.1 + Math.random() * 0.2})`
      : Math.random() > 0.5
        ? `rgba(168, 85, 247, ${0.1 + Math.random() * 0.15})`
        : `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`,
  }));
}

export function CosmicBackground() {
  const particles = useMemo(() => generateParticles(30), []);

  return (
    <>
      {/* Main cosmic background with nebula gradients */}
      <div className="cosmic-bg">
        <div className="starfield" />
        <div className="cosmic-particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="cosmic-particle"
              style={{
                '--x': p.x,
                '--y': p.y,
                '--dx': p.dx,
                '--dy': p.dy,
                '--duration': p.duration,
                '--delay': p.delay,
                width: p.size,
                height: p.size,
                background: p.hue,
                boxShadow: `0 0 ${p.size * 3}px ${p.hue}`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Hex grid decorative overlay */}
      <div className="hex-grid-overlay" />
    </>
  );
}
