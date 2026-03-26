import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Risk {
  level: 'low' | 'medium' | 'high';
  description: string;
}

const levelStyles = {
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-amber/10 text-amber border-amber/20',
  high: 'bg-danger/10 text-danger border-danger/20',
};

const RiskSection = ({ risks }: { risks: Risk[] }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline" className={`shrink-0 capitalize ${levelStyles[risk.level]}`}>
                {risk.level}
              </Badge>
              <p className="text-sm text-foreground/80">{risk.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default RiskSection;
