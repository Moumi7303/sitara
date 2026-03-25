import DecisionInput from '@/components/decision/DecisionInput';
import StreamingOutput from '@/components/decision/StreamingOutput';
import RecommendationCard from '@/components/decision/RecommendationCard';
import ProsConsGrid from '@/components/decision/ProsConsGrid';
import RiskSection from '@/components/decision/RiskSection';
import AlternativesList from '@/components/decision/AlternativesList';
import FactorsChart from '@/components/decision/FactorsChart';
import { useDecisionStore } from '@/stores/decisionStore';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { currentDecision, isStreaming } = useDecisionStore();

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Decision Engine</h1>
        <p className="text-muted-foreground">Describe your decision and let AI analyze it for you.</p>
      </div>

      <DecisionInput />
      <StreamingOutput />

      {currentDecision && !isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-6"
        >
          <RecommendationCard
            recommendation={currentDecision.recommendation}
            confidenceScore={currentDecision.confidenceScore}
          />
          <FactorsChart factors={currentDecision.factors} />
          <ProsConsGrid pros={currentDecision.pros} cons={currentDecision.cons} />
          <RiskSection risks={currentDecision.risks} />
          <AlternativesList alternatives={currentDecision.alternatives} />
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
