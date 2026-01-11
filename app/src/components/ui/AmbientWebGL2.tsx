import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/utils/utils';

type AmbientWebGL2Props = {
  className?: string;
  opacity?: number; // CSS opacity
  mouse?: { x: number; y: number }; // 0..1
  paused?: boolean;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vert = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const frag = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_boost;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.55;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 m = (u_mouse - 0.5);
  p += m * 0.25;

  float t = u_time * 0.08;
  float n = fbm(p * 2.4 + vec2(0.0, t));
  float n2 = fbm(p * 5.0 - vec2(t, 0.0));
  float mixv = smoothstep(0.25, 0.9, n);
  float glow = smoothstep(0.2, 1.0, n2) * 0.65;

  vec3 cA = vec3(0.10, 0.75, 1.00);
  vec3 cB = vec3(0.65, 0.20, 1.00);
  vec3 cC = vec3(0.12, 0.95, 0.55);
  vec3 col = mix(cB, cA, mixv);
  col = mix(col, cC, glow * 0.35);

  float vign = smoothstep(1.15, 0.25, length(p));
  float alpha = (0.55 + 0.45 * u_boost) * vign;
  outColor = vec4(col, alpha);
}
`;

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) => {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

export function AmbientWebGL2({
  className,
  opacity = 0.12,
  mouse = { x: 0.5, y: 0.5 },
  paused = false,
}: AmbientWebGL2Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const mouseRef = useRef(mouse);

  mouseRef.current = mouse;

  const enabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (prefersReducedMotion()) return false;
    return true;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, vert);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;
    const program = createProgram(gl, vs, fs);
    if (!program) return;

    gl.useProgram(program);
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uBoost = gl.getUniformLocation(program, 'u_boost');

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    setSize();
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    const onVis = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!document.hidden && !rafRef.current) {
        startedAtRef.current = performance.now();
        rafRef.current = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    const frame = (t: number) => {
      if (paused) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      if (!startedAtRef.current) startedAtRef.current = t;
      const time = (t - startedAtRef.current) / 1000;

      const m = mouseRef.current;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, m.x, 1.0 - m.y);
      gl.uniform1f(uBoost, 1.0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(frame);
    };

    startedAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, paused]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={{ opacity }}
    />
  );
}

