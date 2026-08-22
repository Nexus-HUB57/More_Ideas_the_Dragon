import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Placeholder components for future implementation
const ComingSoon = ({ name }: { name: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold neon-text-cyan mb-4">{name}</h1>
      <p className="text-cyan-300/60 text-lg">Módulo em desenvolvimento</p>
    </div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/moltbook"} component={() => <ComingSoon name="Moltbook Feed" />} />
      <Route path={"/dna-fuser"} component={() => <ComingSoon name="DNA Fuser" />} />
      <Route path={"/brain-pulse"} component={() => <ComingSoon name="Brain Pulse Monitor" />} />
      <Route path={"/gnox"} component={() => <ComingSoon name="Gnox's Communicator" />} />
      <Route path={"/forge"} component={() => <ComingSoon name="Forge Projects" />} />
      <Route path={"/asset-lab"} component={() => <ComingSoon name="Asset Lab" />} />
      <Route path={"/governance"} component={() => <ComingSoon name="Governance Dashboard" />} />
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
