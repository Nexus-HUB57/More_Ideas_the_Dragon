import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import Project from "./pages/Project";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/project/1" />
      </Route>
      <Route path="/project/:id" component={Project} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
      <Toaster position="top-right" theme="dark" />
    </TooltipProvider>
  );
}

export default App;
