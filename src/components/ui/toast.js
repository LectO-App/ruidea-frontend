// Lightweight toast notifications. A module-level store + <Toaster /> rendered once at the
// app root; call sites use the imperative `toast.success/error/info(message)` API (shape
// mirrors react-hot-toast). Replaces SweetAlert for transient confirmations — unobtrusive,
// auto-dismissing, never blocking. Errors that belong next to a form use InlineMessage
// instead; toasts are for "it worked" / out-of-context notices.

let toasts = [];
let listeners = [];
let counter = 0;

const emit = () => listeners.forEach((l) => l(toasts));

const remove = (id) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

const add = (message, type, opts = {}) => {
  const id = ++counter;
  // Errors linger a touch longer; everything auto-dismisses unless duration is Infinity.
  const duration = opts.duration != null ? opts.duration : type === "error" ? 5000 : 3000;
  toasts = [...toasts, { id, message, type }];
  emit();
  if (duration !== Infinity) setTimeout(() => remove(id), duration);
  return id;
};

export const toast = {
  success: (message, opts) => add(message, "success", opts),
  error: (message, opts) => add(message, "error", opts),
  info: (message, opts) => add(message, "info", opts),
  dismiss: remove,
};

export const subscribeToasts = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const getToasts = () => toasts;
