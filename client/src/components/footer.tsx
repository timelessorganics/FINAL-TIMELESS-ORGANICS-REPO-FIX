import { Link } from "wouter";
import { InterestForm } from "@/components/InterestForm";

export default function Footer() {
  return (
    <footer className="relative z-50 border-t border-border bg-card/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">Timeless Organics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ancient bronze casting meets botanical art in Kommetjie, South Africa.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              <a href="mailto:david@timeless.organic" className="text-accent-gold hover:underline">
                david@timeless.organic
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              <a href="https://instagram.com/timeless.organic" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">
                @timeless.organic
              </a>
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
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
            <h3 className="font-serif text-lg font-bold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
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

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground mb-3">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified about workshop dates, new castings, and exclusive opportunities.
            </p>
            <InterestForm />
          </div>
        </div>

        <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Timeless Organics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
