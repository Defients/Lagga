/* ─── Trail Preview Canvas ────────────────────────────────────────────────
 *  Self-contained mini simulation that mirrors the overlay physics for
 *  the currently selected trail. Renders a looping demo path so the user
 *  can see how their settings look in real time without the overlay.
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react';
import { useTrailStore } from '../stores/trail-store';
import { hexToRgb, lerpColor } from '../shared/settings';
import type { TrailSettings } from '../shared/types';

interface PreviewParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

function velocityToHex(speed: number): string {
  const stops = [
    { s: 0, c: '#00ffc8' },
    { s: 250, c: '#4dabf7' },
    { s: 550, c: '#fbbf24' },
    { s: 850, c: '#ff00ff' },
  ];
  for (let i = 1; i < stops.length; i++) {
    if (speed <= stops[i].s) {
      const t = (speed - stops[i - 1].s) / (stops[i].s - stops[i - 1].s);
      return lerpColor(stops[i - 1].c, stops[i].c, t);
    }
  }
  return stops[stops.length - 1].c;
}

function getColor(settings: TrailSettings, speed: number, time: number): string {
  const cycle = settings.colorCycling ? settings.colorCycleSpeed : 1;
  if (settings.colorMode === 'velocity') return velocityToHex(speed);
  if (settings.colorMode === 'rainbow') return `hsl(${(time / 16 * cycle) % 360}, 85%, 62%)`;
  if (settings.colorMode === 'gradient') {
    const phase = (Math.sin(time / 700 * cycle) + 1) * 0.5;
    return lerpColor(settings.colorPrimary, settings.colorSecondary, phase);
  }
  if (settings.colorMode === 'palette') {
    const phase = (Math.sin(time / 900 * cycle) + 1) * 0.5;
    return lerpColor(settings.colorSecondary, settings.colorTertiary, phase);
  }
  if (settings.colorMode === 'pulse') {
    const pulse = (Math.sin(time / 400 * cycle) + 1) * 0.5;
    const brightness = 0.35 + pulse * 0.65;
    const blended = lerpColor(settings.colorPrimary, settings.colorSecondary, pulse * 0.4);
    const rgb = hexToRgb(blended);
    return `rgb(${Math.round(rgb.r * brightness)}, ${Math.round(rgb.g * brightness)}, ${Math.round(rgb.b * brightness)})`;
  }
  return settings.colorPrimary;
}

function toRgb(hex: string): string {
  const r = hexToRgb(hex);
  return `${r.r}, ${r.g}, ${r.b}`;
}

export function TrailPreview({ trailIndex }: { trailIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useTrailStore((s) => s.trails[trailIndex]);
  const trailRef = useRef(trail);
  trailRef.current = trail;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    const dpr = window.devicePixelRatio || 1;
    let animId = 0;
    let lastTime = -1;

    let orbX = 0, orbY = 0, orbVx = 0, orbVy = 0;
    let demoX = 0, demoY = 0;
    let demoAngle = 0;
    const trailPoints: { x: number; y: number; speed: number }[] = [];
    const particles: PreviewParticle[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    function tick(ts: number) {
      animId = requestAnimationFrame(tick);
      if (lastTime < 0) { lastTime = ts; return; }
      const dt = Math.min((ts - lastTime) / 1000, 0.1);
      lastTime = ts;

      const s = trailRef.current;
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;

      demoAngle += dt * 0.8;
      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.32;
      const ry = h * 0.28;
      demoX = cx + Math.cos(demoAngle) * rx + Math.sin(demoAngle * 2.3) * rx * 0.15;
      demoY = cy + Math.sin(demoAngle * 1.4) * ry + Math.cos(demoAngle * 3.1) * ry * 0.1;

      if (orbX === 0 && orbY === 0) { orbX = demoX; orbY = demoY; }

      const dx = orbX - demoX;
      const dy = orbY - demoY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const displacement = dist - s.leashLength * 0.4;
      const nx = dx / dist;
      const ny = dy / dist;
      const tensionMul = 0.5 + s.springTension * 1.5;

      orbVx -= nx * displacement * s.stiffness * tensionMul * dt * 0.5;
      orbVy -= ny * displacement * s.stiffness * tensionMul * dt * 0.5;

      const gravityRad = (s.gravityAngle * Math.PI) / 180;
      orbVx += Math.cos(gravityRad) * s.gravity * 0.3 * dt;
      orbVy += Math.sin(gravityRad) * s.gravity * 0.3 * dt;
      orbVx += s.windX * 0.3 * dt;
      orbVy += s.windY * 0.3 * dt;

      const turb = s.turbulence * 60;
      if (turb > 0) {
        orbVx += (Math.random() - 0.5) * turb * dt;
        orbVy += (Math.random() - 0.5) * turb * dt;
      }

      if (s.orbitalAttraction > 0) {
        orbVx += -ny * s.orbitalAttraction * 40 * dt;
        orbVy += nx * s.orbitalAttraction * 40 * dt;
      }

      const dampMul = Math.max(0, 1 - s.damping * dt * 0.5);
      const fricMul = Math.max(0, 1 - s.friction * dt * 1.5);
      const decayMul = Math.max(0, 1 - s.velocityDecay * dt);
      orbVx *= dampMul * fricMul * decayMul;
      orbVy *= dampMul * fricMul * decayMul;
      orbVx *= Math.max(0, 1 - (1 - s.inertia) * dt);
      orbVy *= Math.max(0, 1 - (1 - s.inertia) * dt);

      orbX += orbVx * dt;
      orbY += orbVy * dt;

      const speed = Math.sqrt(orbVx * orbVx + orbVy * orbVy);
      const color = getColor(s, speed, ts);
      const c = toRgb(color);

      trailPoints.push({ x: orbX, y: orbY, speed });
      const maxLen = Math.max(2, Math.round(s.trailLength * 0.5));
      while (trailPoints.length > maxLen) trailPoints.shift();

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = 'rgba(5, 2, 14, 0.3)';
      ctx.fillRect(0, 0, w, h);

      // Demo cursor dot
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(demoX, demoY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Trail (additive blending for cosmic glow)
      const opacity = s.opacity;
      ctx.globalCompositeOperation = 'lighter';
      for (let p = 1; p < trailPoints.length; p++) {
        const prev = trailPoints[p - 1];
        const curr = trailPoints[p];
        const t = p / trailPoints.length;
        const fadeT = s.trailFadeCurve > 0.5
          ? Math.pow(t, 1 + (s.trailFadeCurve - 0.5) * 4)
          : t * (1 - s.trailFadeCurve * 0.5);
        const widthBoost = s.velocityThickness ? Math.min(curr.speed / 400, 1) * 0.9 : 0;
        const lineW = Math.max(0.5, fadeT * s.trailWidth * 0.35 * (0.35 + widthBoost));

        if (s.renderMode === 'dots') {
          ctx.fillStyle = `rgba(${c}, ${fadeT * opacity * 0.7})`;
          ctx.beginPath();
          ctx.arc(curr.x, curr.y, lineW * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.renderMode === 'ribbon') {
          const perpX = -(curr.y - prev.y);
          const perpY = curr.x - prev.x;
          const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
          const halfW = lineW * 1.5;
          const ox = (perpX / plen) * halfW;
          const oy = (perpY / plen) * halfW;
          ctx.beginPath();
          ctx.moveTo(prev.x + ox, prev.y + oy);
          ctx.lineTo(curr.x + ox, curr.y + oy);
          ctx.lineTo(curr.x - ox, curr.y - oy);
          ctx.lineTo(prev.x - ox, prev.y - oy);
          ctx.closePath();
          ctx.fillStyle = `rgba(${c}, ${fadeT * opacity * 0.5})`;
          ctx.fill();
        } else if (s.renderMode === 'energy-streams') {
          const perpX = -(curr.y - prev.y);
          const perpY = curr.x - prev.x;
          const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
          const offset = Math.sin(p * 0.3 + ts / 200) * 2 * fadeT;
          ctx.beginPath();
          ctx.moveTo(prev.x + (perpX / plen) * offset, prev.y + (perpY / plen) * offset);
          ctx.lineTo(curr.x + (perpX / plen) * offset, curr.y + (perpY / plen) * offset);
          ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.6})`;
          ctx.lineWidth = lineW;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else if (s.renderMode === 'plasma-bolt') {
          const perpX = -(curr.y - prev.y);
          const perpY = curr.x - prev.x;
          const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
          const jitter = Math.sin(p * 1.7 + ts / 80) * 4 * fadeT;
          const jitter2 = Math.cos(p * 2.3 + ts / 55) * 3 * fadeT;
          ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.5})`;
          ctx.lineWidth = lineW * 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(prev.x + (perpX / plen) * jitter, prev.y + (perpY / plen) * jitter);
          ctx.lineTo(curr.x + (perpX / plen) * jitter, curr.y + (perpY / plen) * jitter);
          ctx.stroke();
          ctx.strokeStyle = `rgba(255, 255, 255, ${fadeT * opacity * 0.6})`;
          ctx.lineWidth = lineW * 0.8;
          ctx.beginPath();
          ctx.moveTo(prev.x + (perpX / plen) * jitter2, prev.y + (perpY / plen) * jitter2);
          ctx.lineTo(curr.x + (perpX / plen) * jitter2, curr.y + (perpY / plen) * jitter2);
          ctx.stroke();
        } else if (s.renderMode === 'shockwave') {
          const segT = 1 - fadeT;
          const ringR = lineW * (1 + segT * 3);
          ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.5})`;
          ctx.lineWidth = Math.max(0.5, lineW * 0.6);
          ctx.beginPath();
          ctx.arc(curr.x, curr.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        } else if (s.renderMode === 'glowing-orbs') {
          const orbR = lineW * 1.2;
          const grad = ctx.createRadialGradient(curr.x, curr.y, 0, curr.x, curr.y, orbR);
          grad.addColorStop(0, `rgba(${c}, ${fadeT * opacity * 0.9})`);
          grad.addColorStop(0.4, `rgba(${c}, ${fadeT * opacity * 0.4})`);
          grad.addColorStop(1, `rgba(${c}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curr.x, curr.y, orbR, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.renderMode === 'fireflies') {
          const ffR = lineW * 0.9;
          const blink = 0.4 + 0.6 * Math.abs(Math.sin(p * 0.7 + ts / 300));
          const ffAlpha = fadeT * opacity * blink * 0.8;
          const grad = ctx.createRadialGradient(curr.x, curr.y, 0, curr.x, curr.y, ffR * 2);
          grad.addColorStop(0, `rgba(${c}, ${ffAlpha})`);
          grad.addColorStop(0.3, `rgba(${c}, ${ffAlpha * 0.5})`);
          grad.addColorStop(1, `rgba(${c}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curr.x, curr.y, ffR * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255, 255, 255, ${ffAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(curr.x, curr.y, ffR * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.renderMode === 'spiral') {
          const angle = p * 0.5 + ts / 400;
          const spiralR = lineW * (1 + fadeT * 2);
          const ox = Math.cos(angle) * spiralR;
          const oy = Math.sin(angle) * spiralR;
          const grad = ctx.createRadialGradient(curr.x + ox, curr.y + oy, 0, curr.x + ox, curr.y + oy, lineW);
          grad.addColorStop(0, `rgba(${c}, ${fadeT * opacity * 0.8})`);
          grad.addColorStop(1, `rgba(${c}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curr.x + ox, curr.y + oy, lineW, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x + ox, curr.y + oy);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.7})`;
          ctx.lineWidth = lineW;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Particles
      const targetCount = Math.min(s.particleCount, 30);
      while (particles.length < targetCount) {
        const sizeBase = s.sizeMin + Math.random() * (s.sizeMax - s.sizeMin);
        const curveMul = s.sizeCurve > 0.5
          ? Math.pow(1 - Math.random(), (s.sizeCurve - 0.5) * 4 + 1)
          : 1 - Math.random() * s.sizeCurve * 0.5;
        const size = sizeBase * (0.3 + curveMul * 0.7);
        particles.push({
          x: orbX + (Math.random() - 0.5) * s.orbRadius,
          y: orbY + (Math.random() - 0.5) * s.orbRadius,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          life: 1,
          maxLife: 0.5 + Math.random() * 1.5,
          size: size * (1 - s.particleVariance * 0.5 + Math.random() * s.particleVariance),
        });
      }
      for (let p = particles.length - 1; p >= 0; p--) {
        const part = particles[p];
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.vx *= 0.96;
        part.vy *= 0.96;
        part.life -= dt / part.maxLife;
        if (part.life <= 0) { particles.splice(p, 1); continue; }
        ctx.fillStyle = `rgba(${c}, ${part.life * opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size * part.life * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orb (already in additive mode)
      let radius = s.orbRadius * 0.5;
      if (s.breathing) {
        const breathPhase = Math.sin(ts / 1000 * s.breathSpeed * Math.PI * 2);
        radius *= 1 + breathPhase * s.breathDepth;
      }
      const glowR = radius * (2.5 + s.bloomStrength * 2);
      const glow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, glowR);
      glow.addColorStop(0, `rgba(${c}, ${s.glowIntensity * 0.6 * opacity})`);
      glow.addColorStop(1, `rgba(${c}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(orbX, orbY, glowR, 0, Math.PI * 2);
      ctx.fill();

      const orbGrad = ctx.createRadialGradient(orbX - radius * 0.2, orbY - radius * 0.2, 0, orbX, orbY, radius);
      orbGrad.addColorStop(0, `rgba(255,255,255,${0.9 * opacity})`);
      orbGrad.addColorStop(0.18, `rgba(${c}, ${0.95 * opacity})`);
      orbGrad.addColorStop(1, `rgba(${c}, ${0.18 * opacity})`);
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Comet mode tail
      if (s.cometMode) {
        const orbSpeed = Math.sqrt(orbVx * orbVx + orbVy * orbVy);
        const tailLen = Math.min(orbSpeed * 0.3, 40);
        const dirX = orbVx / (orbSpeed || 0.001);
        const dirY = orbVy / (orbSpeed || 0.001);
        const tailGrad = ctx.createLinearGradient(orbX, orbY, orbX - dirX * tailLen, orbY - dirY * tailLen);
        tailGrad.addColorStop(0, `rgba(${c}, ${0.5 * opacity})`);
        tailGrad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        const perpX = -dirY;
        const perpY = dirX;
        ctx.moveTo(orbX + perpX * radius * 0.8, orbY + perpY * radius * 0.8);
        ctx.lineTo(orbX - dirX * tailLen, orbY - dirY * tailLen);
        ctx.lineTo(orbX - perpX * radius * 0.8, orbY - perpY * radius * 0.8);
        ctx.closePath();
        ctx.fill();
      }

      // Velocity pulse ring
      const orbSpeed = Math.sqrt(orbVx * orbVx + orbVy * orbVy);
      if (orbSpeed > 50) {
        const pulseR = radius * (1 + Math.min(orbSpeed / 500, 0.5));
        ctx.strokeStyle = `rgba(${c}, ${0.15 * opacity * Math.min(orbSpeed / 300, 1)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(orbX, orbY, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';

      ctx.restore();
    }

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [trailIndex]);

  return (
    <div className="relative h-20 rounded-lg overflow-hidden glass-inset border border-cosmos-border/20">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-1 left-2 text-[8px] text-white/20 font-mono pointer-events-none">
        Live Preview
      </div>
    </div>
  );
}
