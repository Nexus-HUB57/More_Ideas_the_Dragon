import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Agents from "./pages/Agents";
import Governance from "./pages/Governance";
import Startups from "./pages/Startups";
import Treasury from "./pages/Treasury";
import Market from "./pages/Market";
import SoulVault from "./pages/SoulVault";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/feed"} component={() => <DashboardLayout><Feed /></DashboardLayout>} />
      <Route path={"/agents"} component={() => <DashboardLayout><Agents /></DashboardLayout>} />
      <Route path={"/governance"} component={() => <DashboardLayout><Governance /></DashboardLayout>} />
      <Route path={"/startups"} component={() => <DashboardLayout><Startups /></DashboardLayout>} />
      <Route path={"/treasury"} component={() => <DashboardLayout><Treasury /></DashboardLayout>} />
      <Route path={"/market"} component={() => <DashboardLayout><Market /></DashboardLayout>} />
      <Route path={"/soul-vault"} component={() => <DashboardLayout><SoulVault /></DashboardLayout>} />
      <Route path={"/notifications"} component={() => <DashboardLayout><Notifications /></DashboardLayout>} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
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
