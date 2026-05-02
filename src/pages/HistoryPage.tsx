import { useState, useEffect } from 'react';
import { useDecisionStore, type DecisionResult } from '@/stores/decisionStore';
import { Badge } from '@/components/ui/badge';
import ConfidenceBar from '@/components/decision/ConfidenceBar';
import { Clock, Brain, Search, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';

const domainColors: Record<string, string> = {
  career: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  tech: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  business: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  personal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const domainLabels: Record<string, string> = {
  career: 'Career',
  tech: 'Tech',
  business: 'Business',
  personal: 'Personal',
};

const HistoryCard = ({ decision, index }: { decision: DecisionResult; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="glass-card-hover rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold line-clamp-2 flex-1">{decision.query}</h3>
        <Badge variant="outline" className={`shrink-0 text-xs border ${domainColors[decision.domain] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'}`}>
          {domainLabels[decision.domain] || decision.domain}
        </Badge>
      </div>
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{decision.recommendation}</p>
      <ConfidenceBar score={decision.confidenceScore} />
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <Clock className="h-3 w-3" />
        {new Date(decision.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  </motion.div>
);

const HistoryPage = () => {
  const { history, isLoadingHistory, historyError, fetchHistory } = useDecisionStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch history from backend API on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = searchQuery.trim()
    ? history.filter((d) => d.query.toLowerCase().includes(searchQuery.toLowerCase()) || d.domain.toLowerCase().includes(searchQuery.toLowerCase()))
    : history;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-1">Decision History</h1>
            <p className="text-[var(--text-secondary)]">Review your past analyses and decisions.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchHistory()}
            disabled={isLoadingHistory}
            className="rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {history.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        )}

        {/* Loading State */}
        {isLoadingHistory && history.length === 0 && (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] text-sm">Loading your decision history...</p>
          </div>
        )}

        {/* Error State */}
        {historyError && !isLoadingHistory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-[var(--text-secondary)] mb-3">Failed to load history</p>
            <Button size="sm" variant="outline" onClick={() => fetchHistory()} className="rounded-xl gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoadingHistory && !historyError && filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-[var(--text-secondary)]/30" />
            </div>
            <p className="text-[var(--text-secondary)] mb-1 font-medium">
              {searchQuery ? 'No matching decisions found' : 'No decisions yet'}
            </p>
            <p className="text-sm text-[var(--text-secondary)]/70 mb-6">
              {searchQuery ? 'Try a different search term' : 'Start by analyzing a decision on the dashboard'}
            </p>
            {!searchQuery && (
              <Link to="/dashboard">
                <Button size="sm" className="gradient-primary text-white rounded-xl gap-1.5">
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          !isLoadingHistory && !historyError && (
            <div className="grid gap-4">
              {filtered.map((d, i) => (
                <HistoryCard key={d.id} decision={d} index={i} />
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;

