import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[var(--accent)]/3 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        {/* Large 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-[120px] md:text-[180px] font-heading font-bold leading-none gradient-text select-none"
        >
          404
        </motion.h1>

        <h2 className="text-xl md:text-2xl font-heading font-semibold mb-3 -mt-4">
          Page not found
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="gradient-primary text-white rounded-xl gap-2 shadow-sm hover:shadow-md transition-shadow h-10 px-6">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-xl gap-2 h-10 px-6 border-[var(--border)]"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
