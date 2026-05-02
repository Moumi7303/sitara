import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useDecisionStore, mapBackendDecision, type DecisionResult } from '@/stores/decisionStore';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const domains = ['Career', 'Tech', 'Business', 'Personal'];

const DecisionInput = () => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('General');
  const { isStreaming, setStreaming, setStreamedText, appendStreamedText, setCurrentDecision, addToHistory } = useDecisionStore();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!query.trim() || isStreaming) return;
    
    setStreaming(true);
    setStreamedText('');
    setCurrentDecision(null);

    try {
      const response = await api.post('/decision', {
        query,
        domain: domain.toLowerCase(),
      });

      const data = response.data.decision;

      // Use shared mapping utility from the store
      const result = mapBackendDecision(data);

      if (!result) {
        throw new Error('Decision processing failed — no output received.');
      }

      // Simulate streaming for the recommendation text to keep the "alive" feel
      const text = result.recommendation;
      for (let i = 0; i < text.length; i++) {
        await new Promise((r) => setTimeout(r, 10));
        appendStreamedText(text[i]);
      }

      setCurrentDecision(result);
      addToHistory(result);
      setQuery('');
    } catch (error: any) {
      console.error("Analysis failed", error);
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.error || error.response?.data?.message || "Ensure you have an API key configured in Settings.",
        variant: "destructive"
      });
    } finally {
      setStreaming(false);
    }
  };

  const charPercent = Math.min((query.length / 2000) * 100, 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card rounded-2xl p-5 space-y-4 focus-within:border-[var(--accent)]/30 transition-colors">
        <Textarea
          placeholder="Describe your decision... e.g., 'Should I expand my SaaS product to the European market?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[100px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 p-0 placeholder:text-[var(--text-secondary)]/50"
          maxLength={2000}
        />

        {/* Domain pills */}
        <div className="flex flex-wrap gap-1.5">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                domain === d
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          {/* Circular char counter */}
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" strokeWidth="2" />
                <circle
                  cx="12" cy="12" r="10" fill="none"
                  stroke={charPercent > 90 ? 'var(--danger)' : 'var(--accent)'}
                  strokeWidth="2"
                  strokeDasharray={`${charPercent * 0.628} 62.8`}
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">{query.length}/2000</span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={query.trim().length < 3 || isStreaming}
            className="gradient-primary text-white gap-2 rounded-xl shadow-sm hover:shadow-md transition-all h-10 px-5"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Analyze
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DecisionInput;
