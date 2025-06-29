import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import SessionsPage from '@/pages/sessions';
import SessionDetailPage from '@/pages/session-detail';
import Meeting from '@/pages/meeting';
import NotFound from '@/pages/not-found';
import { queryClient } from '@/lib/queryClient';
import './index.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={SessionsPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/sessions/:id" component={SessionDetailPage} />
          <Route path="/meeting/:roomId?" component={Meeting} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;