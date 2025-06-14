import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Meeting from "@/pages/meeting";
import SessionsPage from "@/pages/sessions";
import SessionDetailPage from "@/pages/session-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SessionsPage} />
      <Route path="/sessions" component={SessionsPage} />
      <Route path="/sessions/:id" component={SessionDetailPage} />
      <Route path="/meeting" component={Meeting} />
      <Route path="/meeting/:roomId" component={Meeting} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
