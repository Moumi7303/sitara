import { motion } from 'framer-motion';

interface ConfidenceBarProps {
  score: number;
  label?: string;
}

const ConfidenceBar = ({ score, label }: ConfidenceBarProps) => {
  const color = score >= 75 ? 'bg-success' : score >= 50 ? 'bg-amber' : 'bg-danger';

  return (
    <div className="space-y-1.5">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
        <span className="text-sm font-mono font-semibold w-10 text-right">{score}%</span>
      </div>
    </div>
  );
};

export default ConfidenceBar;
