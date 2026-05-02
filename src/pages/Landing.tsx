import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, BarChart3, ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Deep multi-factor analysis using advanced reasoning models to break down complex decisions.',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    icon: Zap,
    title: 'Real-Time Streaming',
    description: 'Watch the AI think in real-time with streaming responses and progressive result rendering.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Comprehensive risk scoring with mitigation strategies for every recommendation.',
    gradient: 'from-emerald-500/10 to-green-500/10',
  },
  {
    icon: BarChart3,
    title: 'Confidence Scoring',
    description: 'Transparent confidence metrics so you understand the certainty behind each analysis.',
    gradient: 'from-purple-500/10 to-pink-500/10',
  },
];

const stats = [
  { value: 10000, suffix: '+', label: 'Decisions Analyzed' },
  { value: 98, suffix: '%', label: 'User Satisfaction' },
  { value: 5, suffix: 's', label: 'Avg. Response Time' },
  { value: 24, suffix: '/7', label: 'Always Available' },
];

const steps = [
  {
    number: '01',
    title: 'Describe Your Decision',
    description: 'Type in any decision you are facing — career moves, investments, product launches, or personal choices.',
  },
  {
    number: '02',
    title: 'AI Analyzes Factors',
    description: 'Our AI evaluates pros, cons, risks, alternatives, and key factors using advanced reasoning models.',
  },
  {
    number: '03',
    title: 'Get Structured Insights',
    description: 'Receive a comprehensive analysis with confidence scores, risk assessments, and actionable recommendations.',
  },
];

/* Animated counter component */
const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [started, target]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-heading font-bold">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-20 left-[15%] w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative container py-24 md:py-36 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] font-medium text-sm shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              AI Decision Intelligence
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-6 leading-[1.08] text-balance">
              Make decisions with{' '}
              <span className="gradient-text">confidence</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
              Sitara analyzes complex decisions with multi-factor reasoning, risk assessment, and confidence scoring — delivering structured insights in seconds.
            </p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-white glow-primary gap-2 px-8 text-base rounded-xl shadow-lg hover:shadow-xl transition-shadow h-12">
                  Start Deciding <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-secondary)] px-8 text-base rounded-xl h-12">
                  Log In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <Counter target={stat.value} suffix={stat.suffix} />
                <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 bg-[var(--bg)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-balance">
              Engineered for clarity
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Every decision deserves structured thinking. Sitara brings rigorous analysis to your toughest choices.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover rounded-2xl p-6 group"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-[var(--text)]" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-[var(--bg-secondary)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-balance">
              Three steps to better decisions
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Simple process, powerful results.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[22px] top-[48px] w-px h-[calc(100%-48px)] bg-gradient-to-b from-[var(--accent)]/30 to-transparent" />
                )}
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-white font-heading font-bold text-sm shadow-sm">
                    {step.number}
                  </div>
                </div>
                {/* Content */}
                <div className="pt-1">
                  <h3 className="text-lg font-semibold mb-1.5">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">No credit card required</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-balance">
              Ready to decide with confidence?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8">
              Join thousands making better decisions with AI-powered analysis.
            </p>
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-white glow-primary gap-2 px-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow h-12">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
