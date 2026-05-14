import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(circle_at_75%_80%,hsl(var(--accent)/0.15),transparent_60%)]" />
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.4em] text-primary/80">BUILDVERSE</p>
        <h1 className="mt-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-7xl font-light tracking-tight text-transparent">
          404
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Маршрут <code className="rounded bg-white/10 px-2 py-0.5 text-sm">{location.pathname}</code> не найден.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80">
          Возможно, страница была перемещена или ещё не подключена к экосистеме.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
