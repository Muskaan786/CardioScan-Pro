import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import Obesity from "./pages/Obesity";
import NotFound from "./pages/NotFound";
import { HeartPulse } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          <SiteHeader />
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/obesity" element={<Obesity />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <SiteFooter />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-neutral-900/95 dark:border-neutral-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
            <HeartPulse className="h-6 w-6" />
          </span>
          <div className="hidden sm:flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">CardioScan Pro</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">AI Heart Disease Analysis</span>
          </div>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/obesity" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Obesity & CVD
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HeartPulse className="h-5 w-5 text-red-500" />
            <span className="font-semibold">CardioScan Pro</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            AI-Powered Heart Disease Analysis System for Medical Professionals
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Advanced OCR & Medical AI Technology.
          </p>
        
        </div>
      </div>
    </footer>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
