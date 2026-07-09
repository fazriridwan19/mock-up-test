import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

interface Props {
  label: string;
  jobId: string;
}

export function JobProgressBanner({ label, jobId }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl
                 bg-blue-50 border border-blue-200 text-blue-800 mb-3"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
        <Loader2 size={14} className="text-blue-600 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-blue-500" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <p className="text-xs text-blue-600 mt-0.5">Diproses secara asinkron oleh worker...</p>
      </div>
      <span className="text-xs text-blue-400 font-mono bg-blue-100 px-2 py-0.5 rounded-lg flex-shrink-0">
        #{jobId.slice(-8)}
      </span>
    </motion.div>
  );
}
