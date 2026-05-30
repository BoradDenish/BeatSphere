import { Music, Github, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      <div className="relative px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">MusicStream</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Experience the future of music streaming. High-quality audio, exclusive content, and a community of music lovers.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Github, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="space-y-4">
              {['Browse', 'Trending', 'New Releases', 'Premium'].map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-purple-500 transition-colors duration-200"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Safety Center', 'Community Guidelines', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-purple-500 transition-colors duration-200"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Stay Updated</h4>
            <p className="text-muted-foreground">Subscribe to our newsletter for the latest updates and exclusive offers.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-muted/50 border border-border/50 focus:border-purple-500 outline-none transition-all duration-300"
                />
              </div>
              <button className="h-11 px-6 rounded-xl btn-gradient text-white font-medium hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/20">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} MusicStream. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-purple-500 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-purple-500 transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-purple-500 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
