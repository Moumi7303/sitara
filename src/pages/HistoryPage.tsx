import { useDecisionStore, type DecisionResult } from '@/stores/decisionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ConfidenceBar from '@/components/decision/ConfidenceBar';
import { Clock, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryCard = ({ decision }: { decision: DecisionResult }) => (
  <Card className="hover:border-primary/30 transition-colors">
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-4">
        <CardTitle className="text-base line-clamp-2">{decision.query}</CardTitle>
        <Badge variant="outline" className="shrink-0">{decision.domain}</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground line-clamp-2">{decision.recommendation}</p>
      <ConfidenceBar score={decision.confidenceScore} />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {new Date(decision.createdAt).toLocaleDateString()}
      </div>
    </CardContent>
  </Card>
);

const HistoryPage = () => {
  const { history } = useDecisionStore();

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Decision History</h1>
      <p className="text-muted-foreground mb-8">Review your past analyses and decisions.</p>

      {history.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No decisions yet. Start by analyzing a decision on the dashboard.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {history.map((d) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <HistoryCard decision={d} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
