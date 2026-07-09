import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface Props {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

const config: Record<AlertType, { Icon: React.ElementType; classes: string }> = {
  success: { Icon: CheckCircle2, classes: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  danger:  { Icon: XCircle,      classes: 'bg-red-50 border-red-200 text-red-800' },
  warning: { Icon: AlertTriangle, classes: 'bg-amber-50 border-amber-200 text-amber-800' },
  info:    { Icon: Info,          classes: 'bg-blue-50 border-blue-200 text-blue-800' },
};

export function AlertMessage({ type, message, onClose, autoDismiss = false, dismissAfter = 4000 }: Props) {
  const [visible, setVisible] = useState(true);
  const { Icon, classes } = config[type];

  useEffect(() => {
    if (!autoDismiss) return;
    const t = setTimeout(() => { setVisible(false); onClose?.(); }, dismissAfter);
    return () => clearTimeout(t);
  }, [autoDismiss, dismissAfter, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl border mb-4', classes)}
          role="alert"
        >
          <Icon size={16} className="flex-shrink-0" />
          <p className="text-sm flex-1">{message}</p>
          <button
            onClick={() => { setVisible(false); onClose?.(); }}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Tutup"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
