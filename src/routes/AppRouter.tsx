import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/routes/ProtectedRoute";

/**
 * Central route configuration. Private routes are wrapped in <ProtectedRoute>
 * which redirects unauthenticated users to /login?redirect=<original-path>.
 *
 * The home route ("/") stays public so anonymous visitors can see the landing
 * experience; authenticated areas live under protected branches.
 */
export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Index />} />
      <Route path="/register" element={<Index />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Index />} />
        <Route path="/app/*" element={<Index />} />
        <Route path="/projects/*" element={<Index />} />
        <Route path="/profile" element={<Index />} />
        <Route path="/settings" element={<Index />} />
        <Route path="/notifications" element={<Index />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
