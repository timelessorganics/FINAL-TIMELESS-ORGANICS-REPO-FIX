import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShieldCheck, LogIn, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { signOut, redirectToSignIn } from "@/lib/auth-helpers";

interface HeaderProps {
  variant?: "default" | "checkout";
  showNav?: boolean;
  backHref?: string;
  backLabel?: string;
  context?: string;
}

export default function Header({ 
  variant = "default", 
  showNav = true, 
  backHref, 
  backLabel = "Back",
  context 
}: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/workshops", label: "Workshops" },
    { href: "/sculptures", label: "Gallery" },
    { href: "/shop", label: "Shop" },
    { href: "/auctions", label: "Auctions" },
    { href: "/about", label: "About" },
  ];

  const isCheckoutVariant = variant === "checkout";

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="font-serif text-xl font-bold" data-testid="link-home">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] -mb-0.5 moving-fill text-transparent bg-clip-text bg-gradient-to-r from-bronze via-accent-gold to-patina">DAVID JUNOR</p>
              <span className="moving-fill">Timeless Organics</span>
              {context && (
                <p className="text-xs text-muted-foreground font-normal">{context}</p>
              )}
            </div>
          </Link>

          {!isCheckoutVariant && showNav && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={location === link.href ? "text-accent-gold" : ""}
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {!isCheckoutVariant && (
              <Link href="/founding-100">
                <Button size="sm" className="btn-bronze hidden lg:inline-flex" data-testid="button-header-founding-100">
                  Founding 100
                </Button>
              </Link>
            )}
            
            {isCheckoutVariant && backHref ? (
              <Link href={backHref}>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                  {backLabel}
                </Button>
              </Link>
            ) : isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="link-dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Button>
                </Link>

                {user?.isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2" data-testid="link-admin">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden lg:inline">Admin</span>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="gap-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={redirectToSignIn}
                className="btn-bronze gap-2"
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {!isCheckoutVariant && showNav && (
          <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={location === link.href ? "text-accent-gold" : ""}
                  data-testid={`link-nav-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
