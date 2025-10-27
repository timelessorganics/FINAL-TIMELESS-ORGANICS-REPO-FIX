import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="relative z-50 border-t border-border bg-card/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">Timeless Organics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ancient bronze casting meets botanical art in Kommetjie, South Africa.
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:hello@timeless.organic" className="text-accent-gold hover:underline">
                hello@timeless.organic
              </a>
            </p>
          </div>

          {/* Legal Links */}
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
                  Workshop Liability Waiver
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/founding100" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Founding 100
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-accent-gold transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Timeless Organics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
