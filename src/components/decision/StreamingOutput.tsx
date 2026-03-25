import { useDecisionStore } from '@/stores/decisionStore';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const StreamingOutput = () => {
  const { streamedText, isStreaming } = useDecisionStore();

  if (!streamedText && !isStreaming) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Analysis</h3>
        {isStreaming && (
          <div className="flex gap-1 ml-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
          </div>
        )}
      </div>
      <p className="text-foreground/80 leading-relaxed font-mono text-sm">
        {streamedText}
        {isStreaming && <span className="inline-block w-0.5 h-4 bg-primary animate-pulse-glow ml-0.5 align-middle" />}
      </p>
    </motion.div>
  );
};

export default StreamingOutput;
