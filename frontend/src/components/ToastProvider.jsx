import { createContext, useCallback, useMemo, useState } from "react";

const ToastContext = createContext({ pushToast: () => {} });

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ title, message, tone = "info" }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, title, message, tone }]);

      setTimeout(() => removeToast(id), 3200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  const toneMap = {
    success: "border-teal-400/40 bg-teal-400/10 text-teal-200",
    error: "border-rose-400/40 bg-rose-400/10 text-rose-200",
    info: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
    warn: "border-amber-400/40 bg-amber-400/10 text-amber-100"
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-72 rounded-xl border px-4 py-3 text-sm shadow-card ${
              toneMap[toast.tone] || toneMap.info
            }`}
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && (
              <p className="text-xs opacity-80">{toast.message}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export { ToastContext };
export default ToastProvider;
