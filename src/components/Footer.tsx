import { Link } from 'react-router-dom';
import { Brain, Github, Twitter } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'History', to: '/history' },
    { label: 'Settings', to: '/settings' },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
  ],
  Legal: [
    { label: 'Privacy', to: '#' },
    { label: 'Terms', to: '#' },
  ],
};

const Footer = () => {
  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--bg)]">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-heading font-bold">
                Sitara<span className="text-[var(--accent)]">.</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[240px]">
              AI-powered decision intelligence for your most critical choices.
            </p>
            <div className="flex gap-2 mt-4">
              <a
                href="https://github.com/Moumi7303/sitara"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4 text-[var(--text)]">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} Sitara AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
              <Brain className="h-3 w-3" />
              Built with AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
