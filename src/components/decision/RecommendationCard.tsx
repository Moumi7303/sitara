import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfidenceBar from './ConfidenceBar';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationCardProps {
  recommendation: string;
  confidenceScore: number;
}

const RecommendationCard = ({ recommendation, confidenceScore }: RecommendationCardProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="border-primary/20 glow-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground/80 leading-relaxed">{recommendation}</p>
        <ConfidenceBar score={confidenceScore} label="Confidence Score" />
      </CardContent>
    </Card>
  </motion.div>
);

export default RecommendationCard;
