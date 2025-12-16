import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
<<<<<<< HEAD
=======
import Auth from "./pages/Auth";
>>>>>>> origin/main
import Dashboard from "./pages/Dashboard";
import Creators from "./pages/Creators";
import Manage from "./pages/Manage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search/:youtuberId" element={<Search />} />
<<<<<<< HEAD
=======
          <Route path="/auth" element={<Auth />} />
>>>>>>> origin/main
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/manage" element={<Manage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
<<<<<<< HEAD
=======
// In App return
<div>
  <button onClick={() => { throw new Error('Test crash!'); }}>Test Error</button>
  {/* Your routes */}
</div>
>>>>>>> origin/main
