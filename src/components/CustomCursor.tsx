import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'hand' | 'text';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  isRight: boolean;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="tab"], select, label[for], summary';
const TEXT_INPUT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rippleIdRef = useRef(0);
  const rightTimerRef = useRef<number | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [rightHandActive, setRightHandActive] = useState(false);
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

      const target = e.target as Element | null;
      if (!target || typeof target.closest !== 'function') {
        setVariant('default');
        return;
      }

      if (target.closest(TEXT_INPUT_SELECTOR)) {
        setVariant('text');
      } else if (target.closest(INTERACTIVE_SELECTOR)) {
        setVariant('hand');
      } else {
        setVariant('default');
      }
    };

    const triggerPressRipple = (x: number, y: number, isRight: boolean) => {
      setIsPressed(true);
      if (isRight) {
        setRightHandActive(true);
        if (rightTimerRef.current !== null) {
          window.clearTimeout(rightTimerRef.current);
        }
        rightTimerRef.current = window.setTimeout(() => {
          setRightHandActive(false);
        }, 900);
      }

      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev.slice(-5), { id, x, y, isRight }]);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
      }, 360);
    };

    const handlePointerDown = (e: PointerEvent) => {
      triggerPressRipple(e.clientX, e.clientY, e.button === 2);
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
      if (rightTimerRef.current !== null) {
        window.clearTimeout(rightTimerRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const showHand = rightHandActive || variant === 'hand';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Crisp Concentric Press Ripple Rings */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          className="fixed h-0 w-0"
        >
          <span
            className={`nepmatics-click-ripple-outer block h-8 w-8 rounded-full border-[1.25px] ${
              ripple.isRight ? 'border-[#D9480F]' : 'border-slate-900/75'
            }`}
          />
          <span className="nepmatics-click-ripple-inner block h-4 w-4 rounded-full border border-[#D9480F]/80" />
        </div>
      ))}

      {/* Slim, Precision Multi-State Pointer */}
      <div
        ref={cursorRef}
        style={{ left: 0, top: 0 }}
        className={`fixed transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {variant === 'text' && !rightHandActive ? (
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
          >
            <path
              d="M5 2.5H11M8 2.5V17.5M5.5 10H10.5M5 17.5H11"
              stroke="#0F172A"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        ) : showHand ? (
          /* Slender Professional Hand Pointer with Press Compression */
          <div
            className={`relative -translate-x-[5px] -translate-y-[1px] origin-[5px_1px] transition-transform duration-100 ease-out ${
              isPressed ? 'scale-[0.84] translate-y-[1px]' : 'scale-100'
            }`}
          >
            <svg
              width="20"
              height="22"
              viewBox="0 0 24 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_6px_rgba(15,23,42,0.2)]"
            >
              <path
                d="M8.5 11.2V3.8C8.5 2.81 9.31 2 10.3 2C11.29 2 12.1 2.81 12.1 3.8V10.1C12.48 9.78 12.96 9.6 13.5 9.6C14.5 9.6 15.32 10.32 15.5 11.28C15.86 11.02 16.32 10.86 16.82 10.86C17.88 10.86 18.74 11.7 18.78 12.76C19.12 12.58 19.52 12.48 19.95 12.48C21.08 12.48 22 13.4 22 14.53V18.2C22 21.62 19.22 24.4 15.8 24.4H12.2C10.12 24.4 8.24 23.32 7.18 21.52L3.86 15.92C3.32 15.01 3.63 13.84 4.54 13.32C5.38 12.84 6.45 13.09 6.99 13.9L8.5 16.18V11.2Z"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="1.35"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M12.1 10.1V13M15.52 11.28V13.5M18.78 12.76V14.2"
                stroke="#0F172A"
                strokeWidth="1.15"
                strokeLinecap="round"
              />
              {isPressed && <circle cx="10.3" cy="3.8" r="1.25" fill="#D9480F" />}
            </svg>
          </div>
        ) : (
          /* Slim, Razor-Sharp Arrow Pointer */
          <div
            className={`relative origin-top-left transition-transform duration-100 ease-out ${
              isPressed ? 'scale-[0.86] translate-y-[1px]' : 'scale-100'
            }`}
          >
            <svg
              width="18"
              height="20"
              viewBox="0 0 22 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_5px_rgba(15,23,42,0.2)]"
            >
              <path
                d="M2.2 1.8L17.4 12.4L10.1 13.6L6.4 20.4L2.2 1.8Z"
                fill="#1E293B"
                stroke="#FFFFFF"
                strokeWidth="1.35"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
