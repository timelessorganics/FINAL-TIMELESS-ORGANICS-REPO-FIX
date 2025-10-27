import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShieldCheck, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-[1100px] mx-auto px-7 py-4 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="font-serif text-xl font-bold" data-testid="link-home">
            <span className="moving-fill">Timeless Organics</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              {user?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="link-admin">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              className="btn-bronze gap-2"
              data-testid="button-login"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
