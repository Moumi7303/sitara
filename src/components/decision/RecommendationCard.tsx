import ConfidenceBar from './ConfidenceBar';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationCardProps {
  recommendation: string;
  confidenceScore: number;
}

const RecommendationCard = ({ recommendation, confidenceScore }: RecommendationCardProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-[var(--accent)] glow-subtle">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Target className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <h3 className="font-heading font-semibold">Recommendation</h3>
      </div>
      <p className="text-[var(--text-secondary)] leading-relaxed mb-5">{recommendation}</p>

      {/* Circular gauge + bar */}
      <div className="flex items-center gap-6">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
            <motion.circle
              cx="32" cy="32" r="28" fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${confidenceScore * 1.759} 175.9`}
              initial={{ strokeDasharray: '0 175.9' }}
              animate={{ strokeDasharray: `${confidenceScore * 1.759} 175.9` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-heading font-bold">{confidenceScore}%</span>
          </div>
        </div>
        <div className="flex-1">
          <ConfidenceBar score={confidenceScore} label="Confidence Score" />
        </div>
      </div>
    </div>
  </motion.div>
);

export default RecommendationCard;
