import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShieldCheck, LogIn, ArrowLeft, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { signOut, redirectToSignIn } from "@/lib/auth-helpers";
import { useState } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/workshops", label: "Workshops" },
    { href: "/sculptures", label: "Gallery" },
    { href: "/seasonal-guide", label: "Seasons" },
    { href: "/shop", label: "Shop" },
    { href: "/auctions", label: "Auctions" },
    { href: "/about", label: "About" },
  ];

  const isCheckoutVariant = variant === "checkout";

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            <Link href="/" className="font-serif text-lg sm:text-xl font-bold" data-testid="link-home">
              <div>
                <p className="text-xs text-muted-foreground font-normal">David Junor</p>
                <span className="moving-fill block pt-1">Timeless Organics</span>
                {context && (
                  <p className="text-xs text-muted-foreground font-normal">{context}</p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
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
              {/* Mobile Menu Toggle */}
              {!isCheckoutVariant && showNav && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu-toggle"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}

              {!isCheckoutVariant && (
                <Link href="/founding-100#seats">
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
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && !isCheckoutVariant && showNav && (
        <div className="fixed inset-0 top-[var(--header-height)] z-[99] bg-background/95 backdrop-blur-sm md:hidden" data-testid="mobile-menu-overlay">
          <nav className="flex flex-col p-4 gap-1 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location === link.href ? "text-accent-gold bg-accent-gold/10" : ""}`}
                  onClick={handleNavLinkClick}
                  data-testid={`link-nav-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            
            {/* Mobile Founding 100 Link */}
            <Link href="/founding-100#seats">
              <Button
                className="w-full justify-start btn-bronze"
                onClick={handleNavLinkClick}
                data-testid="button-mobile-founding-100"
              >
                Founding 100 Fire Sale
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
