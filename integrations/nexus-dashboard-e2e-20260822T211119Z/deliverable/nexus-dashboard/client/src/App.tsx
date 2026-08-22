import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Startups from "./pages/Startups";
import Agents from "./pages/Agents";
import Culture from "./pages/Culture";
import ChurchPage from "./pages/Church";
import Systems from "./pages/Systems";
import Wormhole from "./pages/Wormhole";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/startups"} component={Startups} />
      <Route path={"/agents"} component={Agents} />
      <Route path={"/culture"} component={Culture} />
      <Route path={"/church"} component={ChurchPage} />
      <Route path={"/systems"} component={Systems} />
      <Route path={"/wormhole"} component={Wormhole} />
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
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
