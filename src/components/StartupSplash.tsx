import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export const DRK_STARTUP_IMAGE_PATH =
  '/assets/aistudio/a_clean_transparent_background_png_style_illustrat_7ae40feb.png';

interface StartupSplashProps {
  visible: boolean;
  onComplete: () => void;
}

export const StartupSplash: React.FC<StartupSplashProps> = ({
  visible,
  onComplete,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const durationMs = prefersReducedMotion ? 900 : 2200;
    const timer = window.setTimeout(() => {
      onComplete();
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [visible, onComplete, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Bienvenida Proyecto DRK"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center px-6 py-8"
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.88 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-sm w-full"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { y: [0, -7, 0] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 1.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm flex items-center justify-center"
            >
              {!imgError ? (
                <img
                  src={DRK_STARTUP_IMAGE_PATH}
                  alt="Proyecto DRK"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-display text-2xl font-bold text-slate-800">
                  Proyecto DRK
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 space-y-1.5"
            >
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
                Proyecto DRK
              </h2>
              <p className="text-xs text-slate-600">
                Simulador de Aguinaldo y Prestaciones · CCT IMSS-SNTSS 2025-2027
              </p>
            </motion.div>

            {/* Compositor-only progress bar via scaleX */}
            <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden mt-5">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0.8 : 2.0,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: 'left center' }}
                className="h-full w-full bg-emerald-800"
              />
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="mt-5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Entrar al simulador
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
