import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import MemoryNew from "@/pages/MemoryNew";
import MemoryDetail from "@/pages/MemoryDetail";
import MemoryEdit from "@/pages/MemoryEdit";
import CalendarPage from "@/pages/CalendarPage";
import Insights from "@/pages/Insights";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/journal" component={Journal} />
        <Route path="/journal/new" component={MemoryNew} />
        <Route path="/journal/:id/edit" component={MemoryEdit} />
        <Route path="/journal/:id" component={MemoryDetail} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/insights" component={Insights} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
