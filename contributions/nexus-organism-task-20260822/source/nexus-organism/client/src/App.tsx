import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OrchestratorView from "./pages/OrchestratorView";
import Moltbook from "./pages/Moltbook";
import Genealogy from "./pages/Genealogy";
import Treasury from "./pages/Treasury";
import Governance from "./pages/Governance";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/orchestrator" component={OrchestratorView} />
      <Route path="/moltbook" component={Moltbook} />
      <Route path="/genealogy" component={Genealogy} />
      <Route path="/treasury" component={Treasury} />
      <Route path="/governance" component={Governance} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
