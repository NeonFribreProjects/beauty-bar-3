import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";
// import AdminLogin from "./pages/admin/Login"; // Commented out admin routes
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/booking/:serviceId" element={<Booking />} />
            <Route path="/confirmation" element={<Confirmation />} />
            {/* Commented out admin route */}
            {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
