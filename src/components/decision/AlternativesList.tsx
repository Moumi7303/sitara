import ConfidenceBar from './ConfidenceBar';
import { Lightbulb, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Alternative {
  title: string;
  description: string;
  score: number;
}

const AlternativesList = ({ alternatives }: { alternatives: Alternative[] }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-purple-500" />
        </div>
        <h3 className="font-heading font-semibold">Alternatives</h3>
      </div>
      <div className="space-y-3">
        {alternatives.map((alt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-2.5 relative"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <h4 className="font-semibold text-sm">{alt.title}</h4>
              </div>
              {i === 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wider shrink-0">
                  <Award className="h-2.5 w-2.5" /> Top Pick
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] pl-8.5">{alt.description}</p>
            <div className="pl-8.5">
              <ConfidenceBar score={alt.score} label="Suitability" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default AlternativesList;
