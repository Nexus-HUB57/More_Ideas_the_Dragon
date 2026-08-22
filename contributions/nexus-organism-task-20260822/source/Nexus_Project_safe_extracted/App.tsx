import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { WebSocketStatus } from "./components/WebSocketStatus";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import VitalLoopMonitor from "./pages/VitalLoopMonitor";
import MarketFeed from "./pages/MarketFeed";
import GnoxTerminal from "./pages/GnoxTerminal";
import OrchestratorView from "./pages/OrchestratorView";
import { AppLayout } from "./components/AppLayout";
import { CommandPalette } from "./components/CommandPalette";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { isAuthenticated } = useAuth();

  // Public routes
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Protected routes with layout
  return (
    <AppLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/vitals"} component={VitalLoopMonitor} />
        <Route path={"/market"} component={MarketFeed} />
        <Route path={"/terminal"} component={GnoxTerminal} />
        <Route path={"/orchestrator"} component={OrchestratorView} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <WebSocketProvider>
          <TooltipProvider>
            <Toaster />
            <CommandPalette />
            <Router />
          </TooltipProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
