import { clsx } from 'clsx';

type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate' | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  dot?: boolean;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
};

const dotColors: Record<BadgeColor, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  purple: 'bg-purple-500',
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-500',
};

export function Badge({ children, color = 'blue', dot = false, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClasses[color],
      className,
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[color])} />}
      {children}
    </span>
  );
}
