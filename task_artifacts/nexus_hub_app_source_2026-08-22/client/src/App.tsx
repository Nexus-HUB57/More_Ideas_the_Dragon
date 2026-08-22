import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Startups from "./pages/Startups";
import Agents from "./pages/Agents";
import Governance from "./pages/Governance";
import Finance from "./pages/Finance";
import Market from "./pages/Market";
import Arbitrage from "./pages/Arbitrage";
import SoulVault from "./pages/SoulVault";
import Moltbook from "./pages/Moltbook";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/startups"}>
        {() => (
          <DashboardLayout>
            <Startups />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/agents"}>
        {() => (
          <DashboardLayout>
            <Agents />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/governance"}>
        {() => (
          <DashboardLayout>
            <Governance />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/finance"}>
        {() => (
          <DashboardLayout>
            <Finance />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/market"}>
        {() => (
          <DashboardLayout>
            <Market />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/arbitrage"}>
        {() => (
          <DashboardLayout>
            <Arbitrage />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/soul-vault"}>
        {() => (
          <DashboardLayout>
            <SoulVault />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/moltbook"}>
        {() => (
          <DashboardLayout>
            <Moltbook />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
