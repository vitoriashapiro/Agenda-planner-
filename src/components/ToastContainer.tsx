/**
 * Contêiner de Notificações Toast Flutuantes Delicadas
 */
import React from 'react';
import { CheckCircle2, Info, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePlanner();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-planner border text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-200 ${
              isSuccess
                ? 'bg-[#F9EAF0]/95 text-[#7A3F53] border-[#D9A2B5]'
                : isError
                ? 'bg-rose-50/95 text-rose-800 border-rose-200'
                : isWarning
                ? 'bg-amber-50/95 text-amber-800 border-amber-200'
                : 'bg-white/95 text-[#75656D] border-[#F4DCE5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#B26E86] shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-[#B26E86] shrink-0" />}
              <span className="leading-snug">{toast.message}</span>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 text-[#75656D]/70 transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
