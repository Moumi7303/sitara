import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfidenceBar from './ConfidenceBar';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface Alternative {
  title: string;
  description: string;
  score: number;
}

const AlternativesList = ({ alternatives }: { alternatives: Alternative[] }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber" />
          Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alternatives.map((alt, i) => (
            <div key={i} className="p-4 rounded-lg border border-border space-y-2">
              <h4 className="font-semibold">{alt.title}</h4>
              <p className="text-sm text-muted-foreground">{alt.description}</p>
              <ConfidenceBar score={alt.score} label="Suitability" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default AlternativesList;
