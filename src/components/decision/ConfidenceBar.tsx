import { motion } from 'framer-motion';

interface ConfidenceBarProps {
  score: number;
  label?: string;
}

const ConfidenceBar = ({ score, label }: ConfidenceBarProps) => {
  const getGradient = (s: number) => {
    if (s >= 75) return 'from-green-400 to-emerald-500';
    if (s >= 50) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">{label}</span>
          <span className="text-xs font-mono font-semibold">{score}%</span>
        </div>
      )}
      <div className="relative h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(score)} relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfidenceBar;
