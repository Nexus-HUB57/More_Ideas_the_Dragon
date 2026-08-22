import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AffiliateProfile from "./pages/AffiliateProfile";
import MiniSite from "./pages/MiniSite";
import AdminPanel from "./pages/AdminPanel";
import PaymentManagement from "./pages/PaymentManagement";
import AffiliatePayments from "./pages/AffiliatePayments";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={isAuthenticated ? Dashboard : Home} />
      <Route path={"/profile"} component={isAuthenticated ? AffiliateProfile : Home} />
      <Route path={"/admin"} component={isAuthenticated && user?.role === "admin" ? AdminPanel : Home} />
      <Route path={"/admin/payments"} component={isAuthenticated && user?.role === "admin" ? PaymentManagement : Home} />
      <Route path={"/payments"} component={isAuthenticated ? AffiliatePayments : Home} />
      <Route path={"/affiliate/:code"} component={MiniSite} />
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
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
