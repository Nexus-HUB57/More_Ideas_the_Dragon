import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardPage from "./pages/Dashboard";
import NetworkPage from "./pages/Network";
import AgentPage from "./pages/Agent";
import CommissionsPage from "./pages/Commissions";
import MarketplacePage from "./pages/Marketplace";
import ProfilePage from "./pages/Profile";
import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "network":
        return <NetworkPage />;
      case "agent":
        return <AgentPage />;
      case "commissions":
        return <CommissionsPage />;
      case "marketplace":
        return <MarketplacePage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Switch>
      <Route path="/" component={() => (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </DashboardLayout>
      )} />
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
