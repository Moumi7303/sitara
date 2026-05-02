import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProsConsGridProps {
  pros: string[];
  cons: string[];
}

const ProsConsGrid = ({ pros, cons }: ProsConsGridProps) => (
  <div className="space-y-4">
    {/* Pros */}
    <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500/50">
      <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check className="h-3 w-3 text-emerald-500" />
        </div>
        Pros
      </h3>
      <ul className="space-y-2">
        {pros.map((p, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
          >
            <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
            {p}
          </motion.li>
        ))}
      </ul>
    </div>

    {/* Cons */}
    <div className="glass-card rounded-2xl p-5 border-l-4 border-l-red-500/50">
      <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
        <div className="h-5 w-5 rounded-full bg-red-500/10 flex items-center justify-center">
          <X className="h-3 w-3 text-red-500" />
        </div>
        Cons
      </h3>
      <ul className="space-y-2">
        {cons.map((c, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
          >
            <X className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" />
            {c}
          </motion.li>
        ))}
      </ul>
    </div>
  </div>
);

export default ProsConsGrid;
