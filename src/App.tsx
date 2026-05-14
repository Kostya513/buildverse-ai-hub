import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppRouter from "@/routes/AppRouter";
import useSessionRestore from "@/hooks/useSessionRestore";

const queryClient = new QueryClient();

const SessionBridge = ({ children }: { children: React.ReactNode }) => {
  useSessionRestore();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SessionBridge>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" richColors closeButton theme="system" duration={3000} />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </SessionBridge>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
