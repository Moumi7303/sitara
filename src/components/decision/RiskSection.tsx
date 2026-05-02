import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Risk {
  level: 'low' | 'medium' | 'high';
  description: string;
}

const levelConfig = {
  low: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-l-emerald-500/50',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  medium: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-l-amber-500/50',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  high: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-l-red-500/50',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
};

const RiskSection = ({ risks }: { risks: Risk[] }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="font-heading font-semibold">Risk Assessment</h3>
      </div>
      <div className="space-y-3">
        {risks.map((risk, i) => {
          const config = levelConfig[risk.level];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-secondary)] border-l-4 ${config.border}`}
            >
              <Badge variant="outline" className={`shrink-0 capitalize text-xs border ${config.badge}`}>
                {risk.level}
              </Badge>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{risk.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </motion.div>
);

export default RiskSection;
