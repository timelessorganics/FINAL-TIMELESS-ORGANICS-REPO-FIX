import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="relative z-50 border-t border-border bg-card/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-light text-foreground mb-3">Timeless Organics</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 font-light">
              Ancient bronze casting meets botanical art in Kommetjie, South Africa.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-light">
              <a href="mailto:david@timeless.organic" className="text-accent-gold hover:underline">
                david@timeless.organic
              </a>
            </p>
            <p className="text-xs text-muted-foreground font-light">
              <a href="https://instagram.com/timeless.organic" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">
                @timeless.organic
              </a>
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-serif text-lg font-light text-foreground mb-3">Explore</h3>
            <ul className="space-y-2 text-xs sm:text-sm font-light">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Workshops
                </Link>
              </li>
              <li>
                <Link href="/commission" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Commission
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/seasonal-guide" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Seasonal Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif text-lg font-light text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm font-light">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/waiver" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Workshop Waiver
                </Link>
              </li>
              <li>
                <Link href="/wall-of-leaves" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Wall of Leaves
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Founding 100 Value Summary */}
        <div className="py-4 sm:py-6 border-t border-border mb-4 sm:mb-6">
          <p className="text-center text-sm sm:text-base font-serif text-foreground/90 mb-4">The Founding 100 Moment</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-sm sm:text-lg font-bold text-bronze">R25K+</div>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground">Bronze value</p>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold text-accent-gold">50-80%</div>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground">First workshop</p>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold text-patina">20-30%</div>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground">Lifetime discount</p>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold text-bronze">FOREVER</div>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground">Giftable benefits</p>
            </div>
          </div>
        </div>

        <div className="pt-4 sm:pt-6 border-t border-border text-center text-xs sm:text-sm text-muted-foreground font-light">
          <p>&copy; {new Date().getFullYear()} Timeless Organics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
