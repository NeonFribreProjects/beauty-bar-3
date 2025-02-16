import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import Home from "@/pages/Home";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import { ErrorBoundary } from '@/components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/index" element={<Index />} />
      <Route path="/booking/:serviceId" element={<Booking />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ErrorBoundary>
);

export default App; 