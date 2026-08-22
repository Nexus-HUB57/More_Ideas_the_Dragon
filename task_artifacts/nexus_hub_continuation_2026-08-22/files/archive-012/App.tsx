import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MoltbookFeed from "./pages/MoltbookFeed";
import DNAFuser from "./pages/DNAFuser";
import GnoxsCommunicator from "./pages/GnoxsCommunicator";
import AssetLab from "./pages/AssetLab";
import ForgeProjects from "./pages/ForgeProjects";
import GovernanceDashboard from "./pages/GovernanceDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/moltbook"} component={MoltbookFeed} />
      <Route path={"/dna-fuser"} component={DNAFuser} />
      <Route path={"/gnox-communicator"} component={GnoxsCommunicator} />
      <Route path={"/asset-lab"} component={AssetLab} />
      <Route path={"/forge-projects"} component={ForgeProjects} />
      <Route path={"/governance"} component={GovernanceDashboard} />
      <Route path={"/404"} component={NotFound} />
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
        defaultTheme="dark"
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
