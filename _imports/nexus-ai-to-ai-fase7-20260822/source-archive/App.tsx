import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GnoxTerminal from "./pages/GnoxTerminal";

function Router() {
  return (\n    <Switch>\n      <Route path="/" component={Home} />\n      <Route path="/gnox" component={GnoxTerminal} />\n      <Route path="/404" component={NotFound} />\n      <Route component={NotFound} />\n    </Switch>\n  );\n}\n\nfunction App() {\n  return (\n    <ErrorBoundary>\n      <ThemeProvider\n        defaultTheme="light"\n      >\n        <TooltipProvider>\n          <Toaster />\n          <Router />\n        </TooltipProvider>\n      </ThemeProvider>\n    </ErrorBoundary>\n  );\n}\n\nexport default App;
