/* ─── Preset Thumbnail ─────────────────────────────────────────────────────
 *  Renders a mini static visual snapshot of a preset or bundle's
 *  trail appearance using a lightweight canvas simulation.
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, memo } from 'react';
import { DEFAULT_TRAIL, hexToRgb, lerpColor } from '../shared/settings';
import type { TrailSettings } from '../shared/types';

function toRgb(hex: string): string {
  const r = hexToRgb(hex);
  return `${r.r}, ${r.g}, ${r.b}`;
}

function getColor(s: TrailSettings, t: number): string {
  if (s.colorMode === 'rainbow') return `hsl(${(t * 0.06) % 360}, 85%, 62%)`;
  if (s.colorMode === 'gradient') {
    const phase = (Math.sin(t * 0.005) + 1) * 0.5;
    return lerpColor(s.colorPrimary, s.colorSecondary, phase);
  }
  if (s.colorMode === 'palette') {
    const phase = (Math.sin(t * 0.004) + 1) * 0.5;
    return lerpColor(s.colorSecondary, s.colorTertiary, phase);
  }
  if (s.colorMode === 'pulse') {
    const pulse = (Math.sin(t * 0.003) + 1) * 0.5;
    const brightness = 0.35 + pulse * 0.65;
    const blended = lerpColor(s.colorPrimary, s.colorSecondary, pulse * 0.4);
    const rgb = hexToRgb(blended);
    return `rgb(${Math.round(rgb.r * brightness)}, ${Math.round(rgb.g * brightness)}, ${Math.round(rgb.b * brightness)})`;
  }
  return s.colorPrimary;
}

interface PresetThumbnailProps {
  settings: Partial<TrailSettings>;
  width?: number;
  height?: number;
  multiTrails?: Partial<TrailSettings>[];
}

function PresetThumbnailBase({ settings, width = 120, height = 40, multiTrails }: PresetThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const fullSettings: TrailSettings = { ...DEFAULT_TRAIL, ...settings };
    const trails = multiTrails
      ? multiTrails.map((t) => ({ ...DEFAULT_TRAIL, ...t }))
      : [fullSettings];

    let frame = 0;
    let animId = 0;

    function draw() {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.globalCompositeOperation = 'lighter';

      const time = frame * 16;
      const cx = width * 0.5;
      const cy = height * 0.5;
      const rx = width * 0.35;
      const ry = height * 0.25;

      for (let ti = 0; ti < trails.length; ti++) {
        const s = trails[ti];
        const phaseOffset = (ti / trails.length) * Math.PI * 2;
        const color = getColor(s, time + ti * 1000);
        const c = toRgb(color);
        const opacity = s.opacity;

        const points: { x: number; y: number }[] = [];
        const segCount = Math.min(s.trailLength, 24);
        for (let p = 0; p < segCount; p++) {
          const t = (frame - p * 1.5) * 0.015;
          const x = cx + Math.cos(t + phaseOffset) * rx * (0.8 + ti * 0.1);
          const y = cy + Math.sin(t * 1.3 + phaseOffset) * ry;
          points.push({ x, y });
        }

        for (let p = 1; p < points.length; p++) {
          const fadeT = p / points.length;
          const fade = s.trailFadeCurve > 0.5
            ? Math.pow(fadeT, 1 + (s.trailFadeCurve - 0.5) * 4)
            : fadeT * (1 - s.trailFadeCurve * 0.5);
          const lineW = Math.max(0.5, fade * s.trailWidth * 0.3);

          if (s.renderMode === 'dots') {
            ctx.fillStyle = `rgba(${c}, ${fade * opacity * 0.7})`;
            ctx.beginPath();
            ctx.arc(points[p].x, points[p].y, lineW * 0.6, 0, Math.PI * 2);
            ctx.fill();
          } else if (s.renderMode === 'glowing-orbs') {
            const r = lineW * 1.1;
            const g = ctx.createRadialGradient(points[p].x, points[p].y, 0, points[p].x, points[p].y, r);
            g.addColorStop(0, `rgba(${c}, ${fade * opacity * 0.85})`);
            g.addColorStop(1, `rgba(${c}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(points[p].x, points[p].y, r, 0, Math.PI * 2);
            ctx.fill();
          } else if (s.renderMode === 'ribbon') {
            const perpX = -(points[p].y - points[p - 1].y);
            const perpY = points[p].x - points[p - 1].x;
            const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
            const halfW = lineW * 1.5;
            const ox = (perpX / plen) * halfW;
            const oy = (perpY / plen) * halfW;
            ctx.beginPath();
            ctx.moveTo(points[p - 1].x + ox, points[p - 1].y + oy);
            ctx.lineTo(points[p].x + ox, points[p].y + oy);
            ctx.lineTo(points[p].x - ox, points[p].y - oy);
            ctx.lineTo(points[p - 1].x - ox, points[p - 1].y - oy);
            ctx.closePath();
            ctx.fillStyle = `rgba(${c}, ${fade * opacity * 0.5})`;
            ctx.fill();
          } else if (s.renderMode === 'energy-streams') {
            const perpX = -(points[p].y - points[p - 1].y);
            const perpY = points[p].x - points[p - 1].x;
            const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
            const off = Math.sin(p * 0.3 + time * 0.005) * 2 * fade;
            ctx.beginPath();
            ctx.moveTo(points[p - 1].x + (perpX / plen) * off, points[p - 1].y + (perpY / plen) * off);
            ctx.lineTo(points[p].x + (perpX / plen) * off, points[p].y + (perpY / plen) * off);
            ctx.strokeStyle = `rgba(${c}, ${fade * opacity * 0.6})`;
            ctx.lineWidth = lineW;
            ctx.lineCap = 'round';
            ctx.stroke();
          } else if (s.renderMode === 'plasma-bolt') {
            const perpX = -(points[p].y - points[p - 1].y);
            const perpY = points[p].x - points[p - 1].x;
            const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
            const jit = Math.sin(p * 1.7 + time * 0.012) * 3 * fade;
            ctx.strokeStyle = `rgba(${c}, ${fade * opacity * 0.5})`;
            ctx.lineWidth = lineW * 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(points[p - 1].x + (perpX / plen) * jit, points[p - 1].y + (perpY / plen) * jit);
            ctx.lineTo(points[p].x + (perpX / plen) * jit, points[p].y + (perpY / plen) * jit);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,255,255,${fade * opacity * 0.5})`;
            ctx.lineWidth = lineW * 0.7;
            ctx.beginPath();
            ctx.moveTo(points[p - 1].x, points[p - 1].y);
            ctx.lineTo(points[p].x, points[p].y);
            ctx.stroke();
          } else if (s.renderMode === 'shockwave') {
            const segT = 1 - fade;
            const ringR = lineW * (1 + segT * 3);
            ctx.strokeStyle = `rgba(${c}, ${fade * opacity * 0.5})`;
            ctx.lineWidth = Math.max(0.5, lineW * 0.6);
            ctx.beginPath();
            ctx.arc(points[p].x, points[p].y, ringR, 0, Math.PI * 2);
            ctx.stroke();
          } else if (s.renderMode === 'fireflies') {
            const ffR = lineW * 0.9;
            const blink = 0.4 + 0.6 * Math.abs(Math.sin(p * 0.7 + time * 0.003));
            const ffAlpha = fade * opacity * blink * 0.8;
            const g = ctx.createRadialGradient(points[p].x, points[p].y, 0, points[p].x, points[p].y, ffR * 2);
            g.addColorStop(0, `rgba(${c}, ${ffAlpha})`);
            g.addColorStop(0.3, `rgba(${c}, ${ffAlpha * 0.5})`);
            g.addColorStop(1, `rgba(${c}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(points[p].x, points[p].y, ffR * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 255, ${ffAlpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(points[p].x, points[p].y, ffR * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else if (s.renderMode === 'spiral') {
            const angle = p * 0.5 + time * 0.0025;
            const spiralR = lineW * (1 + fade * 2);
            const ox = Math.cos(angle) * spiralR;
            const oy = Math.sin(angle) * spiralR;
            const g = ctx.createRadialGradient(points[p].x + ox, points[p].y + oy, 0, points[p].x + ox, points[p].y + oy, lineW);
            g.addColorStop(0, `rgba(${c}, ${fade * opacity * 0.8})`);
            g.addColorStop(1, `rgba(${c}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(points[p].x + ox, points[p].y + oy, lineW, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(${c}, ${fade * opacity * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(points[p - 1].x, points[p - 1].y);
            ctx.lineTo(points[p].x + ox, points[p].y + oy);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(points[p - 1].x, points[p - 1].y);
            ctx.lineTo(points[p].x, points[p].y);
            ctx.strokeStyle = `rgba(${c}, ${fade * opacity * 0.75})`;
            ctx.lineWidth = lineW;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }

        // Orb at the tip
        const tip = points[0];
        if (tip) {
          const r = s.orbRadius * 0.22;
          const glowR = r * (2 + s.bloomStrength * 2);
          const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, glowR);
          glow.addColorStop(0, `rgba(${c}, ${s.glowIntensity * 0.5 * opacity})`);
          glow.addColorStop(1, `rgba(${c}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, glowR, 0, Math.PI * 2);
          ctx.fill();

          const og = ctx.createRadialGradient(tip.x - r * 0.2, tip.y - r * 0.2, 0, tip.x, tip.y, r);
          og.addColorStop(0, `rgba(255,255,255,${0.8 * opacity})`);
          og.addColorStop(0.2, `rgba(${c}, ${0.9 * opacity})`);
          og.addColorStop(1, `rgba(${c}, 0)`);
          ctx.fillStyle = og;
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, r, 0, Math.PI * 2);
          ctx.fill();

          if (s.cometMode && points.length > 2) {
            const prev = points[1];
            const dx = tip.x - prev.x;
            const dy = tip.y - prev.y;
            const dlen = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const dirX = dx / dlen;
            const dirY = dy / dlen;
            const tailLen = Math.min(dlen * 3, 20);
            const tailGrad = ctx.createLinearGradient(tip.x, tip.y, tip.x - dirX * tailLen, tip.y - dirY * tailLen);
            tailGrad.addColorStop(0, `rgba(${c}, ${0.4 * opacity})`);
            tailGrad.addColorStop(1, `rgba(${c}, 0)`);
            ctx.fillStyle = tailGrad;
            ctx.beginPath();
            const perpX = -dirY;
            const perpY = dirX;
            ctx.moveTo(tip.x + perpX * r * 0.8, tip.y + perpY * r * 0.8);
            ctx.lineTo(tip.x - dirX * tailLen, tip.y - dirY * tailLen);
            ctx.lineTo(tip.x - perpX * r * 0.8, tip.y - perpY * r * 0.8);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      frame++;
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [settings, width, height, multiTrails]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="rounded-md"
    />
  );
}

export const PresetThumbnail = memo(PresetThumbnailBase);
