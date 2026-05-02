import { useDecisionStore } from '@/stores/decisionStore';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

const StreamingOutput = () => {
  const { streamedText, isStreaming } = useDecisionStore();

  if (!streamedText && !isStreaming) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* AI Avatar */}
      <div className="shrink-0 mt-1">
        <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
          <Brain className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Message bubble */}
      <div className="flex-1 glass-card rounded-2xl rounded-tl-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          <h3 className="font-semibold text-sm">AI Analysis</h3>
          {isStreaming && (
            <div className="flex gap-1 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
            </div>
          )}
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
          {streamedText}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-[var(--accent)] animate-pulse-glow ml-0.5 align-middle rounded-full" />
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default StreamingOutput;
