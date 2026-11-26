import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'pointer' | 'text';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="tab"], select, label[for], summary';
const TEXT_INPUT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rippleIdRef = useRef(0);

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  useEffect(() => {
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncEnabled = () => {
      const active = finePointerQuery.matches && !reducedMotionQuery.matches;
      setEnabled(active);
      if (active) {
        document.documentElement.classList.add('nepmatics-custom-cursor');
      } else {
        document.documentElement.classList.remove('nepmatics-custom-cursor');
      }
    };

    syncEnabled();
    finePointerQuery.addEventListener('change', syncEnabled);
    reducedMotionQuery.addEventListener('change', syncEnabled);

    return () => {
      document.documentElement.classList.remove('nepmatics-custom-cursor');
      finePointerQuery.removeEventListener('change', syncEnabled);
      reducedMotionQuery.removeEventListener('change', syncEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) {
        setVariant('default');
        return;
      }

      if (target.closest(TEXT_INPUT_SELECTOR)) {
        setVariant('text');
      } else if (target.closest(INTERACTIVE_SELECTOR)) {
        setVariant('pointer');
      } else {
        setVariant('default');
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsPressed(true);
      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev.slice(-5), { id, x: e.clientX, y: e.clientY }]);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
      }, 360);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setVisible(false);
      setIsPressed(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Crisp Concentric Circular Click Rings */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          className="fixed h-0 w-0"
        >
          <span className="nepmatics-click-ripple-outer block h-9 w-9 rounded-full border-[1.5px] border-[#D9480F]" />
          <span className="nepmatics-click-ripple-inner block h-5 w-5 rounded-full border border-slate-900/75" />
        </div>
      ))}

      {/* Crisp Multi-State Professional Arrow / Mouse Pointer */}
      <div
        ref={cursorRef}
        style={{ left: 0, top: 0 }}
        className={`fixed transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {variant === 'text' ? (
          <svg
            width="20"
            height="24"
            viewBox="0 0 20 24"
            fill="none"
            className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
          >
            <path
              d="M6 3H14M10 3V21M7 12H13M6 21H14"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div
            className={`relative origin-top-left transition-transform duration-100 ${
              isPressed ? 'scale-90' : variant === 'pointer' ? 'scale-105' : 'scale-100'
            }`}
          >
            {/* Subtle interactive focus halo when hovering clickable items */}
            {variant === 'pointer' && (
              <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-[#D9480F]/45 bg-[#D9480F]/10" />
            )}

            {/* Sharp Geometric Dart Arrow Pointer matching reference silhouette */}
            <svg
              width="24"
              height="26"
              viewBox="0 0 24 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_3px_8px_rgba(15,23,42,0.22)]"
            >
              <path
                d="M2.5 2L19.5 13.8L11.4 15.1L7.3 22.8L2.5 2Z"
                fill={variant === 'pointer' ? '#D9480F' : '#1E293B'}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
