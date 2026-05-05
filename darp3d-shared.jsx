// darp3d-shared.jsx — shared primitives for DARP3D
// CSS-rendered 3D objects, product data, icons.

// ── Product catalog ──────────────────────────────────────
const DARP_PRODUCTS = [
  {
    id: 'p1',
    name: 'Blobby Cube',
    tag: 'Sculpture',
    price: 48,
    shape: 'cube',
    colors: ['#FB5607', '#3A86FF', '#FFBE0B', '#06D6A0'],
    materials: ['Matte', 'Gloss', 'Metallic'],
  },
  {
    id: 'p2',
    name: 'Soft Sphere',
    tag: 'Lamp',
    price: 86,
    shape: 'sphere',
    colors: ['#FFBE0B', '#F15BB5', '#FB5607', '#A2D2FF'],
    materials: ['Matte', 'Translucent', 'Frosted'],
  },
  {
    id: 'p3',
    name: 'Twist Donut',
    tag: 'Decor',
    price: 32,
    shape: 'torus',
    colors: ['#F15BB5', '#06D6A0', '#3A86FF', '#FFBE0B'],
    materials: ['Matte', 'Gloss'],
  },
  {
    id: 'p4',
    name: 'Pill Vase',
    tag: 'Vase',
    price: 64,
    shape: 'pill',
    colors: ['#06D6A0', '#FFBE0B', '#FB5607', '#F15BB5'],
    materials: ['Ceramic', 'Matte', 'Gloss'],
  },
  {
    id: 'p5',
    name: 'Stack Tower',
    tag: 'Toy',
    price: 28,
    shape: 'stack',
    colors: ['#3A86FF', '#FB5607', '#F15BB5', '#FFBE0B'],
    materials: ['Matte', 'Gloss'],
  },
  {
    id: 'p6',
    name: 'Wave Bowl',
    tag: 'Tableware',
    price: 42,
    shape: 'bowl',
    colors: ['#A2D2FF', '#06D6A0', '#FFBE0B', '#F15BB5'],
    materials: ['Ceramic', 'Matte'],
  },
];

