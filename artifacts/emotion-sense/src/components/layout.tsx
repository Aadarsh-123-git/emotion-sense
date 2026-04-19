import { Link, useLocation } from "wouter";
import { Activity, History, ActivitySquare } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivitySquare className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              EmotionSense
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${location === "/" ? "text-foreground" : "text-foreground/60"}`}>
              <Activity className="h-4 w-4" /> Detection
            </Link>
            <Link href="/history" className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${location === "/history" ? "text-foreground" : "text-foreground/60"}`}>
              <History className="h-4 w-4" /> History
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
