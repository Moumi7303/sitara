import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProsConsGridProps {
  pros: string[];
  cons: string[];
}

const ProsConsGrid = ({ pros, cons }: ProsConsGridProps) => (
  <div className="grid md:grid-cols-2 gap-4">
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="border-[var(--border)] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsUp className="h-4 w-4 text-[var(--accent)]" />
            Pros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="border-[var(--border)] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsDown className="h-4 w-4 text-[var(--text)]" />
            Cons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--text)] shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default ProsConsGrid;
