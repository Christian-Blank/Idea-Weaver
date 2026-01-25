import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DocumentProvider, useDocuments } from "@/lib/store";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import Profile from "./pages/Profile";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useDocuments();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Auth} />
      
      <Route path="/">
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      </Route>

      <Route path="/editor/:id">
        {() => (
          <RequireAuth>
            <Editor />
          </RequireAuth>
        )}
      </Route>

      <Route path="/settings">
        <RequireAuth>
          <Settings />
        </RequireAuth>
      </Route>

      <Route path="/profile">
        <RequireAuth>
          <Profile />
        </RequireAuth>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DocumentProvider>
          <Toaster />
          <Router />
        </DocumentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
