import { useEffect, useRef, useState } from 'react';
import { SPIN, spinFrame } from '../data.js';

/**
 * Drag-to-spin pouch. Frames run left side -> front -> right side (no back);
 * SPIN.front is the resting front frame. Frames are cut from the studio clips
 * with ML background removal, so the pouch (base included) stays clean.
 *
 * Motion model (simple so it can't oscillate/overshoot): a `shown` position eases
 * toward a `target` each frame. Dragging sets the target; a flick projects it a
 * bit further (momentum); after an idle the target resets to front. Reduced
 * motion: frame tracks the pointer 1:1, instant return, no intro rock.
 */
export default function SpinPouch() {
  const [idx, setIdx] = useState(SPIN.front);
  const [hinted, setHinted] = useState(false);

  const shownRef = useRef(SPIN.front);
  const targetRef = useRef(SPIN.front);
  const velRef = useRef(0);
  const draggingRef = useRef(false);
  const runningRef = useRef(false);
  const rafRef = useRef(0);
  const introRef = useRef(0);
  const homeRef = useRef(0);
  const reduceRef = useRef(false);
  const renderedRef = useRef(SPIN.front);
  const drag = useRef({ startX: 0, startTarget: SPIN.front, ppf: 6, lastX: 0, lastT: 0 });

  const N = SPIN.count, FRONT = SPIN.front;
  const clamp = (v) => (v < 0 ? 0 : v > N - 1 ? N - 1 : v);
  const render = (v) => {
    const r = Math.round(clamp(v));
    if (r !== renderedRef.current) { renderedRef.current = r; setIdx(r); }
  };

  // preload every frame so scrubbing is instant (front first, then the rest)
  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const imgs = [];
    const front = new Image(); front.src = spinFrame(FRONT); imgs.push(front);
    const load = () => {
      for (let i = 0; i < N; i++) { if (i === FRONT) continue; const im = new Image(); im.src = spinFrame(i); imgs.push(im); }
    };
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1200 });
    else setTimeout(load, 400);
    return () => { imgs.forEach((im) => { im.src = ''; }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loop = () => {
    const t = targetRef.current, s = shownRef.current;
    const ns = s + (t - s) * (draggingRef.current ? 0.35 : 0.18);
    shownRef.current = ns;
    render(ns);
    if (!draggingRef.current && Math.abs(t - ns) < 0.3) {
      shownRef.current = t; render(t); runningRef.current = false; return;
    }
    rafRef.current = requestAnimationFrame(loop);
  };
  const ensureRunning = () => {
    if (!runningRef.current) { runningRef.current = true; rafRef.current = requestAnimationFrame(loop); }
  };
  const scheduleHome = (delay) => {
    clearTimeout(homeRef.current);
    if (reduceRef.current) return;
    homeRef.current = setTimeout(() => { targetRef.current = FRONT; ensureRunning(); }, delay);
  };

  // one-time intro rock to signal it spins
  useEffect(() => {
    if (reduceRef.current) return;
    let start = 0; const AMP = 10, DUR = 2600;
    const tick = (t) => {
      if (!start) start = t;
      const p = (t - start) / DUR;
      if (draggingRef.current || hinted) return;
      if (p >= 1) { shownRef.current = FRONT; targetRef.current = FRONT; render(FRONT); return; }
      const e = Math.sin(p * Math.PI * 2) * (1 - p) * (1 - p);
      const v = FRONT + e * AMP;
      shownRef.current = v; targetRef.current = v; render(v);
      introRef.current = requestAnimationFrame(tick);
    };
    const kick = setTimeout(() => { if (!draggingRef.current && !hinted) introRef.current = requestAnimationFrame(tick); }, 650);
    return () => {
      clearTimeout(kick); clearTimeout(homeRef.current);
      cancelAnimationFrame(introRef.current); cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e) => {
    cancelAnimationFrame(introRef.current);
    clearTimeout(homeRef.current);
    draggingRef.current = true;
    velRef.current = 0;
    const w = e.currentTarget.clientWidth || 480;
    drag.current = {
      startX: e.clientX, startTarget: shownRef.current,
      ppf: Math.max(4, Math.min(8, w / 110)), lastX: e.clientX, lastT: performance.now(),
    };
    targetRef.current = shownRef.current;
    if (!hinted) setHinted(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    ensureRunning();
  };
  const onMove = (e) => {
    if (!draggingRef.current) return;
    const d = drag.current;
    const next = clamp(d.startTarget + (e.clientX - d.startX) / d.ppf);
    targetRef.current = next;
    if (reduceRef.current) { shownRef.current = next; render(next); return; }
    const now = performance.now(), dt = now - d.lastT;
    if (dt > 0) velRef.current = Math.max(-4, Math.min(4, ((e.clientX - d.lastX) / d.ppf) * (16 / dt)));
    d.lastX = e.clientX; d.lastT = now;
  };
  const onUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (reduceRef.current) { targetRef.current = FRONT; shownRef.current = FRONT; render(FRONT); return; }
    targetRef.current = clamp(targetRef.current + velRef.current * 8);
    ensureRunning();
    scheduleHome(850);
  };

  const step = (dir) => {
    cancelAnimationFrame(introRef.current);
    if (!hinted) setHinted(true);
    targetRef.current = clamp(targetRef.current + dir * 3);
    if (reduceRef.current) { shownRef.current = targetRef.current; render(targetRef.current); }
    else ensureRunning();
    scheduleHome(1600);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') {
      e.preventDefault(); clearTimeout(homeRef.current);
      targetRef.current = FRONT;
      if (reduceRef.current) { shownRef.current = FRONT; render(FRONT); } else ensureRunning();
    }
  };

  const pct = idx / (N - 1);

  return (
    <div
      className="spin-pouch"
      role="slider"
      tabIndex={0}
      aria-label="Drag to spin the AMAZTRA pouch and view its sides"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      aria-valuetext={idx === FRONT ? 'Front of pouch' : idx < FRONT ? 'Turned toward left side' : 'Turned toward right side'}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      style={{
        position: 'relative', width: '100%', touchAction: 'pan-y',
        cursor: draggingRef.current ? 'grabbing' : 'grab', outlineOffset: '6px',
      }}
    >
      <span aria-hidden="true" className="spin-glow" style={{
        position: 'absolute', inset: '6% 8% 16%', borderRadius: '50%',
        background: 'radial-gradient(circle at 52% 46%, rgba(193,26,34,.42), transparent 64%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      {/* aspect-ratio box holds the frame; height-capped by the parent so it never clips */}
      <div className="spin-stack" style={{
        position: 'relative', width: '100%', margin: '0 auto',
        aspectRatio: `${SPIN.w} / ${SPIN.h}`,
        animation: 'am-float 9s ease-in-out infinite',
      }}>
        <img src={spinFrame(idx)} alt="AMAZTRA instant coffee pouch" draggable={false}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
            filter: 'drop-shadow(0 30px 44px rgba(0,0,0,.55))',
            userSelect: 'none', WebkitUserDrag: 'none', pointerEvents: 'none',
          }} />
      </div>
      <span aria-hidden="true" className={'spin-hint' + (hinted ? ' is-gone' : '')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7 4 11l4 4" /><path d="M16 7l4 4-4 4" /><path d="M4 11h16" />
        </svg>
        Drag to spin
      </span>
    </div>
  );
}
