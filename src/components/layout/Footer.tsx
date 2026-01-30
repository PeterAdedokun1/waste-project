import { Recycle, Twitter, Linkedin, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Recycle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">WasteFlow</span>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-6">
              The negotiation-based marketplace for sustainable waste trading.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-bold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">How it Works</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Browse Listings</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Post Waste</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Press</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 WasteFlow. All rights reserved.
          </p>
          <p className="text-primary-foreground/50 text-sm">
            Made with 💚 for a sustainable future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
