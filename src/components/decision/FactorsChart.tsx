import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Factor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

const impactColor = {
  positive: 'hsl(152, 60%, 42%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(220, 10%, 46%)',
};

const FactorsChart = ({ factors }: { factors: Factor[] }) => {
  const data = factors.map((f) => ({ name: f.name, weight: Math.round(f.weight * 100), impact: f.impact }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Key Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 88%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={impactColor[entry.impact]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FactorsChart;
