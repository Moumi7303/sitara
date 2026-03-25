import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, BarChart3, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Deep multi-factor analysis using advanced reasoning models to break down complex decisions.',
  },
  {
    icon: Zap,
    title: 'Real-Time Streaming',
    description: 'Watch the AI think in real-time with streaming responses and progressive result rendering.',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Comprehensive risk scoring with mitigation strategies for every recommendation.',
  },
  {
    icon: BarChart3,
    title: 'Confidence Scoring',
    description: 'Transparent confidence metrics so you understand the certainty behind each analysis.',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container py-32 md:py-44">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground/80 text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI Decision Intelligence
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary-foreground mb-6 leading-[1.1]">
              Make <span className="text-gradient">smarter</span> decisions,{' '}
              <span className="text-gradient">faster</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Sitara analyzes complex decisions with multi-factor reasoning, risk assessment, and confidence scoring — delivering structured insights in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground glow-primary gap-2 px-8 text-base">
                  Start Deciding <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base">
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-surface">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Engineered for clarity</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every decision deserves structured thinking. Sitara brings rigorous analysis to your toughest choices.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:glow-primary transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to decide with confidence?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands making better decisions with AI-powered analysis.
            </p>
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground glow-primary gap-2 px-8">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span>Sitara AI Decision Engine</span>
          </div>
          <p>© 2026 Sitara. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
