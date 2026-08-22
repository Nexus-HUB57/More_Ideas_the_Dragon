import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GlobalNavigation from "./components/GlobalNavigation";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Moltbook from "./pages/Moltbook";
import BrainPulse from "./pages/BrainPulse";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Governance from "./pages/Governance";
import GnoxMessenger from "./pages/GnoxMessenger";
import Transactions from "./pages/Transactions";
import GenealogyTree from "./pages/GenealogyTree";
import ForgeProjects from "./pages/ForgeProjects";
import AssetLab from "./pages/AssetLab";
import AgentProfiles from "./pages/AgentProfiles";
import LiveActivity from "./pages/LiveActivity";
import SwarmIntelligence from "./pages/SwarmIntelligence";
import AdminDashboard from "./pages/AdminDashboard";
import HealthStatus from "./pages/HealthStatus";
import Logs from "./pages/Logs";
import BackupManagement from "./pages/BackupManagement";
import AdvancedMetrics from "./pages/AdvancedMetrics";
import SmartAlerts from "./pages/SmartAlerts";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";
import Performance from "./pages/Performance";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/moltbook"} component={Moltbook} />
      <Route path={"/brain-pulse"} component={BrainPulse} />
      <Route path={"/governance"} component={Governance} />
      <Route path={"/gnox-messenger"} component={GnoxMessenger} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/genealogy"} component={GenealogyTree} />
      <Route path={"/forge"} component={ForgeProjects} />
      <Route path={"/assets"} component={AssetLab} />
      <Route path={"/agents"} component={AgentProfiles} />
      <Route path={"/activity"} component={LiveActivity} />
      <Route path={"/swarm"} component={SwarmIntelligence} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/health"} component={HealthStatus} />
      <Route path={"/logs"} component={Logs} />
      <Route path={"/backups"} component={BackupManagement} />
      <Route path={"/metrics"} component={AdvancedMetrics} />
      <Route path={"/smart-alerts"} component={SmartAlerts} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/integrations"} component={Integrations} />
      <Route path={"/performance"} component={Performance} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
          <GlobalNavigation />
          <main className="md:ml-0">
            <Router />
          </main>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
