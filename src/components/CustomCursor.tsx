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

      const target = e.target as HTMLElement | null;
      if (!target) {
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
      }, 380);
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
      {/* Tactile Press Ripple Rings */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          className="fixed h-0 w-0"
        >
          <span
            className={`nepmatics-click-ripple-outer block h-10 w-10 rounded-full border-[1.75px] ${
              ripple.isRight ? 'border-[#D9480F]' : 'border-slate-900/80'
            }`}
          />
          <span className="nepmatics-click-ripple-inner block h-5 w-5 rounded-full border border-[#D9480F]/85" />
        </div>
      ))}

      {/* Custom Multi-State Pointer */}
      <div
        ref={cursorRef}
        style={{ left: 0, top: 0 }}
        className={`fixed transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {variant === 'text' && !rightHandActive ? (
          <svg
            width="20"
            height="24"
            viewBox="0 0 20 24"
            fill="none"
            className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]"
          >
            <path
              d="M6 3H14M10 3V21M7 12H13M6 21H14"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : showHand ? (
          /* Crisp Professional Hand Pointer with Press Compression Animation */
          <div
            className={`relative -translate-x-[7px] -translate-y-[2px] origin-[7px_2px] transition-transform duration-100 ease-out ${
              isPressed ? 'scale-[0.84] translate-y-[1px]' : 'scale-100'
            }`}
          >
            {isPressed && (
              <span className="absolute left-[4px] top-[-1px] h-2.5 w-2.5 rounded-full bg-[#D9480F]/75" />
            )}
            <svg
              width="26"
              height="28"
              viewBox="0 0 26 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_10px_rgba(15,23,42,0.24)]"
            >
              <path
                d="M9 12V4.2C9 2.98 9.98 2 11.2 2C12.42 2 13.4 2.98 13.4 4.2V10.6C13.85 10.22 14.42 10 15.05 10C16.24 10 17.22 10.85 17.42 11.98C17.85 11.68 18.38 11.5 18.95 11.5C20.2 11.5 21.2 12.48 21.25 13.72C21.65 13.52 22.1 13.4 22.58 13.4C23.92 13.4 25 14.48 25 15.82V19.4C25 23.27 21.87 26.4 18 26.4H13.4C10.95 26.4 8.74 25.15 7.47 23.06L3.68 16.84C3.04 15.79 3.4 14.42 4.46 13.81C5.45 13.24 6.72 13.53 7.36 14.48L9 16.9V12Z"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M13.4 10.6V13.8M17.45 11.98V14.4M21.25 13.72V15.4"
                stroke="#0F172A"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {isPressed && <circle cx="11.2" cy="4.2" r="1.4" fill="#D9480F" />}
            </svg>
          </div>
        ) : (
          /* Sharp Minimalist Arrow Pointer */
          <div
            className={`relative origin-top-left transition-transform duration-100 ease-out ${
              isPressed ? 'scale-[0.86] translate-y-[1px]' : 'scale-100'
            }`}
          >
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
                fill="#1E293B"
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