// ── 3D primitive renderer ────────────────────────────────
// Pure CSS 3D — no SVG. Spinning, with chunky toy shadows.
function ThreeDObject({ shape = 'cube', color = '#FB5607', size = 140, speed = 18, paused = false, material = 'Matte' }) {
  const animDur = `${speed}s`;
  const halfS = size / 2;
  const isGloss = material === 'Gloss';
  const isMetal = material === 'Metallic';
  const isTrans = material === 'Translucent' || material === 'Frosted';

  const sheen = isGloss
    ? 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)'
    : isMetal
    ? 'linear-gradient(135deg, rgba(255,255,255,0.45), rgba(0,0,0,0.18))'
    : 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), rgba(255,255,255,0) 60%)';

  const opacity = isTrans ? 0.78 : 1;

  const faceBase = {
    position: 'absolute',
    background: color,
    backgroundImage: sheen,
    boxShadow: 'inset 0 -8px 18px rgba(0,0,0,0.18), inset 0 4px 10px rgba(255,255,255,0.3)',
    opacity,
  };

  // Cube
  if (shape === 'cube') {
    const s = size;
    const t = s / 2;
    const r = 22;
    return (
      <SceneWrap size={size} animDur={animDur} paused={paused}>
        {[
          { tf: `translateZ(${t}px)` }, // front
          { tf: `rotateY(180deg) translateZ(${t}px)` }, // back
          { tf: `rotateY(90deg) translateZ(${t}px)` }, // right
          { tf: `rotateY(-90deg) translateZ(${t}px)` }, // left
          { tf: `rotateX(90deg) translateZ(${t}px)` }, // top
          { tf: `rotateX(-90deg) translateZ(${t}px)` }, // bottom
        ].map((f, i) => (
          <div key={i} style={{ ...faceBase, width: s, height: s, borderRadius: r, transform: f.tf, left: -t, top: -t }} />
        ))}
      </SceneWrap>
    );
  }

  // Sphere — stacked layers + radial gradient
  if (shape === 'sphere') {
    return (
      <SceneWrap size={size} animDur={animDur} paused={paused}>
        <div style={{
          position: 'absolute',
          width: size, height: size,
          left: -halfS, top: -halfS,
          borderRadius: '50%',
          background: `radial-gradient(circle at 32% 28%, ${lighten(color, 0.45)}, ${color} 50%, ${darken(color, 0.25)} 100%)`,
          boxShadow: `inset -16px -22px 30px ${darken(color, 0.35)}, inset 12px 14px 22px ${lighten(color, 0.5)}`,
          opacity,
        }} />
        {/* Specular highlight */}
        <div style={{
          position: 'absolute',
          width: size * 0.35, height: size * 0.22,
          left: -size * 0.05, top: -size * 0.3,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)',
          filter: 'blur(2px)',
          transform: 'rotate(-22deg)',
        }} />
      </SceneWrap>
    );
  }

  // Torus — using stacked rings with rotation
  if (shape === 'torus') {
    const ringW = size;
    const ringT = size * 0.32;
    return (
      <SceneWrap size={size} animDur={animDur} paused={paused}>
        <div style={{
          position: 'absolute',
          width: ringW, height: ringT,
          left: -ringW / 2, top: -ringT / 2,
          borderRadius: ringT / 2,
          background: `linear-gradient(180deg, ${lighten(color, 0.4)} 0%, ${color} 45%, ${darken(color, 0.3)} 100%)`,
          boxShadow: `inset 0 -10px 16px ${darken(color, 0.35)}, inset 0 8px 14px ${lighten(color, 0.4)}`,
          transform: 'rotateX(70deg)',
          opacity,
        }} />
        {/* Hole shadow */}
        <div style={{
          position: 'absolute',
          width: ringW * 0.42, height: ringT * 0.42,
          left: -ringW * 0.21, top: -ringT * 0.21,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.18)',
          filter: 'blur(6px)',
          transform: 'rotateX(70deg)',
        }} />
      </SceneWrap>
    );
  }

  // Pill (capsule) — rotating vertical pill
  if (shape === 'pill') {
    const w = size * 0.55;
    const h = size;
    return (
      <SceneWrap size={size} animDur={animDur} paused={paused}>
        <div style={{
          position: 'absolute',
          width: w, height: h,
          left: -w / 2, top: -h / 2,
          borderRadius: w / 2,
          background: `linear-gradient(95deg, ${darken(color, 0.18)} 0%, ${color} 45%, ${lighten(color, 0.45)} 70%, ${color} 100%)`,
          boxShadow: `inset -10px 0 18px ${darken(color, 0.3)}, inset 8px 0 14px ${lighten(color, 0.35)}`,
          opacity,
        }} />
        <div style={{
          position: 'absolute',
          width: w * 0.18, height: h * 0.55,
          left: -w * 0.32, top: -h * 0.28,
          borderRadius: w / 2,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.05))',
          filter: 'blur(3px)',
        }} />
      </SceneWrap>
    );
  }

  // Stack — three rounded discs of decreasing size
  if (shape === 'stack') {
    const layers = [
      { w: size, h: size * 0.28, y: size * 0.38, c: color },
      { w: size * 0.78, h: size * 0.26, y: size * 0.08, c: lighten(color, 0.18) },
      { w: size * 0.55, h: size * 0.24, y: -size * 0.2, c: darken(color, 0.18) },
    ];
    return (
      <SceneWrap size={size} animDur={animDur} paused={paused}>
        {layers.map((L, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: L.w, height: L.h,
            left: -L.w / 2, top: L.y,
            borderRadius: L.h,
            background: `linear-gradient(180deg, ${lighten(L.c, 0.4)} 0%, ${L.c} 50%, ${darken(L.c, 0.3)} 100%)`,
            boxShadow: `inset 0 -6px 12px ${darken(L.c, 0.3)}, inset 0 4px 8px ${lighten(L.c, 0.3)}`,
            opacity,
          }} />
        ))}
      </SceneWrap>
    );
  }

  // Bowl — half-sphere + opening
  if (shape === 'bowl') {
    return (
      <SceneWrap size={size} animDur={animDur} paused={paused}>
        <div style={{
          position: 'absolute',
          width: size, height: size * 0.65,
          left: -size / 2, top: -size * 0.1,
          borderRadius: `${size / 2}px ${size / 2}px ${size / 2}px ${size / 2}px / ${size * 0.15}px ${size * 0.15}px ${size * 0.5}px ${size * 0.5}px`,
          background: `linear-gradient(180deg, ${lighten(color, 0.3)} 0%, ${color} 40%, ${darken(color, 0.35)} 100%)`,
          boxShadow: `inset 0 -16px 24px ${darken(color, 0.35)}, inset 0 8px 14px ${lighten(color, 0.3)}`,
          opacity,
        }} />
        <div style={{
          position: 'absolute',
          width: size * 0.92, height: size * 0.18,
          left: -size * 0.46, top: -size * 0.18,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${darken(color, 0.4)}, ${darken(color, 0.6)})`,
        }} />
      </SceneWrap>
    );
  }

  return null;
}

function SceneWrap({ size, animDur, paused, children }) {
  return (
    <div style={{
      width: size, height: size,
      perspective: size * 5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        width: 0, height: 0,
        transformStyle: 'preserve-3d',
        animation: `darpSpin ${animDur} linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {children}
      </div>
      {/* Floor shadow */}
      <div style={{
        position: 'absolute',
        bottom: -size * 0.08,
        width: size * 0.85, height: size * 0.12,
        background: 'radial-gradient(ellipse, rgba(20,20,40,0.32), rgba(20,20,40,0) 70%)',
        filter: 'blur(4px)',
      }} />
    </div>
  );
}

// ── Color helpers ────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
function lighten(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
function darken(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

// ── Icons (inline SVG) ──────────────────────────────────
const Icon = {
  cart: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
      <path d="M3 4h2l2.5 12h12l2-8H6"/>
    </svg>
  ),
  search: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>
    </svg>
  ),
  heart: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
    </svg>
  ),
  plus: ({ s = 16 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  minus: ({ s = 16 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M5 12h14"/>
    </svg>
  ),
  close: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  arrow: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  star: ({ s = 14 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4L1.5 9.6 9 8.9z"/>
    </svg>
  ),
  sparkle: ({ s = 16 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z"/>
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>
    </svg>
  ),
  truck: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7"/>
      <circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>
    </svg>
  ),
  printer: ({ s = 18 } = {}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v6H6zM4 9h16v8h-3v4H7v-4H4zM7 21v-6h10v6"/>
    </svg>
  ),
};

// ── Background blobs (decorative) ─────────────────────────
function BgBlob({ color, size, top, left, blur = 60, opacity = 0.7 }) {
  return (
    <div style={{
      position: 'absolute',
      width: size, height: size,
      top, left,
      borderRadius: '50%',
      background: color,
      filter: `blur(${blur}px)`,
      opacity,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}

Object.assign(window, {
  DARP_PRODUCTS, ThreeDObject, Icon, BgBlob, lighten, darken,
});
