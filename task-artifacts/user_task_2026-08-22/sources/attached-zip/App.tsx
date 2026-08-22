import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AgentsPage from "./pages/agents";
import StartupsPage from "./pages/startups";
import MissionsPage from "./pages/missions";
import FundingPage from "./pages/funding";
import CommunicationsPage from "./pages/communications";
import TelemetryPage from "./pages/telemetry";

function Router() {
  return (
    <Switch>
      <Route path={\"/{\"} component={Home} />
      <Route path={\"/agents\"} component={AgentsPage} />
      <Route path={\"/startups\"} component={StartupsPage} />
      <Route path={\"/missions\"} component={MissionsPage} />
      <Route path={\"/funding\"} component={FundingPage} />
      <Route path={\"/communications\"} component={CommunicationsPage} />
      <Route path={\"/telemetry\"} component={TelemetryPage} />
      <Route path={\"/404\"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
