import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Nexus Hub V3</h1>
          <p className="text-xl mb-8 text-gray-300">Soberania Total - Ecossistema Quantico de Agentes Autonomos</p>
          <Button size="lg" onClick={() => window.location.href = "/api/oauth/login"} className="bg-purple-600 hover:bg-purple-700">
            Entrar com Manus OAuth
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
