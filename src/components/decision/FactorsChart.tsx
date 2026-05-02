import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Factor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

const impactConfig = {
  positive: { color: 'from-emerald-400 to-green-500', label: 'Positive', dot: 'bg-emerald-500' },
  negative: { color: 'from-red-400 to-rose-500', label: 'Negative', dot: 'bg-red-500' },
  neutral: { color: 'from-gray-400 to-gray-500', label: 'Neutral', dot: 'bg-gray-400' },
};

const FactorsChart = ({ factors }: { factors: Factor[] }) => {
  const data = factors.map((f) => ({ name: f.name, weight: Math.round(f.weight * 100), impact: f.impact }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="font-heading font-semibold">Key Factors</h3>
        </div>

        <div className="space-y-3">
          {data.map((factor, i) => {
            const config = impactConfig[factor.impact];
            return (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{factor.name}</span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono ml-2">{factor.weight}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.weight}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[var(--border)]">
          {Object.entries(impactConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <div className={`h-2 w-2 rounded-full ${config.dot}`} />
              {config.label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FactorsChart;
