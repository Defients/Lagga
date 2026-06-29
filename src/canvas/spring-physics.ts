import { SPRING_STIFFNESS, SPRING_DAMPING, MAX_DT } from "../engine/constants";

export interface SpringState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function createSpringState(x: number, y: number): SpringState {
  return { x, y, vx: 0, vy: 0 };
}

export function updateSpring(
  state: SpringState,
  targetX: number,
  targetY: number,
  dtSeconds: number
): void {
  const dt = Math.min(dtSeconds, MAX_DT);

  const dx = targetX - state.x;
  const dy = targetY - state.y;

  const ax = dx * SPRING_STIFFNESS - state.vx * SPRING_DAMPING;
  const ay = dy * SPRING_STIFFNESS - state.vy * SPRING_DAMPING;

  state.vx += ax * dt;
  state.vy += ay * dt;

  state.x += state.vx * dt;
  state.y += state.vy * dt;
}
