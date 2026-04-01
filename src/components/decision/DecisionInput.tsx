import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { useDecisionStore, type DecisionResult } from '@/stores/decisionStore';
import { motion } from 'framer-motion';

const domains = ['Business', 'Technology', 'Finance', 'Career', 'Health', 'Education', 'General'];

const mockAnalyze = (query: string, domain: string): DecisionResult => ({
  id: Date.now().toString(),
  query,
  recommendation: `Based on comprehensive analysis, the recommended course of action is to proceed with a measured approach. The key factors favor moving forward with appropriate risk mitigation strategies in place.`,
  confidenceScore: 78,
  factors: [
    { name: 'Market Timing', weight: 0.85, impact: 'positive' },
    { name: 'Resource Availability', weight: 0.72, impact: 'positive' },
    { name: 'Competition Risk', weight: 0.45, impact: 'negative' },
    { name: 'Technical Feasibility', weight: 0.91, impact: 'positive' },
    { name: 'Regulatory Environment', weight: 0.6, impact: 'neutral' },
  ],
  pros: [
    'Strong market demand supports the decision',
    'Technical infrastructure is already in place',
    'First-mover advantage in this segment',
    'Aligns with long-term strategic goals',
  ],
  cons: [
    'Significant upfront investment required',
    'Competitive landscape is intensifying',
    'Regulatory uncertainty in some regions',
  ],
  risks: [
    { level: 'high', description: 'Market volatility could impact ROI within the first 12 months' },
    { level: 'medium', description: 'Talent acquisition challenges may slow execution' },
    { level: 'low', description: 'Minor operational disruptions during transition' },
  ],
  alternatives: [
    { title: 'Phased Rollout', description: 'Start with a pilot program before full commitment', score: 82 },
    { title: 'Strategic Partnership', description: 'Partner with an established player to reduce risk', score: 75 },
    { title: 'Wait & Monitor', description: 'Delay decision and gather more market data', score: 58 },
  ],
  domain,
  createdAt: new Date().toISOString(),
});

const DecisionInput = () => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('General');
  const { isStreaming, setStreaming, setStreamedText, appendStreamedText, setCurrentDecision, addToHistory } = useDecisionStore();

  const handleSubmit = async () => {
    if (!query.trim() || isStreaming) return;

    setStreaming(true);
    setStreamedText('');
    setCurrentDecision(null);

    const result = mockAnalyze(query, domain);

    // Simulate streaming
    const text = result.recommendation;
    for (let i = 0; i < text.length; i++) {
      await new Promise((r) => setTimeout(r, 15));
      appendStreamedText(text[i]);
    }

    setCurrentDecision(result);
    addToHistory(result);
    setStreaming(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="rounded-xl border border-border bg-[var(--card)] p-4 space-y-3">
        <Textarea
          placeholder="Describe your decision... e.g., 'Should I expand my SaaS product to the European market?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[100px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 p-0"
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {domains.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{query.length}/2000</span>
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isStreaming}
              className="gradient-primary text-primary-foreground gap-2"
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DecisionInput;
