import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookHeart, Home, CalendarDays, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/journal", label: "Journal", icon: BookHeart },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/75 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BookHeart className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-[1.15rem] font-semibold tracking-tight">
                Our Memories
              </div>
              <div className="font-script text-[0.85rem] text-muted-foreground -mt-1">
                a shared journal
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const isActive =
                item.href === "/"
                  ? location === "/"
                  : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-secondary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <Link href="/journal/new">
            <Button size="sm" className="rounded-full gap-1.5 shadow-sm">
              <PenLine className="w-4 h-4" />
              <span className="hidden sm:inline">Write a memory</span>
              <span className="sm:hidden">Write</span>
            </Button>
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/60">
          <div className="max-w-6xl mx-auto px-3 flex items-center justify-around">
            {NAV.map((item) => {
              const isActive =
                item.href === "/"
                  ? location === "/"
                  : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-medium flex flex-col items-center gap-0.5 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <motion.main
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12"
      >
        {children}
      </motion.main>

      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 text-center">
          <p className="font-script text-lg text-muted-foreground">
            Kept by the two of you, for the two of you.
          </p>
        </div>
      </footer>
    </div>
  );
}

export { withBase };
