// The registration form's slide between screens; a plain cut under prefers-reduced-motion.
export const stepVariants = (reduceMotion) =>
  reduceMotion
    ? { enter: { opacity: 1 }, center: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
      };

export const stepTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] };
