import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import MemoryNew from "@/pages/MemoryNew";
import MemoryDetail from "@/pages/MemoryDetail";
import MemoryEdit from "@/pages/MemoryEdit";
import CalendarPage from "@/pages/CalendarPage";
import Insights from "@/pages/Insights";
import Letters from "@/pages/Letters";
import LetterNew from "@/pages/LetterNew";
import LetterDetail from "@/pages/LetterDetail";
import BucketList from "@/pages/BucketList";
import Milestones from "@/pages/Milestones";
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
        <Route path="/letters" component={Letters} />
        <Route path="/letters/new" component={LetterNew} />
        <Route path="/letters/:id" component={LetterDetail} />
        <Route path="/bucket-list" component={BucketList} />
        <Route path="/milestones" component={Milestones} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!user) return <Auth />;
  return (
    <Layout>
      <Router />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
