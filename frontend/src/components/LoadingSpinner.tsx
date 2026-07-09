import { motion } from 'framer-motion';

interface Props {
  fullscreen?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ fullscreen = false, text = 'Memuat...', size = 'md' }: Props) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
      {text && <p className="text-slate-500 text-sm">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
}
