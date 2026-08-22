import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
const Moltbook = lazy(() => import("./pages/Moltbook"));
const ModulesPage = lazy(() => import("./pages/Modules").then(module => ({ default: module.ModulesPage })));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/moltbook"} component={Moltbook} />
      <Route path={"/governance"} component={ModulesPage} />
      <Route path={"/dna-fuser"} component={ModulesPage} />
      <Route path={"/agents"} component={ModulesPage} />
      <Route path={"/transactions"} component={ModulesPage} />
      <Route path={"/ai"} component={ModulesPage} />
      <Route path={"/forge"} component={ModulesPage} />
      <Route path={"/asset-lab"} component={ModulesPage} />
      <Route path={"/gnox"} component={ModulesPage} />
      <Route path={"/notifications"} component={ModulesPage} />
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
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<div className="min-h-screen bg-background p-8 font-mono text-cyan-300">NEXUS MODULE LOADING...</div>}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
