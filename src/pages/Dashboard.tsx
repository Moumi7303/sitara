import DecisionInput from '@/components/decision/DecisionInput';
import StreamingOutput from '@/components/decision/StreamingOutput';
import RecommendationCard from '@/components/decision/RecommendationCard';
import ProsConsGrid from '@/components/decision/ProsConsGrid';
import RiskSection from '@/components/decision/RiskSection';
import AlternativesList from '@/components/decision/AlternativesList';
import FactorsChart from '@/components/decision/FactorsChart';
import { useDecisionStore } from '@/stores/decisionStore';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { currentDecision, isStreaming } = useDecisionStore();
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-1">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-[var(--text-secondary)] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Describe your decision and let AI analyze it
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* Decision Input */}
        <DecisionInput />
        <StreamingOutput />

        {/* Results */}
        {currentDecision && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Analysis Results
            </h2>
            <RecommendationCard
              recommendation={currentDecision.recommendation}
              confidenceScore={currentDecision.confidenceScore}
            />
            <div className="grid md:grid-cols-2 gap-5">
              <FactorsChart factors={currentDecision.factors} />
              <ProsConsGrid pros={currentDecision.pros} cons={currentDecision.cons} />
            </div>
            <RiskSection risks={currentDecision.risks} />
            <AlternativesList alternatives={currentDecision.alternatives} />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
